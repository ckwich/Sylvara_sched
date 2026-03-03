/** @type {import('next').NextConfig} */
const apiPort = process.env.API_PORT ?? '4000';

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://127.0.0.1:${apiPort}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
