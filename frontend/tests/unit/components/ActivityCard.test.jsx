import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ActivityCard from '../../../src/components/cards/ActivityCard'

const mockActivity = {
  id: 1,
  title: 'Visit Eiffel Tower',
  order_index: 0,
  category: 'culture',
  location_name: 'Champ de Mars, Paris',
  start_time: '10:00',
  duration_minutes: 90,
  description: 'The iconic iron tower.',
}

describe('ActivityCard', () => {
  it('renders activity title', () => {
    render(<MemoryRouter><ActivityCard activity={mockActivity} /></MemoryRouter>)
    expect(screen.getByText('Visit Eiffel Tower')).toBeTruthy()
  })

  it('renders order number (order_index + 1)', () => {
    render(<MemoryRouter><ActivityCard activity={mockActivity} /></MemoryRouter>)
    expect(screen.getByText('1')).toBeTruthy()
  })

  it('renders location', () => {
    render(<MemoryRouter><ActivityCard activity={mockActivity} /></MemoryRouter>)
    expect(screen.getByText('Champ de Mars, Paris')).toBeTruthy()
  })

  it('renders start_time', () => {
    render(<MemoryRouter><ActivityCard activity={mockActivity} /></MemoryRouter>)
    expect(screen.getByText('10:00')).toBeTruthy()
  })

  it('renders description', () => {
    render(<MemoryRouter><ActivityCard activity={mockActivity} /></MemoryRouter>)
    expect(screen.getByText('The iconic iron tower.')).toBeTruthy()
  })

  it('does not show controls by default', () => {
    render(<MemoryRouter><ActivityCard activity={mockActivity} /></MemoryRouter>)
    expect(screen.queryByLabelText(/edit/i)).toBeNull()
    expect(screen.queryByLabelText(/delete/i)).toBeNull()
  })

  it('shows edit and delete buttons when showControls is true', () => {
    render(
      <MemoryRouter>
        <ActivityCard activity={mockActivity} showControls onEdit={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/edit/i)).toBeTruthy()
    expect(screen.getByLabelText(/delete/i)).toBeTruthy()
  })

  it('calls onEdit with activity when edit clicked', () => {
    const onEdit = vi.fn()
    render(
      <MemoryRouter>
        <ActivityCard activity={mockActivity} showControls onEdit={onEdit} onDelete={vi.fn()} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText(/edit/i))
    expect(onEdit).toHaveBeenCalledWith(mockActivity)
  })

  it('calls onDelete with activity id when delete clicked', () => {
    const onDelete = vi.fn()
    render(
      <MemoryRouter>
        <ActivityCard activity={mockActivity} showControls onEdit={vi.fn()} onDelete={onDelete} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText(/delete/i))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('renders without optional fields', () => {
    const minimal = { id: 2, title: 'Quick Stop', order_index: 1 }
    render(<MemoryRouter><ActivityCard activity={minimal} /></MemoryRouter>)
    expect(screen.getByText('Quick Stop')).toBeTruthy()
  })
})