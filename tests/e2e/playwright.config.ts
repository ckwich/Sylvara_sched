import { defineConfig } from '@playwright/test';

const databaseUrl =
  process.env.E2E_DATABASE_URL?.startsWith('postgresql://')
    ? process.env.E2E_DATABASE_URL
    : process.env.DATABASE_URL?.startsWith('postgresql://')
      ? process.env.DATABASE_URL
      : process.env.TEST_DATABASE_URL?.startsWith('postgresql://')
        ? process.env.TEST_DATABASE_URL
        : null;
const e2eWebPort = process.env.E2E_WEB_PORT ?? '3100';
const e2eApiPort = process.env.E2E_API_PORT ?? '4100';

export default defineConfig({
  testDir: '.',
  retries: 0,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://127.0.0.1:${e2eWebPort}`,
  },
  webServer: [
    {
      command:
        'cmd /c "corepack pnpm --filter @sylvara/db exec prisma migrate deploy && corepack pnpm --filter @sylvara/api dev"',
      url: `http://127.0.0.1:${e2eApiPort}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        LAN_MODE: 'false',
        ...(databaseUrl ? { DATABASE_URL: databaseUrl } : {}),
        API_PORT: e2eApiPort,
        HOST_BIND: '127.0.0.1',
      },
    },
    {
      command: 'cmd /c corepack pnpm --filter @sylvara/web dev',
      url: `http://127.0.0.1:${e2eWebPort}/api/web-health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        LAN_MODE: 'false',
        API_PORT: e2eApiPort,
        WEB_PORT: e2eWebPort,
        HOST_BIND: '127.0.0.1',
      },
    },
  ],
});
