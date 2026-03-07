import 'dotenv/config';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { prisma } from '@sylvara/db';
import { fileURLToPath } from 'node:url';
import { createJwtAuthPreHandler } from './http/jwt-auth.js';
import { isLanModeEnabled, isStrongLanSharedSecret, MIN_LAN_SHARED_SECRET_LENGTH } from './http/lan-guard.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerJobRoutes } from './routes/jobs.js';
import { registerSnapshotRoutes } from './routes/snapshots.js';
import { registerSchedulingRoutes } from './routes/scheduling.js';
import { startWeeklySnapshotJob } from './jobs/weekly-snapshot-job.js';

type ServerAuthConfig = {
  lanModeEnabled: boolean;
  lanSharedSecret: string | null;
};

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3100',
  'http://127.0.0.1:3100',
];

function resolveCorsOrigins(rawValue: string | undefined): Set<string> {
  if (!rawValue || !rawValue.trim()) {
    return new Set(DEFAULT_CORS_ORIGINS);
  }
  return new Set(
    rawValue
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  );
}

export function buildServer(
  deps: { prisma: typeof prisma } = { prisma },
  authConfig?: ServerAuthConfig,
) {
  const app = Fastify();
  const corsAllowedOrigins = resolveCorsOrigins(process.env.CORS_ALLOWED_ORIGINS);
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
    allowedHeaders: ['Authorization', 'Content-Type', 'x-lan-user', 'x-actor-user-id'],
    credentials: true,
  });

  const lanModeEnabled = authConfig?.lanModeEnabled ?? isLanModeEnabled(process.env.LAN_MODE);
  const lanSharedSecret = authConfig?.lanSharedSecret ?? process.env.LAN_SHARED_SECRET ?? null;
  if (lanModeEnabled && !isStrongLanSharedSecret(lanSharedSecret)) {
    throw new Error(
      `LAN_SHARED_SECRET is required and must be at least ${MIN_LAN_SHARED_SECRET_LENGTH} characters when LAN_MODE=true`,
    );
  }

  app.get('/health', async () => {
    return { ok: true };
  });

  app.get('/api/health', async () => {
    return { ok: true };
  });

  app.addHook(
    'preHandler',
    createJwtAuthPreHandler({
      lanSharedSecret,
      logWarning: (message) => app.log.warn(message),
    }),
  );

  registerSchedulingRoutes(app, { prisma: deps.prisma });
  registerAdminRoutes(app, { prisma: deps.prisma });
  registerJobRoutes(app, { prisma: deps.prisma });
  registerSnapshotRoutes(app, { prisma: deps.prisma });

  return app;
}

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const app = buildServer();
  const port = Number(process.env.API_PORT ?? 4000);
  const host = process.env.HOST_BIND ?? process.env.API_HOST ?? '127.0.0.1';
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
