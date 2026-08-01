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

  it('calls onSearch when the search button is clicked', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder='Search' />)
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'hulk' }
    })
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(onSearch).toHaveBeenCalledWith('hulk')
  })
})
