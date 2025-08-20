/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false, // disables lightningcss so the native .node isn’t required
  },
};

export default nextConfig;