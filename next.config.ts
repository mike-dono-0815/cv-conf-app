import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cvpr.thecvf.com',
      },
      {
        protocol: 'https',
        hostname: 'openaccess.thecvf.com',
      },
    ],
  },
}

export default nextConfig
