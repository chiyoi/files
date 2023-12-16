/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  output: 'export',
  images: {
    loader: 'custom',
    loaderFile: './imageLoader.js',
  },
}

module.exports = nextConfig
