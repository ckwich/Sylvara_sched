import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const host = process.env.HOST_BIND ?? '127.0.0.1';
const port = process.env.WEB_PORT ?? '3000';
const lanModeEnabled = process.env.LAN_MODE === 'true';
const lanSharedSecret = process.env.LAN_SHARED_SECRET;
const minSharedSecretLength = 24;

if (lanModeEnabled && (!lanSharedSecret || lanSharedSecret.trim().length < minSharedSecretLength)) {
  console.error(
    `LAN_SHARED_SECRET is required and must be at least ${minSharedSecretLength} characters when LAN_MODE=true.`,
  );
  process.exit(1);
}

const requireFromWeb = createRequire(import.meta.url);
const nextBin = requireFromWeb.resolve('next/dist/bin/next');

const child = spawn(
  process.execPath,
  [nextBin, 'start', '-H', host, '-p', port],
  {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  },
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
