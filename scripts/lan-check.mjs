import http from 'node:http';

const webPort = process.env.WEB_PORT ?? '3000';
const baseHost = '127.0.0.1';

async function check(url, label) {
  const { path } = new URL(url);
  return new Promise((resolve) => {
    let settled = false;
    const request = http.request(
      {
        host: baseHost,
        port: Number(webPort),
        path,
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
  const webHealthOk = await check(`http://${baseHost}:${webPort}/api/web-health`, 'web health');
  const apiHealthOk = await check(
    `http://${baseHost}:${webPort}/api/health`,
    'api health via web proxy',
  );

  if (webHealthOk && apiHealthOk) {
    console.log('LAN check passed.');
    process.exitCode = 0;
    return;
  }

  console.error('LAN check failed.');
  process.exitCode = 1;
}

await main();
