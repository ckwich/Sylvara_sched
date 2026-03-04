import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import os from 'node:os';
import http from 'node:http';
import { getLanHealthTargets } from './lan-health-targets.mjs';

const hostBind = process.env.HOST_BIND ?? '0.0.0.0';
const webPort = process.env.WEB_PORT ?? '3000';
const apiPort = process.env.API_PORT ?? '4000';
const lanSharedSecret = process.env.LAN_SHARED_SECRET;
const minSharedSecretLength = 24;
const { webHealthUrl, apiHealthViaWebProxyUrl, rawApiHealthUrl } = getLanHealthTargets();
const coworkerUrl = process.env.PUBLIC_WEB_ORIGIN ?? `http://${os.hostname()}:${webPort}`;

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
  return child;
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function tailLog(path, lines = 80) {
  try {
    const content = readFileSync(path, 'utf8');
    return content.split(/\r?\n/).filter(Boolean).slice(-lines).join('\n');
  } catch {
    return '(log unavailable)';
  }
}

function checkHealth(url) {
  const parsedUrl = new URL(url);
  return new Promise((resolve) => {
    let settled = false;
    const request = http.request(
      {
        host: parsedUrl.hostname,
        port: Number(parsedUrl.port || 80),
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: 'GET',
      },
      (response) => {
        response.resume();
        response.on('end', () => {
          if (settled) {
            return;
          }
          settled = true;
          const status = response.statusCode ?? 500;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            error: null,
          });
        });
      },
    );
    request.setTimeout(5000, () => {
      if (settled) {
        return;
      }
      settled = true;
      request.destroy(new Error('timeout'));
      resolve({ ok: false, status: null, error: 'timeout' });
    });
    request.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve({ ok: false, status: null, error: error.message });
    });
    request.end();
  });
}

