import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchHeader } from './SearchHeader'
import type { CharacterCounts } from '@/types'

const counts: CharacterCounts = {
  heroes: 4,
  villains: 2,
  marvel: 3,
  dc: 1,
  others: 0
}

describe('SearchHeader', () => {
  it('renders the search input with the query value', () => {
    render(
      <SearchHeader
        query='thor'
        updateQuery={vi.fn()}
        filter='all'
        counts={counts}
        onFilterChange={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('thor')).toBeInTheDocument()
  })

  it('renders filter chips with counts', () => {
    render(
      <SearchHeader
        query=''
        updateQuery={vi.fn()}
        filter='all'
        counts={counts}
        onFilterChange={vi.fn()}
      />
    )
    expect(
      screen.getByRole('button', { name: /heroes\(4\)/i })
    ).toBeInTheDocument()
  })

  it('calls onFilterChange when a chip is clicked', () => {
    const onFilterChange = vi.fn()
    render(
      <SearchHeader
        query=''
        updateQuery={vi.fn()}
        filter='all'
        counts={counts}
        onFilterChange={onFilterChange}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /villains/i }))
    expect(onFilterChange).toHaveBeenCalledWith('villains')
  })
})
