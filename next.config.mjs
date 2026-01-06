/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    PROJECT_ROOT: process.cwd(),
  },
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Enable gzip compression
  compress: true,
  // Optimize production bundle
  productionBrowserSourceMaps: false,
  // Reduce runtime chunk size
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
