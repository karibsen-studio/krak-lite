export const sanitizePath = (fullPath: string): string => {
  const url = new URL(fullPath, window.location.origin)

  for (const key of url.searchParams.keys()) {
    url.searchParams.delete(key)
  }

  return `${url.pathname}${url.hash}`
}

/**
 * Keys whose values are dropped from any tracked `meta`, at any nesting depth.
 * Matching is case-insensitive (`Email`, `EMAIL`, `email` all match).
 */
const FORBIDDEN_META_KEYS = new Set<string>([
  'email',
  'phone',
  'tel',
  'name',
  'firstname',
  'lastname',
  'address',
  'ip',
  'userid',
  'customerid',
  'reservationid',
  'password',
  'pwd',
  'token',
  'accesstoken',
  'refreshtoken',
  'cookie',
  'cardnumber',
  'cc',
  'creditcard',
  'cvv',
  'cvc',
])

/** Whether a `meta` key is considered sensitive and must be stripped. */
export const isForbiddenMetaKey = (key: string): boolean =>
  FORBIDDEN_META_KEYS.has(key.toLowerCase())

/**
 * Recursively removes sensitive keys (see {@link isForbiddenMetaKey}) from a
 * `meta` payload before it is queued, so no PII leaks - whether the action was
 * tracked programmatically or via declarative `data-krak-*` attributes.
 */
export const sanitizeMeta = (
  meta: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined => {
  if (!meta) return meta

  const scrubValue = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(scrubValue)
    if (value && typeof value === 'object') {
      return scrubObject(value as Record<string, unknown>)
    }
    return value
  }

  const scrubObject = (obj: Record<string, unknown>): Record<string, unknown> => {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (isForbiddenMetaKey(key)) continue
      out[key] = scrubValue(value)
    }
    return out
  }

  return scrubObject(meta)
}

/**
 * Reduces a referrer URL to `origin + pathname`, dropping the query string and
 * hash so no potentially sensitive parameters leak. Returns `undefined` for an
 * empty or unparseable referrer (e.g. direct visits).
 */
export const sanitizeReferrer = (referrer: string): string | undefined => {
  if (!referrer) return undefined

  try {
    const url = new URL(referrer)
    return `${url.origin}${url.pathname}`
  }
  catch {
    return undefined
  }
}
