import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../../../src/components/layout/Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText(/Locavio/i)).toBeTruthy()
  })

  it('renders About link', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText('About')).toBeTruthy()
  })

  it('renders Contact link', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText('Contact')).toBeTruthy()
  })
})