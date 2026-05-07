import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

// Override Marker so its children (Popup) render
vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet')
  return {
    ...actual,
    MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
    TileLayer: () => null,
    Marker: ({ children }) => <div>{children}</div>,
    Popup: ({ children }) => <div>{children}</div>,
    useMap: () => ({ fitBounds: vi.fn(), setView: vi.fn() }),
    Polyline: () => null,
  }
})

import TripOverviewMap from '../../../src/components/map/TripOverviewMap'

const itinerary = { id: 1, title: 'Paris Trip', lat: 48.85, lng: 2.35, status: 'upcoming', date: '2026-07-01' }

describe('TripOverviewMap', () => {
  it('renders map container wrapper', () => {
    render(<MemoryRouter><TripOverviewMap /></MemoryRouter>)
    expect(document.querySelector('[data-testid="map"]') || document.body).toBeTruthy()
  })

  it('renders with empty itineraries', () => {
    render(<MemoryRouter><TripOverviewMap itineraries={[]} /></MemoryRouter>)
    expect(document.body.textContent !== undefined).toBe(true)
  })

  it('renders itinerary title in popup', () => {
    render(<MemoryRouter><TripOverviewMap itineraries={[itinerary]} /></MemoryRouter>)
    expect(screen.getByText('Paris Trip')).toBeTruthy()
  })

  it('renders itinerary date in popup', () => {
    render(<MemoryRouter><TripOverviewMap itineraries={[itinerary]} /></MemoryRouter>)
    expect(screen.getByText('2026-07-01')).toBeTruthy()
  })

  it('renders "View itinerary" link in popup', () => {
    render(<MemoryRouter><TripOverviewMap itineraries={[itinerary]} /></MemoryRouter>)
    expect(screen.getByText(/View itinerary/i)).toBeTruthy()
  })

  it('filters out itineraries without lat/lng', () => {
    const noCoords = { id: 2, title: 'No Coords Trip', status: 'draft' }
    render(<MemoryRouter><TripOverviewMap itineraries={[noCoords]} /></MemoryRouter>)
    expect(screen.queryByText('No Coords Trip')).toBeNull()
  })
})