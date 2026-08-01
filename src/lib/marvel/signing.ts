import { ROOT_MARVEL_API_URL } from './constants'

const SHIFT_AMOUNTS: number[] = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
]

const SINE_CONSTANTS: number[] = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)
)

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

const md5Fallback = (input: Uint8Array): string => {
  const bitLength = input.length * 8
  const padded = new Uint8Array(((input.length + 8) >> 6 << 6) + 64)
  padded.set(input)
  padded[input.length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 8, bitLength, true)
  view.setUint32(padded.length - 4, 0, true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476
  const words = new Uint32Array(16)

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      words[i] = view.getUint32(offset + i * 4, true)
    }
    let a = a0
    let b = b0
    let c = c0
    let d = d0
    for (let i = 0; i < 64; i++) {
      let f: number
      let g: number
      if (i < 16) {
        f = (b & c) | (~b & d)
        g = i
      } else if (i < 32) {
        f = (d & b) | (~d & c)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        f = b ^ c ^ d
        g = (3 * i + 5) % 16
      } else {
        f = c ^ (b | ~d)
        g = (7 * i) % 16
      }
      const sum = (f + a + SINE_CONSTANTS[i] + words[g]) | 0
      const rotated = ((sum << SHIFT_AMOUNTS[i]) | (sum >>> (32 - SHIFT_AMOUNTS[i]))) | 0
      a = d
      d = c
      c = b
      b = (b + rotated) | 0
    }
    a0 = (a0 + a) | 0
    b0 = (b0 + b) | 0
    c0 = (c0 + c) | 0
    d0 = (d0 + d) | 0
  }

  const out = new DataView(new ArrayBuffer(16))
  out.setUint32(0, a0, true)
  out.setUint32(4, b0, true)
  out.setUint32(8, c0, true)
  out.setUint32(12, d0, true)
  return toHex(new Uint8Array(out.buffer))
}

const md5 = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input)
  try {
    const digest = await crypto.subtle.digest('MD5', data)
    return toHex(new Uint8Array(digest))
  } catch {
    return md5Fallback(data)
  }
}

export const buildSignedUrl = async ({
  path,
  params = {}
}: {
  path: string
  params?: Record<string, string | number>
}): Promise<string> => {
  const ts = crypto.randomUUID()
  const publicKey = import.meta.env.PUBLIC_MARVEL_API_KEY as string
  const privateKey = import.meta.env.MARVEL_PRIVATE_KEY as string
  const hash = await md5(`${ts}${privateKey}${publicKey}`)
  const search = new URLSearchParams({
    ts,
    apikey: publicKey,
    hash,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    )
  })
  return `${ROOT_MARVEL_API_URL}${path}?${search.toString()}`
}
