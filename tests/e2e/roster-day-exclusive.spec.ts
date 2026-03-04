import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';

test('B1 roster exclusivity in UI', async () => {
  const result = spawnSync(
    'corepack',
    [
      'pnpm',
      '--filter',
      '@sylvara/api',
      'exec',
      'tsx',
      'scripts/e2e-roster-exclusivity-check.ts',
    ],
    {
      cwd: process.cwd(),
      shell: process.platform === 'win32',
      env: process.env,
      encoding: 'utf8',
    },
  );

  expect(result.status).toBe(0);
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const start = output.lastIndexOf('{');
  const end = output.lastIndexOf('}');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const parsed = JSON.parse(output.slice(start, end + 1)) as { ok: boolean };
  expect(parsed.ok).toBe(true);
});
