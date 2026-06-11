export const KRAK_LITE_EVENTS = {
  PAGE_VIEW: 'page_view',
  CLICK: 'click',
  OUTBOUND_CLICK: 'outbound_click',
  FORM_SUBMIT: 'form_submit',
  CTA_CLICK: 'cta_click',
  LANGUAGE_CHANGED: 'language_changed',
  SEARCH: 'search',
  SHARE: 'share',
} as const

export type KrakLiteBaseEvent
  = typeof KRAK_LITE_EVENTS[keyof typeof KRAK_LITE_EVENTS]

export type KrakLiteEventName = KrakLiteBaseEvent | (string & {})

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
  /** Capture clicks on elements carrying `data-krak-event` attributes. */
  autoCapture: boolean
  /** Skip all tracking when the browser signals Do Not Track. */
  respectDoNotTrack: boolean
  /** Number of extra send attempts after the first failure. */
  retry: number
  /** Delay (ms) before retrying a failed batch. */
  retryAfter: number
}

/** Event payload as sent on the wire. */
export type KrakLiteQueuedEvent = {
  e: KrakLiteEventName
  t: number
  p: string
  s: string
  /** Anonymous, in-memory session id. */
  sid: string
  data?: Record<string, unknown>
}

/** Internal queue entry: the event plus its retry bookkeeping. */
export type KrakLiteQueueItem = {
  event: KrakLiteQueuedEvent
  attemptsLeft: number
  retryAfter: number
}

export type KrakLitePayload = {
  v: 1
  s: string
  ev: KrakLiteQueuedEvent[]
}

export type KrakLiteTrackOptions = {
  immediate?: boolean
  /** Override the module-level `retry` for this event. */
  retry?: number
  /** Override the module-level `retryAfter` for this event. */
  retryAfter?: number
}
