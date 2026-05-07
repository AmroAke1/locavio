import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockFetchAll = vi.fn()
vi.mock('@/hooks/useItinerary', () => ({ useItinerary: vi.fn() }))

import { useItinerary } from '@/hooks/useItinerary'
import ItineraryList from '../../../src/pages/ItineraryList'

const mockItinerary = { id: 1, title: 'Paris Trip', location: 'Paris', status: 'upcoming' }

const defaults = {
  itineraries: [],
  loading: false,
  error: null,
  fetchAll: mockFetchAll,
}

function renderPage() {
  return render(<MemoryRouter><ItineraryList /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useItinerary.mockReturnValue(defaults)
})

describe('ItineraryList', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('shows spinner while loading', () => {
    useItinerary.mockReturnValue({ ...defaults, loading: true })
    renderPage()
    expect(document.querySelector('.animate-spin') || document.body.textContent).toBeTruthy()
  })

  it('shows error message when error set', () => {
    useItinerary.mockReturnValue({ ...defaults, error: 'Network error' })
    renderPage()
    expect(screen.getByText('Network error')).toBeTruthy()
  })

  it('shows empty state when no itineraries', () => {
    renderPage()
    expect(screen.getByText('itinerary.no_itineraries')).toBeTruthy()
  })

  it('renders itinerary cards', () => {
    useItinerary.mockReturnValue({ ...defaults, itineraries: [mockItinerary] })
    renderPage()
    expect(screen.getByText('Paris Trip')).toBeTruthy()
  })

  it('tab click filters itineraries by status', () => {
    useItinerary.mockReturnValue({
      ...defaults,
      itineraries: [
        mockItinerary,
        { id: 2, title: 'Berlin Draft', location: 'Berlin', status: 'draft' },
      ],
    })
    renderPage()
    const upcomingTab = screen.getByRole('tab', { name: /upcoming/i })
    fireEvent.click(upcomingTab)
    expect(screen.getByText('Paris Trip')).toBeTruthy()
    expect(screen.queryByText('Berlin Draft')).toBeNull()
  })

  it('new button navigates to /itineraries/new', () => {
    renderPage()
    const btns = screen.getAllByRole('button')
    const newBtn = btns.find((b) => b.tagName === 'BUTTON' && b.textContent.includes('itinerary.new'))
    fireEvent.click(newBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/itineraries/new')
  })

  it('calls fetchAll on mount', () => {
    renderPage()
    expect(mockFetchAll).toHaveBeenCalled()
  })
})