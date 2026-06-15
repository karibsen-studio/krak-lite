export const KRAK_LITE_ACTIONS = {
  PAGE_VIEW: 'pv',
  CLICK: 'cl',
  OUTBOUND_CLICK: 'oc',
  FORM_SUBMIT: 'fs',
  CTA_CLICK: 'cc',
  LANGUAGE_CHANGED: 'lc',
  SEARCH: 'sr',
  SHARE: 'sh',
} as const

export type KrakLiteBaseAction
  = typeof KRAK_LITE_ACTIONS[keyof typeof KRAK_LITE_ACTIONS]

export type KrakLiteActionName = KrakLiteBaseAction | (string & {})

export type KrakLiteFlushOptions = {
  preferBeacon?: boolean
}

export type KrakLiteTransport = 'fetch' | 'beacon' | 'auto'

export type KrakLiteOptions = {
  enabled: boolean
  endpoint: string
  source: string
  maxQueueSize: number
  flushInterval: number
  debug: boolean
  autoPageView: boolean
  transport: KrakLiteTransport
  /** Capture clicks on elements carrying `data-krak-action` attributes. */
  autoCapture: boolean
  /** Skip all tracking when the browser signals Do Not Track. */
  respectDoNotTrack: boolean
  /** Number of extra send attempts after the first failure. */
  retry: number
  /** Delay (ms) before retrying a failed batch. */
  retryAfter: number
}

/** Action payload as sent on the wire. */
export type KrakLiteQueuedAction = {
  a: KrakLiteActionName
  t: number
  p: string
  s: string
  /** Anonymous, in-memory session id. */
  sid: string
  meta?: Record<string, unknown>
}

/** Internal queue entry: the action plus its retry bookkeeping. */
export type KrakLiteQueueItem = {
  action: KrakLiteQueuedAction
  attemptsLeft: number
  retryAfter: number
}

export type KrakLitePayload = {
  v: 1
  s: string
  d: KrakLiteQueuedAction[]
}

export type KrakLiteTrackOptions = {
  immediate?: boolean
  /** Override the module-level `retry` for this action. */
  retry?: number
  /** Override the module-level `retryAfter` for this action. */
  retryAfter?: number
}

/** Per-page krak-lite configuration, set via `definePageMeta`. */
export type KrakLitePageMeta = {
  /** Disable the automatic `pv` action for this page. */
  pageView?: boolean
}

declare module 'vue-router' {
  interface RouteMeta {
    krakLite?: KrakLitePageMeta
  }
}

export {}
