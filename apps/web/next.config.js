/** @type {import('next').NextConfig} */
const apiUrl = process.env.API_URL;
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!apiUrl) {
      return { beforeFiles: [], afterFiles: [], fallback: [] };
    }
    return {
      beforeFiles: [],
      // afterFiles: filesystem routes (e.g. app/api/proxy/route.ts) are checked
      // BEFORE these rewrites, so the proxy route handler takes priority for
      // authenticated requests. This rewrite only catches /api/* paths that have
      // no matching filesystem route handler, forwarding them directly to the API.
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

module.exports = nextConfig;
