/// <reference types="vite/client" />
import type { KrakLiteOptions } from '../types'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { resolveCaptureTarget } from '../internal/auto-capture'
import { useKrakLiteState } from '../internal/state'
import { useKrakLite } from '../composables/useKrakLite'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const options = config.public.krakLite as KrakLiteOptions

  if (!options.enabled || import.meta.server) return

  const { track, flush, pageView } = useKrakLite()

  const interval = window.setInterval(() => {
    void flush()
  }, options.flushInterval)

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      void flush({ preferBeacon: true })
    }
  }

  const onClickCapture = (event: MouseEvent) => {
    const target = resolveCaptureTarget(event.target)
    if (!target) return

    track(target.eventName, target.data, { immediate: target.immediate })
  }

  const cleanup = () => {
    window.clearInterval(interval)

    const state = useKrakLiteState()

    if (state.retryTimer) {
      clearTimeout(state.retryTimer)
      state.retryTimer = null
    }

    window.removeEventListener('pagehide', onPageHide)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    document.removeEventListener('click', onClickCapture, { capture: true })
  }

  const onPageHide = () => {
    void flush({ preferBeacon: true })
    cleanup()
  }

  window.addEventListener('pagehide', onPageHide)
  document.addEventListener('visibilitychange', onVisibilityChange)

  if (options.autoCapture) {
    document.addEventListener('click', onClickCapture, { capture: true })
  }

  if (options.autoPageView) {
    nuxtApp.hook('page:finish', () => {
      pageView()
    })
  }

  if (import.meta.hot) {
    import.meta.hot.dispose(cleanup)
  }
})
