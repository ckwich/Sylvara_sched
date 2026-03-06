import { expect, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

type SeedResult = {
  actorUserId: string;
  foremanPersonId: string;
  rosterId: string;
  jobId: string;
  date: string;
};

type SeedOutput = {
  actorUserId: string;
  date: string;
  foremanPersonId?: string;
  rosterId?: string;
  jobId?: string;
  foremanIds?: string[];
  rosterIds?: string[];
  jobIds?: string[];
};

const E2E_WEB_BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${process.env.E2E_WEB_PORT ?? '3100'}`;
const E2E_API_BASE_URL = process.env.E2E_API_BASE_URL ?? `http://127.0.0.1:${process.env.E2E_API_PORT ?? '4100'}`;
const E2E_API_PORT = process.env.E2E_API_PORT ?? '4100';

function apiUrl(path: string): string {
  return `${E2E_API_BASE_URL}${path}`;
}

function e2eCommandEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    API_PORT: E2E_API_PORT,
    API_BASE_URL: E2E_API_BASE_URL,
  };
}

function parseJsonFromOutput(output: string): SeedResult {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end < start) {
    throw new Error(`Unable to parse JSON from output: ${output}`);
  }
  const parsed = JSON.parse(output.slice(start, end + 1)) as SeedOutput;
  const foremanPersonId = parsed.foremanPersonId ?? parsed.foremanIds?.[0];
  const rosterId = parsed.rosterId ?? parsed.rosterIds?.[0];
  const jobId = parsed.jobId ?? parsed.jobIds?.[0];
  if (!parsed.actorUserId || !parsed.date || !foremanPersonId || !rosterId || !jobId) {
    throw new Error(`Seed output missing required fields: ${output}`);
  }
  return {
    actorUserId: parsed.actorUserId,
    date: parsed.date,
    foremanPersonId,
    rosterId,
    jobId,
  };
}

async function waitForReady(request: APIRequestContext) {
  const webHealth = await request.get(`${E2E_WEB_BASE_URL}/api/web-health`);
  expect(webHealth.ok(), `web health failed with ${webHealth.status()}`).toBeTruthy();

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const apiHealth = await request.get(apiUrl('/api/health'));
    if (apiHealth.ok()) {
      return;
    }
    if (attempt < 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }
    throw new Error(`API health never became ready: status=${apiHealth.status()}`);
  }
}

async function seedFixtures(date = '2026-03-03'): Promise<SeedResult> {
  const result = spawnSync('corepack', ['pnpm', '--filter', '@sylvara/api', 'seed:lan-demo', '--', `--date=${date}`], {
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    env: e2eCommandEnv(),
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
    env: e2eCommandEnv(),
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

  const onsite = await request.post(apiUrl('/api/schedule-segments'), {
    headers: { 'x-actor-user-id': String(seed.actorUserId) },
    data: {
      jobId: seed.jobId,
      rosterId: seed.rosterId,
      startDatetime: `${seed.date}T14:00:00.000Z`,
      endDatetime: `${seed.date}T15:00:00.000Z`,
    },
  });
  expect(onsite.ok()).toBeTruthy();

  const firstClose = await request.post(apiUrl('/api/travel/close-out-day'), {
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

  const secondClose = await request.post(apiUrl('/api/travel/close-out-day'), {
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
    apiUrl(`/api/foremen/${seed.foremanPersonId}/schedule?date=${seed.date}&includeTravel=true`),
  );
  expect(scheduleRead.ok()).toBeTruthy();
  const scheduleBody = (await scheduleRead.json()) as {
    travelSegments?: Array<{ travelType: string; deletedAt?: string | null }>;
  };
  const activeEndTravelCount =
    scheduleBody.travelSegments?.filter((segment) => segment.travelType === 'END_OF_DAY').length ?? 0;
  expect(activeEndTravelCount).toBe(1);
});
