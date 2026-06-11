/**
 * Reads the browser's "Do Not Track" signal across the various legacy
 * locations it has historically lived in. Returns false on the server.
 */
export const isDoNotTrackEnabled = (): boolean => {
  if (typeof navigator === 'undefined') return false

  const nav = navigator as Navigator & { msDoNotTrack?: string }
  const win
    = typeof window !== 'undefined'
      ? (window as Window & { doNotTrack?: string })
      : undefined

  const signal = nav.doNotTrack ?? win?.doNotTrack ?? nav.msDoNotTrack

  return signal === '1' || signal === 'yes'
}
