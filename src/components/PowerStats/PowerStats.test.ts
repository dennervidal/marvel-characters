// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, test } from 'vitest'
import PowerStats from './PowerStats.astro'

test('PowerStats renders stat labels, values and bar widths', async () => {
  const container = await AstroContainer.create()
  const view = await container.renderToString(PowerStats, {
    props: {
      powerstats: {
        intelligence: '69',
        strength: '100',
        speed: '-',
        durability: '50'
      }
    }
  })
  expect(view).toContain('Intelligence')
  expect(view).toContain('width:100%')
  expect(view).toContain('width:50%')
  expect(view).toContain('width:0%')
})
