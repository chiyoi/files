const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const commonConfig = {
    ...defaultConfig,
    webpack: config => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding')
      return config
    },
    images: {
      loader: 'custom',
      loaderFile: './imageLoader.js',
    },
  }

  return phase === PHASE_DEVELOPMENT_SERVER ? {
    ...commonConfig,
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8787/api/:path*', // Proxy to Backend
        },
      ]
    },
  } : {
    ...commonConfig,
    output: 'export',
  }
}
