// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, test } from 'vitest'
import ComicPreview from './ComicPreview.astro'

test('ComicPreview renders comic titles', async () => {
  const container = await AstroContainer.create()
  const view = await container.renderToString(ComicPreview, {
    props: {
      comics: [
        {
          id: 1,
          title: 'Thor #1',
          thumbnail: { path: 'https://i.annihil.us/thor', extension: 'jpg' }
        }
      ]
    }
  })
  expect(view).toContain('Thor #1')
  expect(view).toContain('https://i.annihil.us/thor.jpg')
})
