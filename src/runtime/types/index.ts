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

/**
 * Augmentable registry of custom analytics events.
 *
 * Declared globally so consumers can extend it from anywhere to get autocomplete
 * on `track()` for their own event names - and an optional typed `meta` payload
 * per event. A global interface is used (rather than a module-scoped one) because
 * `KrakLiteActionName` is computed here from `keyof KrakLiteEventRegistry`;
 * augmenting the re-exported alias on the package entry would not merge into it.
 *
 * @example
 * declare global {
 *   interface KrakLiteEventRegistry {
 *     purchase: { amount: number, currency: string }
 *     newsletter_signup: { plan: string }
 *   }
 * }
 * export {}
 */
declare global {
  // Intentionally empty: this is the seam consumers augment with their events.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface KrakLiteEventRegistry {}
}

/** Custom event names declared by consumers through {@link KrakLiteEventRegistry}. */
export type KrakLiteCustomActionName = keyof KrakLiteEventRegistry & string

export type KrakLiteActionName
  = | KrakLiteBaseAction
    | KrakLiteCustomActionName
    | (string & {})

/** Resolves the `meta` payload type for a given action name, when registered. */
export type KrakLiteMetaFor<A extends KrakLiteActionName>
  = A extends keyof KrakLiteEventRegistry
    ? KrakLiteEventRegistry[A]
    : Record<string, unknown>

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
