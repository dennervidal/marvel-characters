import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders page buttons with the active page marked', () => {
    render(<Pagination count={5} page={2} onChange={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: 'go to page 2' })
    ).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('button', { name: /go to page 3/i })
    ).toBeInTheDocument()
  })

  it('calls onChange with the next page', () => {
    const onChange = vi.fn()
    render(<Pagination count={5} page={2} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /go to page 3/i }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('hides prev/first on page 1', () => {
    render(<Pagination count={5} page={1} onChange={vi.fn()} />)
    expect(
      screen.queryByRole('button', { name: /go to previous page/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /go to first page/i })
    ).not.toBeInTheDocument()
  })
})
