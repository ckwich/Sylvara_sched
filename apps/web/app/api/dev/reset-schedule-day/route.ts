import { spawn } from 'node:child_process';
import path from 'node:path';

type ResetRequest = {
  date: string;
  foremanPersonId: number;
  jobId?: number;
  dryRun?: boolean;
};

function runCommand(command: string, args: string[], cwd: string): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      shell: process.platform === 'win32',
      env: process.env,
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      output += String(chunk);
    });
    child.on('close', (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Not found.' } }, { status: 404 });
  }

  const body = (await request.json()) as ResetRequest;
  if (!body?.date || !body?.foremanPersonId) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'date and foremanPersonId are required.' } },
      { status: 400 },
    );
  }

  const repoRoot = path.resolve(process.cwd(), '..', '..');
  const args = [
    'pnpm',
    'reset:schedule-day',
    '--',
    `--date=${body.date}`,
    `--foremanPersonId=${body.foremanPersonId}`,
  ];
  if (body.jobId) {
    args.push(`--jobId=${body.jobId}`);
  }
  if (body.dryRun) {
    args.push('--dryRun');
  }

  const result = await runCommand('corepack', args, repoRoot);
  if (result.code !== 0) {
    return Response.json(
      {
        error: { code: 'DEV_TOOL_FAILED', message: 'Reset schedule day command failed.' },
        output: result.output,
      },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, output: result.output });
}
