export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  krakLite: {
    enabled: true,
    endpoint: '/api/analytics/events',
    source: 'playground',
    flushInterval: 5000,
    debug: true,
    autoPageView: true,
  },
})
