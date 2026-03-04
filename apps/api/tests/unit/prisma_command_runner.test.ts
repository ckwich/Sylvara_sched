import { describe, expect, test } from 'vitest';
import {
  isRetryablePrismaGenerateError,
  runWithRetry,
} from '../../../../scripts/prisma-command-runner.mjs';

describe('prisma command retry wrapper', () => {
  test('retries once for EPERM and then succeeds', async () => {
    let calls = 0;
    const runner = () => {
      calls += 1;
      if (calls === 1) {
        return { status: 1, stdout: '', stderr: 'EPERM: operation not permitted' };
      }
      return { status: 0, stdout: '', stderr: '' };
    };

    const result = await runWithRetry({
      command: 'noop',
      args: [],
      attempts: 3,
      baseDelayMs: 1,
      shouldRetry: isRetryablePrismaGenerateError,
      runner,
    });

    expect(result.status).toBe(0);
    expect(calls).toBe(2);
  });
});
