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
      { source: "/dona", destination: "/styrkja", permanent: false },
      { source: "/dona/takk", destination: "/styrkja", permanent: false },
      { source: "/dona/takk/:path*", destination: "/styrkja", permanent: false },
      { source: "/styrkja/takk", destination: "/styrkja", permanent: false },
      { source: "/styrkja/takk/:path*", destination: "/styrkja", permanent: false },
    ];
  },
};

export default nextConfig;
