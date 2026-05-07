import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ItineraryCard from '../../../src/components/cards/ItineraryCard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const baseItinerary = {
  id: 1,
  title: 'Paris Trip',
  location: 'Paris',
  date: '2026-07-01',
  status: 'upcoming',
  purpose: 'tourism',
  generated_by_ai: false,
}

describe('ItineraryCard', () => {
  it('renders title', () => {
    render(<MemoryRouter><ItineraryCard itinerary={baseItinerary} /></MemoryRouter>)
    expect(screen.getByText('Paris Trip')).toBeTruthy()
  })

  it('renders location', () => {
    render(<MemoryRouter><ItineraryCard itinerary={baseItinerary} /></MemoryRouter>)
    expect(screen.getByText('Paris')).toBeTruthy()
  })

  it('renders date', () => {
    render(<MemoryRouter><ItineraryCard itinerary={baseItinerary} /></MemoryRouter>)
    expect(screen.getByText('2026-07-01')).toBeTruthy()
  })

  it('shows AI badge when generated_by_ai is true', () => {
    render(<MemoryRouter><ItineraryCard itinerary={{ ...baseItinerary, generated_by_ai: true }} /></MemoryRouter>)
    expect(screen.getByText(/AI/i)).toBeTruthy()
  })

  it('does not show AI badge when generated_by_ai is false', () => {
    render(<MemoryRouter><ItineraryCard itinerary={baseItinerary} /></MemoryRouter>)
    expect(screen.queryByText(/AI/i)).toBeNull()
  })

  it('navigates to itinerary detail on click', () => {
    render(<MemoryRouter><ItineraryCard itinerary={baseItinerary} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/itineraries/1')
  })

  it('navigates on Enter key', () => {
    render(<MemoryRouter><ItineraryCard itinerary={baseItinerary} /></MemoryRouter>)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(mockNavigate).toHaveBeenCalledWith('/itineraries/1')
  })

  it('renders without date and location gracefully', () => {
    const minimal = { id: 2, status: 'draft', purpose: 'tourism', generated_by_ai: false }
    render(<MemoryRouter><ItineraryCard itinerary={minimal} /></MemoryRouter>)
    expect(screen.getByRole('button')).toBeTruthy()
  })
})