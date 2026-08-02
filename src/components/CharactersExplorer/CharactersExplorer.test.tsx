import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CharactersExplorer } from './CharactersExplorer'

const mockFetch = vi.fn()

const charactersResponse = {
  ok: true,
  json: async () => ({ results: [{ id: '2', name: 'Hulk' }], total: 1 })
}

const search = (value: string) => {
  fireEvent.change(screen.getByPlaceholderText('Search'), {
    target: { value }
  })
  fireEvent.keyDown(screen.getByPlaceholderText('Search'), { key: 'Enter' })
}

describe('CharactersExplorer', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(charactersResponse)
    vi.stubGlobal('fetch', mockFetch)
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the empty state and does not fetch without a query', () => {
    render(<CharactersExplorer />)
    expect(screen.getByText(/search for a character/i)).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches results through the api route when searching', async () => {
    render(<CharactersExplorer />)
    search('hulk')
    await screen.findByText('Hulk')
    expect(mockFetch.mock.calls[0][0]).toContain('/api/characters')
    expect(window.location.search).toContain('query=hulk')
  })

  it('shows a skeleton while loading and replaces it with results', async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    mockFetch.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve
        })
    )
    render(<CharactersExplorer />)
    search('hulk')
    expect(screen.getByLabelText('loading')).toBeInTheDocument()
    resolveFetch(charactersResponse)
    expect(await screen.findByText('Hulk')).toBeInTheDocument()
  })

  it('shows a no-results message when the search is empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [], total: 0 })
    })
    render(<CharactersExplorer />)
    search('zzz')
    expect(await screen.findByText(/no characters found/i)).toBeInTheDocument()
  })

  it('shows an error state with retry when the fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('boom'))
    render(<CharactersExplorer />)
    search('hulk')
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
    mockFetch.mockResolvedValue(charactersResponse)
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(await screen.findByText('Hulk')).toBeInTheDocument()
  })
})
