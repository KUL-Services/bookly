import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ['127.0.0.0', 'localhost'],
  images: {
    remotePatterns: [
      new URL('https://gratisography.com/**'),

      //TODO: REMOVE THIS BEFORE DEPLOYMENT
      {
        protocol: 'https',
        hostname: '**' // allow all hosts
      },
      {
        protocol: 'http',
        hostname: '**' // allow all hosts over http
      }
    ]
  }
  /* config options here */
}

export default nextConfig