async function waitForHealth(input) {
  const { timeoutMs, processes } = input;
  const startedAt = Date.now();
  let lastResults = [];
  let consecutivePasses = 0;
  const requiredConsecutivePasses = 20;

  while (Date.now() - startedAt < timeoutMs) {
    const checks = [
      { label: 'web health', url: webHealthUrl },
      { label: 'api health via web proxy', url: apiHealthViaWebProxyUrl },
      { label: 'raw api health', url: rawApiHealthUrl },
    ];

    const results = await Promise.all(
      checks.map(async (check) => ({
        label: check.label,
        url: check.url,
        ...(await checkHealth(check.url)),
      })),
    );
    lastResults = results;

    const apiAlive = isProcessAlive(processes.api.pid);
    const webAlive = isProcessAlive(processes.web.pid);
    if (!apiAlive || !webAlive) {
      return {
        ok: false,
        results,
        processAlive: { api: apiAlive, web: webAlive },
      };
    }

    if (results.every((result) => result.ok)) {
      consecutivePasses += 1;
    } else {
      consecutivePasses = 0;
    }

    if (consecutivePasses >= requiredConsecutivePasses) {
      return { ok: true, results };
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return {
    ok: false,
    results: lastResults,
    processAlive: {
      api: isProcessAlive(processes.api.pid),
      web: isProcessAlive(processes.web.pid),
    },
  };
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
const webBuildMarker = join(process.cwd(), 'apps', 'web', '.next', 'BUILD_ID');
if (!existsSync(apiEntrypoint) || !existsSync(webBuildMarker)) {
  console.error('Missing build artifacts. Run `corepack pnpm lan:build` before `lan:start`.');
  process.exit(1);
}
const webRequire = createRequire(join(process.cwd(), 'apps', 'web', 'package.json'));
const nextBin = webRequire.resolve('next/dist/bin/next');
const webCwd = join(process.cwd(), 'apps', 'web');

const apiCommand = process.execPath;
const apiArgs = [apiEntrypoint];
const webCommand = process.execPath;
const webArgs = [nextBin, 'start', '-H', hostBind, '-p', webPort];

console.log(`Launch API: ${apiCommand} ${apiArgs.join(' ')} (cwd=${process.cwd()})`);
console.log(`Launch WEB: ${webCommand} ${webArgs.join(' ')} (cwd=${webCwd})`);
console.log(`Coworker URL: ${coworkerUrl}/dispatch`);
console.log(`Logs directory: ${pidDir}`);

const apiChild = spawnDetached(apiCommand, apiArgs, apiLogPath);
const webChild = spawnDetached(webCommand, webArgs, webLogPath, webCwd);

const processes = {
  api: {
    name: 'API',
    pid: apiChild.pid,
    command: apiCommand,
    args: apiArgs,
    cwd: process.cwd(),
    logPath: apiLogPath,
    exitCode: null,
    signal: null,
  },
  web: {
    name: 'WEB',
    pid: webChild.pid,
    command: webCommand,
    args: webArgs,
    cwd: webCwd,
    logPath: webLogPath,
    exitCode: null,
    signal: null,
  },
};

apiChild.on('exit', (code, signal) => {
  processes.api.exitCode = code;
  processes.api.signal = signal;
});
webChild.on('exit', (code, signal) => {
  processes.web.exitCode = code;
  processes.web.signal = signal;
});

if (!isProcessAlive(processes.api.pid) || !isProcessAlive(processes.web.pid)) {
  console.error('LAN services exited immediately. Check .lan/*.log files for startup errors.');
  console.error(`API alive=${isProcessAlive(processes.api.pid)} pid=${processes.api.pid}`);
  console.error(`WEB alive=${isProcessAlive(processes.web.pid)} pid=${processes.web.pid}`);
  console.error(`[API log tail]\n${tailLog(apiLogPath, 80)}`);
  console.error(`[WEB log tail]\n${tailLog(webLogPath, 80)}`);
  process.exit(1);
}

writeFileSync(apiPidPath, `${processes.api.pid}\n`);
writeFileSync(webPidPath, `${processes.web.pid}\n`);

console.log(`Health targets:`);
console.log(`- webHealthUrl=${webHealthUrl}`);
console.log(`- apiHealthViaWebProxyUrl=${apiHealthViaWebProxyUrl}`);
console.log(`- rawApiHealthUrl=${rawApiHealthUrl}`);

const ready = await waitForHealth({ timeoutMs: 15000, processes });
if (!ready.ok) {
  console.error('LAN services failed health checks within 15s.');
  for (const result of ready.results) {
    if (result.ok) {
      continue;
    }
    const reason = result.status !== null ? `HTTP ${result.status}` : result.error ?? 'unknown';
    console.error(`- FAIL ${result.label}: ${reason} (${result.url})`);
  }
  const apiAlive = ready.processAlive?.api ?? isProcessAlive(processes.api.pid);
  const webAlive = ready.processAlive?.web ?? isProcessAlive(processes.web.pid);
  if (!apiAlive) {
    console.error(
      `API exited (code ${processes.api.exitCode ?? 'unknown'}, signal ${processes.api.signal ?? 'none'})`,
    );
    console.error(`[API log tail]\n${tailLog(apiLogPath, 80)}`);
  }
  if (!webAlive) {
    console.error(
      `WEB exited (code ${processes.web.exitCode ?? 'unknown'}, signal ${processes.web.signal ?? 'none'})`,
    );
    console.error(`[WEB log tail]\n${tailLog(webLogPath, 80)}`);
  }
  console.error(`Process status: api pid ${processes.api.pid} alive=${apiAlive}`);
  console.error(`Process status: web pid ${processes.web.pid} alive=${webAlive}`);
  if ((ready.results ?? []).some((result) => result.error?.includes('EADDRINUSE'))) {
    console.error('Port may be in use. Try: netstat -ano | findstr :3000');
  }
  console.error(`Logs: ${apiLogPath} and ${webLogPath}`);
  process.exit(1);
}

console.log(`LAN services started and healthy (API PID ${processes.api.pid}, WEB PID ${processes.web.pid}).`);
console.log(`Logs: ${apiLogPath} and ${webLogPath}`);
console.log(`Open from another machine: ${coworkerUrl}/dispatch`);
