/** @type {import('next').NextConfig} */
const apiUrl = process.env.API_URL;
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!apiUrl) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
