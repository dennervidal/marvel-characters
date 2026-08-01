import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingPlaceholder } from './LoadingPlaceholder'

describe('LoadingPlaceholder', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingPlaceholder loading={false}>
        <p>teste</p>
      </LoadingPlaceholder>
    )
    expect(screen.getByText(/teste/i)).toBeInTheDocument()
  })

  it('renders the spinner while loading', () => {
    render(
      <LoadingPlaceholder loading={true}>
        <p>teste</p>
      </LoadingPlaceholder>
    )
    expect(screen.getByLabelText('loading')).toBeInTheDocument()
  })
})
