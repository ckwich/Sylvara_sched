import { mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const hostBind = process.env.HOST_BIND ?? '0.0.0.0';
const webPort = process.env.WEB_PORT ?? '3000';
const apiPort = process.env.API_PORT ?? '4000';
const lanSharedSecret = process.env.LAN_SHARED_SECRET;
const minSharedSecretLength = 24;

if (!lanSharedSecret || lanSharedSecret.trim().length < minSharedSecretLength) {
  console.error(`LAN_SHARED_SECRET is required and must be at least ${minSharedSecretLength} characters for LAN mode.`);
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

function spawnDetached(command, args, logPath, cwd = process.cwd()) {
  const out = openSync(logPath, 'a');
  const child = spawn(command, args, {
    cwd,
    env: childEnv,
    detached: true,
    stdio: ['ignore', out, out],
    shell: false,
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

const apiEntrypoint = join(process.cwd(), 'apps', 'api', 'dist', 'server.js');
const webRequire = createRequire(join(process.cwd(), 'apps', 'web', 'package.json'));
const nextBin = webRequire.resolve('next/dist/bin/next');
const webCwd = join(process.cwd(), 'apps', 'web');

const apiPid = spawnDetached(process.execPath, [apiEntrypoint], apiLogPath);
const webPid = spawnDetached(process.execPath, [nextBin, 'start', '-H', hostBind, '-p', webPort], webLogPath, webCwd);

writeFileSync(apiPidPath, `${apiPid}\n`);
writeFileSync(webPidPath, `${webPid}\n`);

console.log(`LAN services started (API PID ${apiPid}, WEB PID ${webPid}).`);
console.log(`Logs: ${apiLogPath} and ${webLogPath}`);
