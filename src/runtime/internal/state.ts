import type { KrakLiteQueueItem } from '../types'
import {useNuxtApp} from "nuxt/app";

type KrakLiteState = {
  queue: KrakLiteQueueItem[]
  isFlushing: boolean
  /** Anonymous in-memory session id, lazily created on first track. */
  sessionId: string | null
  /** Pending retry flush, so we never stack more than one. */
  retryTimer: ReturnType<typeof setTimeout> | null
}

const STATE_KEY = '$krakLite' as const

type KrakLiteNuxtApp = ReturnType<typeof useNuxtApp> & {
  [STATE_KEY]?: KrakLiteState
}

export const useKrakLiteState = (): KrakLiteState => {
  const nuxtApp = useNuxtApp() as KrakLiteNuxtApp

  nuxtApp[STATE_KEY] ??= {
    queue: [],
    isFlushing: false,
    sessionId: null,
    retryTimer: null,
  }

  return nuxtApp[STATE_KEY]
}
