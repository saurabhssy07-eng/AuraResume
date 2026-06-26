/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', '@sparticuz/chromium'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig
