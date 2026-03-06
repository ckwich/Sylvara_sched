import { spawn } from 'node:child_process';
import path from 'node:path';

type ResetRequest = {
  date: string;
  foremanPersonId: string;
  jobId?: string;
  dryRun?: boolean;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function runCommand(command: string, args: string[], cwd: string): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
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
  if (!DATE_RE.test(body.date)) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'date must match YYYY-MM-DD format.' } },
      { status: 400 },
    );
  }
  if (!UUID_RE.test(body.foremanPersonId)) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'foremanPersonId must be a UUID.' } },
      { status: 400 },
    );
  }
  if (body.jobId && !UUID_RE.test(body.jobId)) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'jobId must be a UUID.' } },
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

  const result = await runCommand(process.platform === 'win32' ? 'corepack.cmd' : 'corepack', args, repoRoot);
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
