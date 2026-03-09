import { spawn } from 'node:child_process';

const host = process.env.HOST_BIND ?? '0.0.0.0';
const port = process.env.WEB_PORT ?? '3000';

const child = spawn(
  'next',
  ['dev', '-H', host, '-p', port],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
