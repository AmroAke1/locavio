import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

// Override Marker so its children (Popup) render
vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet')
  return {
    ...actual,
    MapContainer: ({ children }) => <div data-testid="detail-map">{children}</div>,
    TileLayer: () => null,
    Marker: ({ children }) => <div>{children}</div>,
    Popup: ({ children }) => <div>{children}</div>,
    Polyline: () => null,
    useMap: () => ({ fitBounds: vi.fn(), setView: vi.fn() }),
  }
})

import ItineraryDetailMap from '../../../src/components/map/ItineraryDetailMap'

const activityWithCoords = {
  id: 1,
  title: 'Eiffel Tower',
  lat: 48.858,
  lng: 2.295,
  order_index: 0,
  category: 'culture',
  duration_minutes: 90,
}

describe('ItineraryDetailMap', () => {
  it('shows empty state when no activities', () => {
    render(<MemoryRouter><ItineraryDetailMap activities={[]} /></MemoryRouter>)
    expect(screen.getByText(/no coordinates yet/i)).toBeTruthy()
  })

  it('shows empty state when activities have no coords', () => {
    render(<MemoryRouter><ItineraryDetailMap activities={[{ id: 1, title: 'No coords', order_index: 0 }]} /></MemoryRouter>)
    expect(screen.getByText(/no coordinates yet/i)).toBeTruthy()
  })

  it('renders map with valid activity', () => {
    render(<MemoryRouter><ItineraryDetailMap activities={[activityWithCoords]} /></MemoryRouter>)
    expect(document.querySelector('[data-testid="detail-map"]')).toBeTruthy()
  })

  it('renders activity title in popup', () => {
    render(<MemoryRouter><ItineraryDetailMap activities={[activityWithCoords]} /></MemoryRouter>)
    expect(screen.getByText(/1\. Eiffel Tower/)).toBeTruthy()
  })

  it('renders activity category badge in popup', () => {
    render(<MemoryRouter><ItineraryDetailMap activities={[activityWithCoords]} /></MemoryRouter>)
    expect(screen.getByText('activity.category.culture')).toBeTruthy()
  })

  it('renders duration when present', () => {
    render(<MemoryRouter><ItineraryDetailMap activities={[activityWithCoords]} /></MemoryRouter>)
    expect(screen.getByText(/90/)).toBeTruthy()
  })

  it('renders without optional activity fields', () => {
    const minimal = { id: 2, title: 'Minimal', lat: 48.0, lng: 2.0, order_index: 0 }
    render(<MemoryRouter><ItineraryDetailMap activities={[minimal]} /></MemoryRouter>)
    expect(screen.getByText(/1\. Minimal/)).toBeTruthy()
  })
})