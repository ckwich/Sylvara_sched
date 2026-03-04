import { expect, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

type SeedResult = {
  actorUserId: number;
  foremanPersonId: number;
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

test('B3 one-click schedule accept/reject', async ({ request }) => {
  await waitForReady(request);
  const seed = await seedFixtures();
  await resetScheduleDay({
    date: seed.date,
    foremanPersonId: seed.foremanPersonId,
  });

  const accept = await request.post('/api/schedule/one-click-attempt', {
    headers: { 'x-actor-user-id': String(seed.actorUserId) },
    data: {
      jobId: seed.jobId,
      foremanPersonId: seed.foremanPersonId,
      date: seed.date,
      requestedStartMinute: 550,
    },
  });
  const acceptText = await accept.text();
  expect(accept.ok(), `accept failed status=${accept.status()} body=${acceptText}`).toBeTruthy();
  const acceptBody = JSON.parse(acceptText) as { result?: string; segment?: { id: number } };
  expect(acceptBody.result).toBe('ACCEPT');
  expect(acceptBody.segment?.id).toBeTruthy();

  const reject = await request.post('/api/schedule/one-click-attempt', {
    headers: { 'x-actor-user-id': String(seed.actorUserId) },
    data: {
      jobId: seed.jobId,
      foremanPersonId: seed.foremanPersonId,
      date: seed.date,
      requestedStartMinute: 1080,
    },
  });
  expect(reject.ok()).toBeTruthy();
  const rejectBody = (await reject.json()) as { result?: string; code?: string };
  expect(rejectBody.result).toBe('REJECT');
  if (rejectBody.code) {
    expect(rejectBody.code).toBe('CUSTOMER_WINDOW_CONFLICT');
  }
});
