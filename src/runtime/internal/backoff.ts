/** Hard cap on the exponential multiplier, so the delay can't grow without bound. */
const MAX_BACKOFF_FACTOR = 30

/**
 * Exponential backoff for failed flush retries: each successive attempt waits
 * `base * 2^(attempt - 1)` ms, capped at `base * MAX_BACKOFF_FACTOR`.
 *
 * @param base    Base delay in ms (the module/per-action `retryAfter`).
 * @param attempt 1-based count of attempts already failed for the batch.
 */
export const backoffDelay = (base: number, attempt: number): number => {
  const factor = Math.min(2 ** Math.max(attempt - 1, 0), MAX_BACKOFF_FACTOR)
  return base * factor
}