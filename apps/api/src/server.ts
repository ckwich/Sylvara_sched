import 'dotenv/config';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { prisma } from '@sylvara/db';
import { fileURLToPath } from 'node:url';
import { createAuthPreHandler, type TokenVerifier, type ClerkIdResolver } from './http/jwt-auth.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerConflictRoutes } from './routes/conflicts.js';
import { registerJobRoutes } from './routes/jobs.js';
import { registerReportRoutes } from './routes/reports.js';
import { registerSnapshotRoutes } from './routes/snapshots.js';
import { registerSchedulingRoutes } from './routes/scheduling.js';
import { registerPushupRoutes } from './routes/pushup.js';
import { registerWebhookRoutes } from './routes/webhooks.js';
import { startWeeklySnapshotJob } from './jobs/weekly-snapshot-job.js';

function resolveCorsOrigins(input: { rawValue: string | undefined; nodeEnv: string | undefined }): {
  origins: Set<string>;
  warning: string | null;
} {
  if (input.rawValue && input.rawValue.trim()) {
    return {
      origins: new Set(
        input.rawValue
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0),
      ),
      warning: null,
    };
  }

  if (input.nodeEnv === 'development') {
    return {
      origins: new Set(['http://localhost:3000', 'http://localhost:3100']),
      warning: null,
    };
  }

  return {
    origins: new Set<string>(),
    warning: 'CORS_ALLOWED_ORIGINS is not configured; CORS requests will be denied.',
  };
}

export function buildServer(
  deps: { prisma: typeof prisma } = { prisma },
  authConfig?: { verifyToken?: TokenVerifier; resolveByClerkId?: ClerkIdResolver },
) {
  const app = Fastify();
  const corsConfig = resolveCorsOrigins({
    rawValue: process.env.CORS_ALLOWED_ORIGINS,
    nodeEnv: process.env.NODE_ENV,
  });
  const corsAllowedOrigins = corsConfig.origins;
  if (corsConfig.warning) {
    app.log.warn(corsConfig.warning);
  }
  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }
      let normalizedOrigin: string;
      try {
        normalizedOrigin = new URL(origin).origin;
      } catch {
        cb(new Error('Not allowed by CORS'), false);
        return;
      }
      if (corsAllowedOrigins.has(normalizedOrigin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });

  app.get('/health', async () => {
    return { ok: true, timestamp: new Date().toISOString() };
  });

  app.get('/api/health', async () => {
    return { ok: true };
  });

  // Build the ClerkIdResolver for production: looks up the local user by
  // clerkId column when publicMetadata is missing from the Clerk JWT.
  // When the fallback fires, we also repair the stale Clerk publicMetadata
  // so future JWTs (and client-side useUser()) have the correct role.
  // Tests inject their own verifyToken and don't need this fallback.
  const resolveByClerkId: ClerkIdResolver | undefined =
    authConfig?.resolveByClerkId ??
    (!authConfig?.verifyToken
      ? async (clerkId: string) => {
          try {
            const user = await deps.prisma.user.findUnique({
              where: { clerkId },
            });
            if (!user || !user.active) return null;
            const role = user.role as string;
            if (!['MANAGER', 'SCHEDULER', 'VIEWER'].includes(role)) return null;

            // Fire-and-forget: repair stale/missing Clerk publicMetadata so the
            // client-side useUser() reflects the correct role on next page load.
            try {
              const { getClerkClient } = await import('./lib/clerk-client.js');
              const clerk = getClerkClient();
              void clerk.users.updateUserMetadata(clerkId, {
                publicMetadata: { userId: user.id, role },
              }).catch((err: unknown) => {
                console.error('[clerk-fallback] Failed to repair publicMetadata:', err instanceof Error ? err.message : err);
              });
            } catch {
              // getClerkClient may throw if CLERK_SECRET_KEY is missing — non-fatal
            }

            return { userId: user.id, role: role as 'MANAGER' | 'SCHEDULER' | 'VIEWER' };
          } catch {
            return null;
          }
        }
      : undefined);

  app.addHook('preHandler', createAuthPreHandler(authConfig?.verifyToken, resolveByClerkId));

  app.setErrorHandler((error, _request, reply) => {
    app.log.error({ err: error }, 'Unhandled route error');
    const statusCode =
      typeof (error as { statusCode?: unknown }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : 500;
    const isServerError = statusCode >= 500;
    const code =
      !isServerError && typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : 'INTERNAL_ERROR';
    const message =
      isServerError
        ? 'An unexpected server error occurred.'
        : typeof (error as { message?: unknown }).message === 'string'
          ? ((error as { message: string }).message)
          : 'Request failed.';

    reply.code(statusCode).send({
      error: {
        code,
        message,
      },
    });
  });

  registerSchedulingRoutes(app, { prisma: deps.prisma });
  registerAdminRoutes(app, { prisma: deps.prisma });
  registerConflictRoutes(app, { prisma: deps.prisma });
  registerJobRoutes(app, { prisma: deps.prisma });
  registerReportRoutes(app, { prisma: deps.prisma });
  registerSnapshotRoutes(app, { prisma: deps.prisma });
  registerPushupRoutes(app, { prisma: deps.prisma });
  registerWebhookRoutes(app, { prisma: deps.prisma });

  return app;
}

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const app = buildServer();
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  const host = process.env.HOST_BIND ?? process.env.API_HOST ?? '0.0.0.0';
  let stopWeeklySnapshotJob: (() => void) | null = null;

  app
    .listen({ port, host })
    .then(async () => {
      await prisma.$queryRaw`SELECT 1`;
      stopWeeklySnapshotJob = startWeeklySnapshotJob({
        prisma,
        logInfo: (message) => app.log.info(message),
        logError: (message, error) => app.log.error({ err: error }, message),
      });
      app.log.info(`API listening on ${host}:${port}`);
    })
    .catch((error) => {
      app.log.error(error);
      process.exit(1);
    });

  const shutdown = async () => {
    stopWeeklySnapshotJob?.();
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => {
    void shutdown();
  });
  process.on('SIGTERM', () => {
    void shutdown();
  });
}
