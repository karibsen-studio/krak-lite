export const sanitizePath = (fullPath: string): string => {
  const url = new URL(fullPath, window.location.origin)

  for (const key of url.searchParams.keys()) {
    url.searchParams.delete(key)
  }

  return `${url.pathname}${url.hash}`
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
