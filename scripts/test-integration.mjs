import { spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function waitForPostgres() {
  for (let i = 0; i < 60; i += 1) {
    const probe = spawnSync(
      'docker',
      ['compose', '-f', 'docker-compose.test.yml', 'exec', '-T', 'postgres-test', 'pg_isready', '-U', 'postgres', '-d', 'sylvara_test'],
      {
        stdio: 'ignore',
        shell: process.platform === 'win32',
      },
    );
    if (probe.status === 0) {
      return;
    }
    await sleep(1000);
  }

  console.error('Timed out waiting for test postgres to become ready.');
  process.exit(1);
}

if (!process.env.TEST_DATABASE_URL) {
  console.error('TEST_DATABASE_URL is required.');
  process.exit(1);
}

run('docker', ['compose', '-f', 'docker-compose.test.yml', 'up', '-d']);
await waitForPostgres();

run(
  'corepack',
  ['pnpm', '--filter', '@sylvara/db', 'prisma:migrate:deploy'],
  {
    ...process.env,
    DATABASE_URL: process.env.TEST_DATABASE_URL,
  },
);

run(
  'corepack',
  ['pnpm', '--filter', '@sylvara/api', 'test:integration'],
  {
    ...process.env,
    DATABASE_URL: process.env.TEST_DATABASE_URL,
  },
);
