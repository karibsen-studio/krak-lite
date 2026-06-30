import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  modules: ['../src/module'],
  css: ['./assets/css/main.css'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  krakLite: {
    enabled: true,
    endpoint: '/api/analytics/actions',
    source: 'playground',
    flushInterval: 5000,
    debug: true,
    autoPageView: true,
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
