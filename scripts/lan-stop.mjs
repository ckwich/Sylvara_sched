import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const pidDir = join(process.cwd(), '.lan');
const apiPidPath = join(pidDir, 'api.pid');
const webPidPath = join(pidDir, 'web.pid');

function stopFromPidFile(path, name) {
  if (!existsSync(path)) {
    console.log(`${name}: no pid file.`);
    return;
  }

  const pid = Number.parseInt(readFileSync(path, 'utf8').trim(), 10);
  if (!Number.isInteger(pid) || pid <= 0) {
    console.log(`${name}: invalid pid file, removing.`);
    rmSync(path, { force: true });
    return;
  }

  try {
    process.kill(pid);
    console.log(`${name}: stopped pid ${pid}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${name}: unable to stop pid ${pid} (${message}).`);
  } finally {
    rmSync(path, { force: true });
  }
}

stopFromPidFile(apiPidPath, 'api');
stopFromPidFile(webPidPath, 'web');
