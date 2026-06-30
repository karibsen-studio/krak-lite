import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  css: ['./assets/css/main.css'],
  compatibilityDate: 'latest',

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  krakLite: {
    enabled: true,
    endpoint: '/api/analytics/actions',
    source: 'playground',
    flushInterval: 5000,
    debug: true,
    autoPageView: true,
  },
})
