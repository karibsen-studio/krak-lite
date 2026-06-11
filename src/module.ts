import { defineNuxtModule, addPlugin, createResolver, addImports } from '@nuxt/kit'
import type { KrakLiteOptions } from './runtime/types'

export default defineNuxtModule<KrakLiteOptions>({
  meta: {
    name: '@karibsen/krak-lite-nuxt',
    configKey: 'krakLite',
  },
  defaults: {
    enabled: true,
    endpoint: '/api/analytics/events',
    source: 'unknown',
    maxQueueSize: 100,
    flushInterval: 30_000,
    debug: false,
    autoPageView: false,
    autoCapture: true,
    respectDoNotTrack: true,
    retry: 3,
    retryAfter: 5_000,
    transport: 'fetch'
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    _nuxt.options.runtimeConfig.public.krakLite = _options

    addImports({
      name: 'useKrakLite',
      from: resolver.resolve('./runtime/composables/useKrakLite'),
    })
    addPlugin(resolver.resolve('./runtime/plugins/krak-lite.client'))
  },
})
