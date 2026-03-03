const webPort = process.env.WEB_PORT ?? '3000';
const baseUrl = `http://127.0.0.1:${webPort}`;

async function check(url, label) {
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      console.error(`[FAIL] ${label}: HTTP ${response.status}`);
      return false;
    }
    console.log(`[PASS] ${label}: HTTP ${response.status}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[FAIL] ${label}: ${message}`);
    return false;
  }
}

const results = await Promise.all([
  check(`${baseUrl}/api/web-health`, 'web health'),
  check(`${baseUrl}/api/health`, 'api health via web proxy'),
]);

if (results.every(Boolean)) {
  console.log('LAN check passed.');
  process.exit(0);
}

console.error('LAN check failed.');
process.exit(1);
