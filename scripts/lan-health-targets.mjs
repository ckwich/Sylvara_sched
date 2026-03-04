const loopbackHost = '127.0.0.1';

export function getLanHealthTargets(env = process.env) {
  const webPort = env.WEB_PORT ?? '3000';
  const apiPort = env.API_PORT ?? '4000';
  return {
    webHealthUrl: `http://${loopbackHost}:${webPort}/api/web-health`,
    apiHealthViaWebProxyUrl: `http://${loopbackHost}:${webPort}/api/health`,
    rawApiHealthUrl: `http://${loopbackHost}:${apiPort}/api/health`,
  };
}
