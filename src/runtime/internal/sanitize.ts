export const sanitizePath = (fullPath: string): string => {
  const url = new URL(fullPath, window.location.origin)

  for (const key of url.searchParams.keys()) {
    url.searchParams.delete(key)
  }

  return `${url.pathname}${url.hash}`
}
