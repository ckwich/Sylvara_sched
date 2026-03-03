import Fastify from 'fastify';
import { prisma } from '@sylvara/db';
import { fileURLToPath } from 'node:url';
import { UNAUTHENTICATED_ERROR } from './http/actor.js';
import {
  getLanUserHeader,
  hasActorIdHeader,
  hasValidLanBearer,
  isStrongLanSharedSecret,
  isLanModeEnabled,
  isWriteMethod,
  MIN_LAN_SHARED_SECRET_LENGTH,
} from './http/lan-guard.js';
import { registerSchedulingRoutes } from './routes/scheduling.js';

type ServerAuthConfig = {
  lanModeEnabled: boolean;
  lanSharedSecret: string | null;
};

export function buildServer(
  deps: { prisma: typeof prisma } = { prisma },
  authConfig?: ServerAuthConfig,
) {
  const app = Fastify();
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

  app.addHook('preHandler', async (request, reply) => {
    if (!lanModeEnabled) {
      return;
    }

    const path = request.raw.url?.split('?')[0] ?? '';
    if (!path.startsWith('/api/')) {
      return;
    }
    if (request.method === 'GET' && path === '/api/health') {
      return;
    }
    if (!lanSharedSecret || !hasValidLanBearer(request, lanSharedSecret)) {
      return reply.code(401).send(UNAUTHENTICATED_ERROR);
    }
    if (isWriteMethod(request.method)) {
      if (!getLanUserHeader(request)) {
        return reply.code(401).send(UNAUTHENTICATED_ERROR);
      }
      if (hasActorIdHeader(request)) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'x-actor-user-id is not allowed in LAN mode.',
          },
        });
      }
    }
  });

  registerSchedulingRoutes(app, { prisma: deps.prisma });

  return app;
}

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const app = buildServer();
  const port = Number(process.env.API_PORT ?? 4000);
  const host = process.env.HOST_BIND ?? process.env.API_HOST ?? '127.0.0.1';

  app
    .listen({ port, host })
    .then(() => {
      app.log.info(`API listening on ${host}:${port}`);
    })
    .catch((error) => {
      app.log.error(error);
      process.exit(1);
    });
}
