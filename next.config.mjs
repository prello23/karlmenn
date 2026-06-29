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
};

export default nextConfig;
