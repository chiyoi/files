const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const config = {
    ...defaultConfig,
    webpack: config => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding')
      return config
    },
    images: {
      loader: 'custom',
      loaderFile: './modules/imageLoader.js',
    },
  }

  return phase === PHASE_DEVELOPMENT_SERVER ? {
    ...config,
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8787/api/:path*',
        },
        {
          source: '/ens/:path*',
          destination: 'http://ens.neko03.workers.dev/ens/:path*',
        },
      ]
    },
  } : {
    ...config,
    output: 'export',
  }
}
