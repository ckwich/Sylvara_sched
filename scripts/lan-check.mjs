import http from 'node:http';
import { getLanHealthTargets } from './lan-health-targets.mjs';

const { webHealthUrl, apiHealthViaWebProxyUrl, rawApiHealthUrl } = getLanHealthTargets();

async function check(url, label) {
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
          if ((response.statusCode ?? 500) >= 200 && (response.statusCode ?? 500) < 300) {
            console.log(`[PASS] ${label}: HTTP ${response.statusCode}`);
            resolve(true);
            return;
          }
          console.error(`[FAIL] ${label}: HTTP ${response.statusCode ?? 'unknown'}`);
          resolve(false);
        });
      },
    );

    request.setTimeout(5000, () => {
      if (settled) {
        return;
      }
      settled = true;
      request.destroy(new Error('Request timed out.'));
      console.error(`[FAIL] ${label}: timeout`);
      resolve(false);
    });

    request.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      console.error(`[FAIL] ${label}: ${error.message}`);
      resolve(false);
    });

    request.end();
  });
}

async function main() {
  console.log(`Health targets:`);
  console.log(`- webHealthUrl=${webHealthUrl}`);
  console.log(`- apiHealthViaWebProxyUrl=${apiHealthViaWebProxyUrl}`);
  console.log(`- rawApiHealthUrl=${rawApiHealthUrl}`);

  const webHealthOk = await check(webHealthUrl, 'web health');
  const apiHealthViaProxyOk = await check(
    apiHealthViaWebProxyUrl,
    'api health via web proxy',
  );
  const rawApiHealthOk = await check(rawApiHealthUrl, 'raw api health');

  if (webHealthOk && apiHealthViaProxyOk && rawApiHealthOk) {
    console.log('LAN check passed.');
    process.exitCode = 0;
    return;
  }

  console.error('LAN check failed.');
  process.exitCode = 1;
}

await main();
