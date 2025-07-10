/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  
  // Обработка статических файлов
  async rewrites() {
    return [
      // Позволяем напрямую доступ к index.html
      {
        source: '/index.html',
        destination: '/index.html',
      },
    ]
  },

  // Redirects для очистки проблемных URL
  async redirects() {
    return [
      // Обработка двойных слешей
      {
        source: '//',
        destination: '/',
        permanent: true,
      },
      // Очистка любых старых cached путей
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/main',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  nextConfig,
}; 