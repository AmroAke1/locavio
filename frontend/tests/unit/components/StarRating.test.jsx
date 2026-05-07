import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StarRating from '../../../src/components/ui/StarRating'

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    render(<StarRating rating={3} />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
  })

  it('is read-only when onChange is not provided', () => {
    render(<StarRating rating={3} />)
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('is interactive when onChange is provided', () => {
    const onChange = vi.fn()
    render(<StarRating rating={3} onChange={onChange} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('calls onChange when star is clicked', () => {
    const onChange = vi.fn()
    render(<StarRating rating={0} onChange={onChange} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('handles rating of 0', () => {
    render(<StarRating rating={0} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(<StarRating rating={4} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Rating: 4 out of 5')
  })
})