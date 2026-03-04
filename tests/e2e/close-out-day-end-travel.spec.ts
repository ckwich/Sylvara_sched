import { expect, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

type SeedResult = {
  actorUserId: string;
  foremanPersonId: string;
  rosterId: string;
  jobId: string;
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

async function resetScheduleDay(input: { date: string; foremanPersonId: string; jobId?: string; includeTravel?: boolean }) {
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
  if (input.includeTravel) {
    args.push('--includeTravel');
  }
  const result = spawnSync('corepack', args, {
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    env: process.env,
    encoding: 'utf8',
  });
  expect(result.status).toBe(0);
}

test('B4 close out day creates END_OF_DAY travel', async ({ request }) => {
  await waitForReady(request);
  const seed = await seedFixtures();
  await resetScheduleDay({
    date: seed.date,
    foremanPersonId: seed.foremanPersonId,
    includeTravel: true,
  });

  const onsite = await request.post('/api/schedule-segments', {
    headers: { 'x-actor-user-id': String(seed.actorUserId) },
    data: {
      jobId: seed.jobId,
      rosterId: seed.rosterId,
      startDatetime: `${seed.date}T14:00:00.000Z`,
      endDatetime: `${seed.date}T15:00:00.000Z`,
    },
  });
  expect(onsite.ok()).toBeTruthy();

  const firstClose = await request.post('/api/travel/close-out-day', {
    headers: { 'x-actor-user-id': String(seed.actorUserId) },
    data: {
      foremanPersonId: seed.foremanPersonId,
      date: seed.date,
      durationMinutes: 45,
    },
  });
  expect(firstClose.ok()).toBeTruthy();
  const firstBody = (await firstClose.json()) as { result?: string; travelSegment?: { travelType?: string } };
  expect(firstBody.result).toBe('ACCEPT');
  expect(firstBody.travelSegment?.travelType).toBe('END_OF_DAY');

  const secondClose = await request.post('/api/travel/close-out-day', {
    headers: { 'x-actor-user-id': String(seed.actorUserId) },
    data: {
      foremanPersonId: seed.foremanPersonId,
      date: seed.date,
      durationMinutes: 45,
    },
  });
  expect(secondClose.ok()).toBeTruthy();
  const secondBody = (await secondClose.json()) as { result?: string; code?: string };
  expect(['ACCEPT', 'REJECT']).toContain(secondBody.result);

  const scheduleRead = await request.get(
    `/api/foremen/${seed.foremanPersonId}/schedule?date=${seed.date}&includeTravel=true`,
  );
  expect(scheduleRead.ok()).toBeTruthy();
  const scheduleBody = (await scheduleRead.json()) as {
    travelSegments?: Array<{ travelType: string; deletedAt?: string | null }>;
  };
  const activeEndTravelCount =
    scheduleBody.travelSegments?.filter((segment) => segment.travelType === 'END_OF_DAY').length ?? 0;
  expect(activeEndTravelCount).toBe(1);
});
