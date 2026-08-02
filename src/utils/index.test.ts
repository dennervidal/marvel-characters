import { describe, expect, it } from 'vitest'
import { isEmpty } from './index'

describe('isEmpty', () => {
  it('returns true for undefined, null and empty string', () => {
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty('')).toBe(true)
  })

  it('returns false for a non-empty string', () => {
    expect(isEmpty('thor')).toBe(false)
  })
})
