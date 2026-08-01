import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CharactersExplorer } from './CharactersExplorer'

const mockFetch = vi.fn()

const charactersResponse = {
  ok: true,
  json: async () => ({ results: [{ id: 2, name: 'Hulk' }], total: 1 })
}

describe('CharactersExplorer', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(charactersResponse)
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the server-provided initial data', () => {
    render(
      <CharactersExplorer initialData={[{ id: 1, name: 'Thor' }]} total={1} />
    )
    expect(screen.getByText('Thor')).toBeInTheDocument()
  })

  it('fetches new results through the api route when searching', async () => {
    render(
      <CharactersExplorer initialData={[{ id: 1, name: 'Thor' }]} total={1} />
    )
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'hulk' }
    })
    fireEvent.keyDown(screen.getByPlaceholderText('Search'), { key: 'Enter' })
    await screen.findByText('Hulk')
    expect(mockFetch.mock.calls[0][0]).toContain('/api/characters')
  })
})
