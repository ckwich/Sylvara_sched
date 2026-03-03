import { spawn } from 'node:child_process';

const host = process.env.HOST_BIND ?? '127.0.0.1';
const port = process.env.WEB_PORT ?? '3000';

const child = spawn(
  'next',
  ['start', '-H', host, '-p', port],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
