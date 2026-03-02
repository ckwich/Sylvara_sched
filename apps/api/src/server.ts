import Fastify from 'fastify';
import { prisma } from '@sylvara/db';
import { fileURLToPath } from 'node:url';
import { registerSchedulingRoutes } from './routes/scheduling.js';

export function buildServer(deps: { prisma: typeof prisma } = { prisma }) {
  const app = Fastify();

  app.get('/health', async () => {
    return { ok: true };
  });

  registerSchedulingRoutes(app, { prisma: deps.prisma });

  return app;
}

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const app = buildServer();
  const port = Number(process.env.API_PORT ?? 4000);
  const host = process.env.API_HOST ?? '0.0.0.0';

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
