import { spawn } from 'node:child_process';

const hostBind = process.env.HOST_BIND ?? '0.0.0.0';
const webPort = process.env.WEB_PORT ?? '3000';
const apiPort = process.env.API_PORT ?? '4000';
const lanSharedSecret = process.env.LAN_SHARED_SECRET;
const minSharedSecretLength = 24;

if (!lanSharedSecret || lanSharedSecret.trim().length < minSharedSecretLength) {
  console.error(`LAN_SHARED_SECRET is required and must be at least ${minSharedSecretLength} characters for LAN mode.`);
  process.exit(1);
}

const childEnv = {
  ...process.env,
  LAN_MODE: 'true',
  HOST_BIND: hostBind,
  WEB_PORT: webPort,
  API_PORT: apiPort,
  PUBLIC_WEB_ORIGIN:
    process.env.PUBLIC_WEB_ORIGIN ?? `http://localhost:${webPort}`,
  API_PUBLIC_ORIGIN:
    process.env.API_PUBLIC_ORIGIN ?? `http://localhost:${apiPort}`,
};

const spawnOptions = {
  stdio: 'inherit',
  env: childEnv,
  shell: process.platform === 'win32',
};

const apiProc = spawn(
  'corepack',
  ['pnpm', '--filter', '@sylvara/api', 'dev'],
  spawnOptions,
);
const webProc = spawn(
  'corepack',
  ['pnpm', '--filter', '@sylvara/web', 'dev'],
  spawnOptions,
);

function shutdown() {
  apiProc.kill();
  webProc.kill();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

apiProc.on('exit', (code) => {
  if (code && code !== 0) {
    process.exit(code);
  }
});
webProc.on('exit', (code) => {
  if (code && code !== 0) {
    process.exit(code);
  }
});
