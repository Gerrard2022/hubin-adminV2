import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['rqrnfifdofbscdfvskat.supabase.co']
  },
  transpilePackages: ['@ant-design/icons', '@ant-design/plots', 'rc-util', 'rc-pagination', 'rc-picker']
};

export default nextConfig;