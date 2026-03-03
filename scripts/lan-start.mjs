import { mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const hostBind = process.env.HOST_BIND ?? '0.0.0.0';
const webPort = process.env.WEB_PORT ?? '3000';
const apiPort = process.env.API_PORT ?? '4000';
const lanSharedSecret = process.env.LAN_SHARED_SECRET;

if (!lanSharedSecret) {
  console.error('LAN_SHARED_SECRET is required for LAN mode.');
  process.exit(1);
}

const pidDir = join(process.cwd(), '.lan');
mkdirSync(pidDir, { recursive: true });

const apiPidPath = join(pidDir, 'api.pid');
const webPidPath = join(pidDir, 'web.pid');
const apiLogPath = join(pidDir, 'api.log');
const webLogPath = join(pidDir, 'web.log');

const childEnv = {
  ...process.env,
  NODE_ENV: 'production',
  LAN_MODE: 'true',
  HOST_BIND: hostBind,
  WEB_PORT: webPort,
  API_PORT: apiPort,
};

function spawnDetached(command, args, logPath) {
  const out = openSync(logPath, 'a');
  const child = spawn(command, args, {
    env: childEnv,
    detached: true,
    stdio: ['ignore', out, out],
    shell: process.platform === 'win32',
  });
  child.unref();
  return child.pid;
}

function readExistingPid(path) {
  try {
    return Number.parseInt(readFileSync(path, 'utf8').trim(), 10);
  } catch {
    return null;
  }
}

if (readExistingPid(apiPidPath) || readExistingPid(webPidPath)) {
  console.error('Existing LAN PID files detected. Run `corepack pnpm lan:stop` first.');
  process.exit(1);
}

const apiPid = spawnDetached('corepack', ['pnpm', '--filter', '@sylvara/api', 'start'], apiLogPath);
const webPid = spawnDetached('corepack', ['pnpm', '--filter', '@sylvara/web', 'start'], webLogPath);

writeFileSync(apiPidPath, `${apiPid}\n`);
writeFileSync(webPidPath, `${webPid}\n`);

console.log(`LAN services started (API PID ${apiPid}, WEB PID ${webPid}).`);
console.log(`Logs: ${apiLogPath} and ${webLogPath}`);
