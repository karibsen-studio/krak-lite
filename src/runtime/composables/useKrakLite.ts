import {
  KRAK_LITE_ACTIONS,
  type KrakLiteActionName, type KrakLiteFlushOptions,
  type KrakLiteMetaFor,
  type KrakLiteOptions,
  type KrakLitePayload,
  type KrakLiteQueuedAction,
  type KrakLiteTrackOptions,
} from '../types'

import { useKrakLiteState } from '../internal/state'
import { createSessionId } from '../internal/session'
import { isDoNotTrackEnabled } from '../internal/dnt'
import { sanitizePath } from '../internal/sanitize'
import { useRoute, useRuntimeConfig } from 'nuxt/app'

export const useKrakLite = () => {
  const route = useRoute()
  const config = useRuntimeConfig()

  const options = config.public.krakLite as KrakLiteOptions
  const state = useKrakLiteState()

  const log = (...args: unknown[]) => {
    if (!options.debug) return

    console.log('[krak-lite]', ...args)
  }

  const isTrackingAllowed = (): boolean => {
    if (!options.enabled) return false
    return !(options.respectDoNotTrack && isDoNotTrackEnabled())
  }

  const sessionId = (): string => {
    state.sessionId ??= createSessionId()
    return state.sessionId
  }

  const trimQueue = () => {
    if (state.queue.length > options.maxQueueSize) {
      state.queue.splice(0, state.queue.length - options.maxQueueSize)
    }
  }

  const track = <A extends KrakLiteActionName>(
    actionName: A,
    meta?: KrakLiteMetaFor<A>,
    trackOptions: KrakLiteTrackOptions = {},
  ) => {
    if (import.meta.server) return
    if (!isTrackingAllowed()) return

    const action: KrakLiteQueuedAction = {
      a: actionName,
      t: Date.now(),
      p: sanitizePath(route.fullPath),
      s: options.source,
      sid: sessionId(),
      meta: meta as Record<string, unknown> | undefined,
    }

    state.queue.push({
      action,
      attemptsLeft: (trackOptions.retry ?? options.retry) + 1,
      retryAfter: trackOptions.retryAfter ?? options.retryAfter,
    })

    trimQueue()

    log('action queued', action)

    if (trackOptions.immediate) {
      void flush()
    }
  }

  const pageView = (data?: Record<string, unknown>) => {
    track(KRAK_LITE_ACTIONS.PAGE_VIEW, {
      title: document.title,
      ...data,
    })
  }

  const scheduleRetry = (delay: number) => {
    if (state.retryTimer) return

    state.retryTimer = setTimeout(() => {
      state.retryTimer = null
      void flush()
    }, delay)
  }

  const flush = async (flushOptions: KrakLiteFlushOptions = {}) => {
    if (import.meta.server) return
    if (!isTrackingAllowed()) return
    if (state.isFlushing) return
    if (!state.queue.length) return

    state.isFlushing = true

    const items = state.queue.splice(0, state.queue.length)

    const payload: KrakLitePayload = {
      v: 1,
      s: options.source,
      d: items.map(item => item.action),
    }

    const body = JSON.stringify(payload)

    try {
      const shouldUseBeacon
        = options.transport === 'beacon'
          || (options.transport === 'auto' && flushOptions.preferBeacon)

      if (shouldUseBeacon && navigator.sendBeacon) {
        const sent = navigator.sendBeacon(
          options.endpoint,
          new Blob([body], { type: 'application/json' }),
        )

        if (!sent) {
          throw new Error('sendBeacon failed')
        }

        log('batch queued with sendBeacon', payload)
        return
      }

      // sinon fetch par défaut = retry possible sur 404/500/etc.
      const response = await fetch(options.endpoint, {
        method: 'POST',
        body,
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`flush failed with status ${response.status}`)
      }

      log('batch sent with fetch', payload)
    }
    catch (error) {
      const survivors = items
        .map(item => ({
          ...item,
          attemptsLeft: item.attemptsLeft - 1,
        }))
        .filter(item => item.attemptsLeft > 0)

      const dropped = items.length - survivors.length

      if (survivors.length) {
        state.queue.unshift(...survivors)
        trimQueue()
        scheduleRetry(Math.max(...survivors.map(item => item.retryAfter)))
      }

      log('flush failed', { error, requeued: survivors.length, dropped })
    }
    finally {
      state.isFlushing = false
    }
  }

  return {
    track,
    flush,
    pageView,
  }
}
