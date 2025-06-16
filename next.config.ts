import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '483cvowdsk.ufs.sh', port: "" },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', port: "" },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', port: "" },
      { protocol: 'https', hostname: 'utfs.io' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};


export default nextConfig;
