import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('calls onSearch on Enter with the current value', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder='Search' />)
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'thor' }
    })
    fireEvent.keyDown(screen.getByPlaceholderText('Search'), { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('thor')
  })

  it('shows a clear button after typing and clears on click', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder='Search' />)
    const input = screen.getByPlaceholderText('Search')
    fireEvent.change(input, { target: { value: 'hulk' } })
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(onSearch).toHaveBeenCalledWith('')
  })
})
