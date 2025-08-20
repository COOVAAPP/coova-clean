/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false, // disables lightningcss and falls back to PostCSS
  },
};

export default nextConfig;