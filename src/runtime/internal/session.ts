/**
 * Anonymous session id. Kept in memory only (never persisted to storage or
 * cookies), so it cannot be tied back to a returning visitor - it just lets
 * the backend group actions that happened in the same page lifetime.
 */
export const createSessionId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `krak_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}
