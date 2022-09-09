import { render, screen } from '@testing-library/react'
import React from 'react'
import { LoadingPlaceholder } from './LoadingPlaceholder'

test('renders loading placeholder', () => {
  render(
    <LoadingPlaceholder loading={false}>
      <p>teste</p>
    </LoadingPlaceholder>
  )
  const children = screen.getByText(/teste/i)
  expect(children).toBeInTheDocument()
})
