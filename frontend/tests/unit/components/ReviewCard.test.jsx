import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ReviewCard from '../../../src/components/cards/ReviewCard'

const mockReview = {
  id: 1,
  rating: 4,
  comment: 'Really enjoyed this activity!',
  created_at: '2026-01-15T12:00:00Z',
  user: { name: 'Alice' },
}

describe('ReviewCard', () => {
  it('renders reviewer name', () => {
    render(<MemoryRouter><ReviewCard review={mockReview} /></MemoryRouter>)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders user initial in avatar', () => {
    render(<MemoryRouter><ReviewCard review={mockReview} /></MemoryRouter>)
    expect(screen.getByText('A')).toBeTruthy()
  })

  it('renders comment', () => {
    render(<MemoryRouter><ReviewCard review={mockReview} /></MemoryRouter>)
    expect(screen.getByText('Really enjoyed this activity!')).toBeTruthy()
  })

  it('renders formatted date', () => {
    render(<MemoryRouter><ReviewCard review={mockReview} /></MemoryRouter>)
    expect(screen.getByText(/2026/)).toBeTruthy()
  })

  it('renders Anonymous when no user', () => {
    render(<MemoryRouter><ReviewCard review={{ ...mockReview, user: null }} /></MemoryRouter>)
    expect(screen.getByText('Anonymous')).toBeTruthy()
  })

  it('shows ? initial when user has no name', () => {
    render(<MemoryRouter><ReviewCard review={{ ...mockReview, user: {} }} /></MemoryRouter>)
    expect(screen.getByText('?')).toBeTruthy()
  })

  it('renders without comment gracefully', () => {
    render(<MemoryRouter><ReviewCard review={{ ...mockReview, comment: null }} /></MemoryRouter>)
    expect(screen.getByText('Alice')).toBeTruthy()
  })
})