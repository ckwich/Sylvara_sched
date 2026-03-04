import { setTimeout as sleep } from 'node:timers/promises';
import {
  isRetryablePrismaGenerateError,
  runCommand,
  runWithRetry,
} from './prisma-command-runner.mjs';

function run(command, args, env = process.env) {
  const result = runCommand(command, args, {
    env,
    captureOutput: false,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function validateTestDatabaseUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    console.error('TEST_DATABASE_URL must be a valid URL.');
    process.exit(1);
  }

  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    console.error(
      `TEST_DATABASE_URL must use postgres protocol (postgresql:// or postgres://). Received ${parsed.protocol}`,
    );
    process.exit(1);
  }

  return parsed;
}

function buildPrismaEnv(databaseUrl) {
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
  };
  delete env.PRISMA_GENERATE_NO_ENGINE;
  return env;
}

function canUseExistingGeneratedClient(env) {
  const probe = runCommand(
    'corepack',
    [
      'pnpm',
      '--filter',
      '@sylvara/db',
      'exec',
      'node',
      '-e',
      'import("@prisma/client").then(() => process.exit(0)).catch(() => process.exit(1))',
    ],
    { env, captureOutput: true },
  );
  return probe.status === 0;
}

async function waitForPostgres() {
  for (let i = 0; i < 60; i += 1) {
    const probe = runCommand(
      'docker',
      ['compose', '-f', 'docker-compose.test.yml', 'exec', '-T', 'postgres-test', 'pg_isready', '-U', 'postgres', '-d', 'sylvara_test'],
      {
        captureOutput: true,
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

const parsedTestDatabaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
console.log(
  `Integration DB target: ${parsedTestDatabaseUrl.protocol}//${parsedTestDatabaseUrl.hostname}:${parsedTestDatabaseUrl.port || '5432'}${parsedTestDatabaseUrl.pathname}`,
);

run('docker', ['compose', '-f', 'docker-compose.test.yml', 'up', '-d']);
await waitForPostgres();

const prismaEnv = buildPrismaEnv(process.env.TEST_DATABASE_URL);
const shouldRunGenerate =
  process.env.INTEGRATION_RUN_PRISMA_GENERATE === 'true' || process.platform !== 'win32';

if (shouldRunGenerate) {
  const generateResult = await runWithRetry({
    command: 'corepack',
    args: ['pnpm', '--filter', '@sylvara/db', 'prisma:generate'],
    env: prismaEnv,
    attempts: 3,
    baseDelayMs: 750,
    shouldRetry: isRetryablePrismaGenerateError,
    runner: (command, args, options) =>
      runCommand(command, args, { ...options, captureOutput: true }),
  });
  if (generateResult.status !== 0) {
    if (generateResult.stderr) {
      console.error(generateResult.stderr);
    }
    if (generateResult.stdout) {
      console.error(generateResult.stdout);
    }
    if (
      isRetryablePrismaGenerateError(generateResult) &&
      canUseExistingGeneratedClient(prismaEnv)
    ) {
      console.warn(
        'Proceeding with existing generated Prisma client after retryable prisma:generate lock failure.',
      );
    } else {
      process.exit(generateResult.status ?? 1);
    }
  }
} else {
  console.log(
    'Skipping prisma:generate on Windows for integration harness reliability. Set INTEGRATION_RUN_PRISMA_GENERATE=true to force generation.',
  );
}

run(
  'corepack',
  ['pnpm', '--filter', '@sylvara/db', 'prisma:migrate:deploy'],
  prismaEnv,
);

run(
  'corepack',
  ['pnpm', '--filter', '@sylvara/api', 'test:integration'],
  prismaEnv,
);
