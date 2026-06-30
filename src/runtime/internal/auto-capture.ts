/**
 * Declarative click tracking driven by DOM attributes:
 *
 *   <button
 *     data-krak-action="cc"     // event name (required)
 *     data-krak-data-plan="pro"       // -> data: { plan: "pro" }
 *     data-krak-data-price="29"       // -> data: { price: 29 }
 *     data-krak-immediate             // flush right away
 *   >Subscribe</button>
 *
 * `data-krak-data-*` values are coerced to boolean / number when they look
 * like one, otherwise kept as strings.
 */

import { isForbiddenMetaKey } from './sanitize'

export type KrakLiteCaptureTarget = {
  actionName: string
  meta?: Record<string, unknown>
  immediate: boolean
}

const DATA_PREFIX = 'krakData'

const decapitalize = (value: string): string =>
  value ? value.charAt(0).toLowerCase() + value.slice(1) : value

const coerce = (raw: string | undefined): unknown => {
  if (raw === undefined) return undefined
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw.trim() !== '' && !Number.isNaN(Number(raw))) return Number(raw)
  return raw
}

/**
 * Walks up from the clicked node to the nearest `[data-krak-action]` ancestor
 * and extracts what to track. Returns null when there is nothing to capture.
 */
export const resolveCaptureTarget = (
  start: EventTarget | null,
): KrakLiteCaptureTarget | null => {
  if (!(start instanceof Element)) return null

  const el = start.closest<HTMLElement>('[data-krak-action]')
  if (!el) return null

  const actionName = el.dataset.krakAction?.trim()
  if (!actionName) return null

  const data: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(el.dataset)) {
    // The char after the prefix must be uppercase, so `data-krak-database`
    // (dataset key `krakDatabase`) is not mistaken for `data-krak-data-base`.
    if (
      key.length <= DATA_PREFIX.length
      || !key.startsWith(DATA_PREFIX)
      || !/[A-Z]/.test(key[DATA_PREFIX.length]!)
    ) {
      continue
    }

    const dataKey = decapitalize(key.slice(DATA_PREFIX.length))

    if (isForbiddenMetaKey(dataKey)) {
      continue
    }

    data[dataKey] = coerce(value)
  }

  return {
    actionName,
    meta: Object.keys(data).length ? data : undefined,
    immediate: 'krakImmediate' in el.dataset,
  }
}
