import { describe, expect, it } from 'vitest'
import { heroImageUrl } from './hero-image'

describe('heroImageUrl', () => {
  it('builds the jsDelivr lg image url from id and slugified name', () => {
    expect(heroImageUrl('659', 'Thor')).toBe(
      'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/659-thor.jpg'
    )
  })

  it('slugifies spaces and punctuation', () => {
    expect(heroImageUrl('620', 'Spider-Man')).toContain('620-spider-man.jpg')
    expect(heroImageUrl('174', 'Cheetah III')).toContain('174-cheetah-iii.jpg')
  })

  it('uses akabab slug exceptions for punctuation-heavy names', () => {
    expect(heroImageUrl('114', 'Bling!')).toContain('114-bling!.jpg')
    expect(heroImageUrl('353', 'James T. Kirk')).toContain(
      '353-james-t.-kirk.jpg'
    )
    expect(heroImageUrl('538', "Ra's Al Ghul")).toContain('538-ras-al-ghul.jpg')
  })

  it('returns undefined when id or name is missing', () => {
    expect(heroImageUrl(undefined, 'Thor')).toBeUndefined()
    expect(heroImageUrl('659', undefined)).toBeUndefined()
  })
})
