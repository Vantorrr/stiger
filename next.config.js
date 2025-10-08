/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Отключаем ESLint во время сборки на продакшене
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Игнорируем TypeScript ошибки во время сборки
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      // Настройки для turbopack в dev режиме
    },
  },
}

module.exports = nextConfig

