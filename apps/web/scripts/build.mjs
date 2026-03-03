import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const requireFromWeb = createRequire(import.meta.url);
const nextBin = requireFromWeb.resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, 'build'], {
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
