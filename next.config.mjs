/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Keep production builds resilient; lint is run separately via `npm run lint`.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async redirects() {
    return [
      { source: "/dona", destination: "/styrkja", permanent: true },
      { source: "/dona/takk", destination: "/styrkja/takk", permanent: true },
    ];
  },
};

export default nextConfig;
