import { describe, it, expect } from 'vitest'
import { sanitizeMeta, isForbiddenMetaKey } from '../src/runtime/internal/sanitize'

describe('isForbiddenMetaKey', () => {
  it('matches sensitive keys case-insensitively', () => {
    expect(isForbiddenMetaKey('email')).toBe(true)
    expect(isForbiddenMetaKey('Email')).toBe(true)
    expect(isForbiddenMetaKey('EMAIL')).toBe(true)
    expect(isForbiddenMetaKey('userId')).toBe(true)
    expect(isForbiddenMetaKey('accessToken')).toBe(true)
  })

  it('leaves non-sensitive keys alone', () => {
    expect(isForbiddenMetaKey('plan')).toBe(false)
    expect(isForbiddenMetaKey('price')).toBe(false)
    expect(isForbiddenMetaKey('id')).toBe(false)
  })
})

describe('sanitizeMeta', () => {
  it('returns undefined / empty unchanged', () => {
    expect(sanitizeMeta(undefined)).toBeUndefined()
    expect(sanitizeMeta({})).toEqual({})
  })

  it('strips sensitive keys at the top level', () => {
    expect(
      sanitizeMeta({ plan: 'pro', email: 'a@b.com', password: 'x' }),
    ).toEqual({ plan: 'pro' })
  })

  it('strips sensitive keys regardless of case', () => {
    expect(
      sanitizeMeta({ Email: 'a@b.com', UserId: 1, keep: true }),
    ).toEqual({ keep: true })
  })

  it('strips sensitive keys in nested objects', () => {
    expect(
      sanitizeMeta({ user: { id: 1, name: 'Ada', token: 'secret' } }),
    ).toEqual({ user: { id: 1 } })
  })

  it('strips sensitive keys inside arrays of objects', () => {
    expect(
      sanitizeMeta({ items: [{ sku: 'a', cc: '4111' }, { sku: 'b' }] }),
    ).toEqual({ items: [{ sku: 'a' }, { sku: 'b' }] })
  })

  it('keeps primitive values untouched', () => {
    expect(
      sanitizeMeta({ count: 3, enabled: false, label: 'x', tags: ['a', 'b'] }),
    ).toEqual({ count: 3, enabled: false, label: 'x', tags: ['a', 'b'] })
  })

  it('does not mutate the input object', () => {
    const input = { plan: 'pro', email: 'a@b.com' }
    sanitizeMeta(input)
    expect(input).toEqual({ plan: 'pro', email: 'a@b.com' })
  })
})
