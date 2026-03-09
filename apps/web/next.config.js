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
