/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/%5Bobject%20Object%5D',
        destination: '/payment/success',
        permanent: false,
      },
      {
        source: '/[object Object]',
        destination: '/payment/success',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.cloudpayments.ru https://*.tbank.ru",
              "style-src 'self' 'unsafe-inline' https://*.cloudpayments.ru",
              "img-src 'self' data: https: blob: https://*.cloudpayments.ru https://ads.cloudpayments.ru",
              "font-src 'self' data: https://*.cloudpayments.ru",
              "connect-src 'self' https://*.cloudpayments.ru wss://*.cloudpayments.ru https://secure2.tbank.ru https://api.cloudpayments.ru https://intent-api.cloudpayments.ru",
              "frame-src 'self' https://*.cloudpayments.ru https://stiger.app https://secure2.tbank.ru",
              "frame-ancestors 'self' https://*.cloudpayments.ru",
              "child-src 'self' https://*.cloudpayments.ru"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

