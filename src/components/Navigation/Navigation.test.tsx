import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Navigation } from './Navigation'

describe('Navigation', () => {
  it('renders nothing when total is 1 or less', () => {
    render(<Navigation page={1} total={1} onChange={vi.fn()} />)
    expect(
      screen.queryByRole('navigation', { name: 'pagination' })
    ).not.toBeInTheDocument()
  })

  it('calls onChange with the selected page', () => {
    const onChange = vi.fn()
    render(<Navigation page={1} total={5} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /go to page 3/i }))
    expect(onChange).toHaveBeenCalledWith(3)
  })
})
