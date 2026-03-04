import { spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.captureOutput ? 'pipe' : 'inherit',
    shell: process.platform === 'win32',
    env: options.env ?? process.env,
    encoding: options.captureOutput ? 'utf8' : undefined,
  });
  return {
    status: result.status ?? 1,
    stdout: typeof result.stdout === 'string' ? result.stdout : '',
    stderr: typeof result.stderr === 'string' ? result.stderr : '',
  };
}

export function isRetryablePrismaGenerateError(result) {
  const text = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.toLowerCase();
  return text.includes('eperm') || text.includes('ebusy');
}

export async function runWithRetry(input) {
  const {
    command,
    args,
    env,
    attempts = 1,
    baseDelayMs = 500,
    shouldRetry = () => false,
    runner = runCommand,
  } = input;

  let lastResult = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const captureOutput = attempt < attempts;
    const result = runner(command, args, { env, captureOutput });
    lastResult = result;

    if (result.status === 0) {
      return result;
    }

    const canRetry = attempt < attempts && shouldRetry(result);
    if (!canRetry) {
      return result;
    }

    const delayMs = baseDelayMs * attempt;
    console.warn(
      `Command failed with retryable error (attempt ${attempt}/${attempts}). Retrying in ${delayMs}ms...`,
    );
    await sleep(delayMs);
  }

  return lastResult ?? { status: 1, stdout: '', stderr: '' };
}
