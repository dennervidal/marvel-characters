import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSignedUrl } from './signing'

const PUBLIC_KEY = 'public-key-123'
const PRIVATE_KEY = 'private-key-456'

describe('buildSignedUrl', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_MARVEL_API_KEY', PUBLIC_KEY)
    vi.stubEnv('MARVEL_PRIVATE_KEY', PRIVATE_KEY)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('builds a URL with apikey, ts and a correct md5 hash', async () => {
    const url = new URL(
      await buildSignedUrl({
        path: '/characters',
        params: { limit: 10, offset: 0 }
      })
    )
    expect(url.origin + url.pathname).toBe(
      'https://gateway.marvel.com/v1/public/characters'
    )
    expect(url.searchParams.get('apikey')).toBe(PUBLIC_KEY)
    expect(url.searchParams.get('limit')).toBe('10')
    expect(url.searchParams.get('offset')).toBe('0')
    const ts = url.searchParams.get('ts')
    expect(ts).toBeTruthy()
    const expectedHash = createHash('md5')
      .update(`${ts}${PRIVATE_KEY}${PUBLIC_KEY}`)
      .digest('hex')
    expect(url.searchParams.get('hash')).toBe(expectedHash)
  })

  it('omits params when none are passed', async () => {
    const url = new URL(await buildSignedUrl({ path: '/characters' }))
    expect(url.searchParams.get('apikey')).toBe(PUBLIC_KEY)
    expect(url.searchParams.has('limit')).toBe(false)
  })
})
