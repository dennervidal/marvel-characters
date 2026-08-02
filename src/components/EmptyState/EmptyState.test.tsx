import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('shows the no-heroes title with the query term chip', () => {
    render(
      <EmptyState query='thanos' onClear={vi.fn()} onSuggestion={vi.fn()} />
    )
    expect(screen.getByText('NO HEROES FOUND')).toBeInTheDocument()
    expect(screen.getByText('thanos')).toBeInTheDocument()
  })

  it('calls onClear when CLEAR FILTERS is clicked', () => {
    const onClear = vi.fn()
    render(
      <EmptyState query='thanos' onClear={onClear} onSuggestion={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(onClear).toHaveBeenCalled()
  })

  it('calls onSuggestion with the suggestion query', () => {
    const onSuggestion = vi.fn()
    render(
      <EmptyState query='' onClear={vi.fn()} onSuggestion={onSuggestion} />
    )
    fireEvent.click(screen.getByRole('button', { name: /hulk/i }))
    expect(onSuggestion).toHaveBeenCalledWith('HULK')
  })
})
