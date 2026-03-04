import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkLanHealth } from './lan-check.mjs';

const pidDir = join(process.cwd(), '.lan');
const apiPidPath = join(pidDir, 'api.pid');
const webPidPath = join(pidDir, 'web.pid');
const apiLogPath = join(pidDir, 'api.log');
const webLogPath = join(pidDir, 'web.log');

function readPid(path) {
  if (!existsSync(path)) {
    return null;
  }
  const parsed = Number.parseInt(readFileSync(path, 'utf8').trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isAlive(pid) {
  if (!pid) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function tail(path, lines = 10) {
  if (!existsSync(path)) {
    return '(log file not found)';
  }
  const content = readFileSync(path, 'utf8');
  const tailLines = content.split(/\r?\n/).filter(Boolean).slice(-lines);
  return tailLines.length > 0 ? tailLines.join('\n') : '(log empty)';
}

async function main() {
  const apiPid = readPid(apiPidPath);
  const webPid = readPid(webPidPath);

  console.log('LAN process status');
  console.log(`- api pid: ${apiPid ?? 'missing'} alive=${isAlive(apiPid)}`);
  console.log(`- web pid: ${webPid ?? 'missing'} alive=${isAlive(webPid)}`);

  console.log('\nAPI log tail');
  console.log(tail(apiLogPath, 10));

  console.log('\nWEB log tail');
  console.log(tail(webLogPath, 10));

  console.log('\nHealth checks');
  const ok = await checkLanHealth();
  process.exitCode = ok ? 0 : 1;
}

await main();
