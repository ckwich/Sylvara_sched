import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const host = process.env.HOST_BIND ?? '127.0.0.1';
const port = process.env.WEB_PORT ?? '3000';

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
