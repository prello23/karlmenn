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
      { source: "/styrkja", destination: "/dona", permanent: false },
      { source: "/styrkja/:path*", destination: "/dona", permanent: false },
      { source: "/dona/takk", destination: "/dona", permanent: false },
      { source: "/dona/takk/:path*", destination: "/dona", permanent: false },
    ];
  },
};

export default nextConfig;
