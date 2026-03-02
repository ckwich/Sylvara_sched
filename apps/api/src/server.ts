import Fastify from 'fastify';

export function buildServer() {
  const app = Fastify();

  app.get('/health', async () => {
    return { ok: true };
  });

  return app;
}

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
