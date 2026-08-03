import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CharactersExplorer } from './CharactersExplorer'

const mockFetch = vi.fn()

const charactersResponse = {
  ok: true,
  json: async () => ({
    results: [{ id: '2', name: 'Hulk' }],
    total: 1,
    counts: { heroes: 1, villains: 0, marvel: 0, dc: 0, others: 0 }
  })
}

const search = (value: string) => {
  fireEvent.change(screen.getByPlaceholderText('SEARCH CHARACTERS...'), {
    target: { value }
  })
  fireEvent.keyDown(screen.getByPlaceholderText('SEARCH CHARACTERS...'), {
    key: 'Enter'
  })
}

describe('CharactersExplorer', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(charactersResponse)
    vi.stubGlobal('fetch', mockFetch)
    vi.clearAllMocks()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the empty state and does not fetch without a query', () => {
    render(<CharactersExplorer />)
    expect(screen.getByText(/search the hero base/i)).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches results through the api route when searching', async () => {
    render(<CharactersExplorer />)
    search('hulk')
    await screen.findByText('Hulk')
    const firstCallUrl = new URL(mockFetch.mock.calls[0][0])
    expect(firstCallUrl.pathname).toContain('/api/characters')
    expect(firstCallUrl.searchParams.get('q')).toBe('hulk')
    expect(firstCallUrl.searchParams.get('page')).toBe('1')
    expect(window.location.search).toContain('query=hulk')
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
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
      json: async () => ({
        results: [],
        total: 0,
        counts: { heroes: 0, villains: 0, marvel: 0, dc: 0, others: 0 }
      })
    })
    render(<CharactersExplorer />)
    search('zzz')
    expect(await screen.findByText(/no heroes found/i)).toBeInTheDocument()
  })

  it('applies the villains filter, updates the url and marks the chip active', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ id: '2', name: 'Hulk' }],
        total: 1,
        counts: { heroes: 4, villains: 3, marvel: 3, dc: 3, others: 3 }
      })
    })
    render(<CharactersExplorer />)
    search('hulk')
    await screen.findByText('Hulk')
    fireEvent.click(screen.getByRole('button', { name: /villains/i }))
    const villainsCall = mockFetch.mock.calls.at(-1)?.[0] as string
    expect(new URL(villainsCall).searchParams.get('filter')).toBe('villains')
    expect(window.location.search).toContain('filter=villains')
    expect(screen.getByRole('button', { name: /villains/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('restores the page from the url and links details with the page state', async () => {
    window.history.replaceState({}, '', '/?query=hulk&page=2')
    render(<CharactersExplorer />)
    await screen.findByText('Hulk')
    const callUrl = new URL(mockFetch.mock.calls.at(-1)?.[0] as string)
    expect(callUrl.searchParams.get('page')).toBe('2')
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/details/2?query=hulk&page=2'
    )
  })

  it('stores the page in the url when navigating pages', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ id: '2', name: 'Hulk' }],
        total: 3,
        counts: { heroes: 1, villains: 0, marvel: 0, dc: 0, others: 0 }
      })
    })
    render(<CharactersExplorer />)
    search('hulk')
    await screen.findByText('Hulk')
    fireEvent.click(screen.getByRole('button', { name: 'go to page 2' }))
    const pageTwoCall = mockFetch.mock.calls.at(-1)?.[0] as string
    expect(new URL(pageTwoCall).searchParams.get('page')).toBe('2')
    expect(window.location.search).toContain('page=2')
  })

  it('clears the page param from the url when the query changes', async () => {
    window.history.replaceState({}, '', '/?query=hulk&page=2')
    render(<CharactersExplorer />)
    await screen.findByText('Hulk')
    search('thor')
    expect(new URL(window.location.href).searchParams.get('page')).toBeNull()
    const latestCall = mockFetch.mock.calls.at(-1)?.[0] as string
    expect(new URL(latestCall).searchParams.get('page')).toBe('1')
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
