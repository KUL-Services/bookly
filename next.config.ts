import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ['127.0.0.0', 'localhost'],
  /* config options here */
};

export default nextConfig;
