import { describe, it, expect } from 'vitest'
import { backoffDelay } from '../src/runtime/internal/backoff'

describe('backoffDelay', () => {
  it('returns the base delay for the first attempt', () => {
    expect(backoffDelay(5000, 1)).toBe(5000)
  })

  it('doubles with each successive attempt', () => {
    expect(backoffDelay(5000, 2)).toBe(10000)
    expect(backoffDelay(5000, 3)).toBe(20000)
    expect(backoffDelay(5000, 4)).toBe(40000)
  })

  it('caps the multiplier so the delay cannot grow without bound', () => {
    // 2^9 = 512 would be way past the cap of 30
    expect(backoffDelay(1000, 10)).toBe(30000)
    expect(backoffDelay(1000, 100)).toBe(30000)
  })

  it('treats attempt 0 (or below) as the base delay', () => {
    expect(backoffDelay(5000, 0)).toBe(5000)
    expect(backoffDelay(5000, -3)).toBe(5000)
  })
})