// next.config.mjs
/** @type {import('next').NextConfig} */

// Derive your Supabase hostname from the env var, e.g. xyzcompany.supabase.co
const supaHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : undefined;

const nextConfig = {
  experimental: {
    optimizeCss: false, // keep your current flag
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;