import { expect, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

type SeedResult = {
  actorUserId: number;
  foremanPersonId: number;
  rosterId: number;
  jobId: number;
  date: string;
};

function parseJsonFromOutput(output: string): SeedResult {
  const start = output.lastIndexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end < start) {
    throw new Error(`Unable to parse JSON from output: ${output}`);
  }
  return JSON.parse(output.slice(start, end + 1)) as SeedResult;
}

async function waitForReady(request: APIRequestContext) {
  const webHealth = await request.get('/api/web-health');
  expect(webHealth.ok()).toBeTruthy();
  const apiHealth = await request.get('/api/health');
  expect(apiHealth.ok()).toBeTruthy();
}

async function seedFixtures(date = '2026-03-03'): Promise<SeedResult> {
  const result = spawnSync('corepack', ['pnpm', '--filter', '@sylvara/api', 'seed:lan-demo', '--', `--date=${date}`], {
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    env: process.env,
    encoding: 'utf8',
  });
  expect(result.status).toBe(0);
  return parseJsonFromOutput((result.stdout ?? '') + (result.stderr ?? ''));
}

async function resetScheduleDay(input: { date: string; foremanPersonId: number; jobId?: number }) {
  const args = [
    'pnpm',
    '-w',
    'reset:schedule-day',
    '--',
    `--date=${input.date}`,
    `--foremanPersonId=${input.foremanPersonId}`,
  ];
  if (input.jobId) {
    args.push(`--jobId=${input.jobId}`);
  }
  const result = spawnSync('corepack', args, {
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    env: process.env,
    encoding: 'utf8',
  });
  expect(result.status).toBe(0);
}

test('B2 dispatch click-to-create snap and no overlap', async ({ request }) => {
  await waitForReady(request);
  const seed = await seedFixtures();
  await resetScheduleDay({
    date: seed.date,
    foremanPersonId: seed.foremanPersonId,
  });

  const firstCreate = await request.post('/api/schedule-segments', {
    headers: { 'x-actor-user-id': String(seed.actorUserId) },
    data: {
      jobId: seed.jobId,
      rosterId: seed.rosterId,
      startDatetime: `${seed.date}T14:10:00.000Z`,
      endDatetime: `${seed.date}T16:10:00.000Z`,
    },
  });
  const firstCreateBody = await firstCreate.text();
  expect(
    firstCreate.ok(),
    `create failed status=${firstCreate.status()} body=${firstCreateBody}`,
  ).toBeTruthy();

  const conflict = await request.post('/api/schedule-segments', {
    headers: { 'x-actor-user-id': String(seed.actorUserId) },
    data: {
      jobId: seed.jobId,
      rosterId: seed.rosterId,
      startDatetime: `${seed.date}T15:00:00.000Z`,
      endDatetime: `${seed.date}T16:00:00.000Z`,
    },
  });
  expect(conflict.status()).toBe(409);
  const conflictBody = (await conflict.json()) as { error?: { code?: string } };
  expect(conflictBody.error?.code).toBe('SCHEDULE_CONFLICT');
});
