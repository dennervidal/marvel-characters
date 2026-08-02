import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchHeader } from './SearchHeader'

describe('SearchHeader', () => {
  it('renders the search header with the query as input value', () => {
    render(<SearchHeader query='thor' updateQuery={vi.fn()} />)
    expect(screen.getByText(/find a character/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('thor')).toBeInTheDocument()
  })
})
