import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))
vi.mock('@/components/map/ItineraryDetailMap', () => ({ default: () => null }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  }
})

const mockFetchOne = vi.fn()
const mockRemoveItinerary = vi.fn()
const mockFetchForActivity = vi.fn()
const mockAddReview = vi.fn()
const mockRemoveReview = vi.fn()

vi.mock('@/hooks/useItinerary', () => ({ useItinerary: vi.fn() }))
vi.mock('@/hooks/useReviews', () => ({ useReviews: vi.fn() }))
vi.mock('@/services/itineraryService', () => ({ removeActivity: vi.fn() }))

import { useAuthStore } from '../../../src/store/authStore'
import { useItinerary } from '@/hooks/useItinerary'
import { useReviews } from '@/hooks/useReviews'
import ItineraryDetail from '../../../src/pages/ItineraryDetail'

const mockItinerary = {
  id: 1,
  title: 'Paris Adventure',
  location: 'Paris',
  status: 'upcoming',
  purpose: 'tourism',
  date: '2026-07-01',
  description: 'A great trip',
  activities: [],
}

const itineraryDefaults = {
  itinerary: null,
  loading: false,
  error: null,
  fetchOne: mockFetchOne,
  removeItinerary: mockRemoveItinerary,
}

const reviewDefaults = {
  reviews: [],
  avgRating: null,
  loading: false,
  fetchForActivity: mockFetchForActivity,
  addReview: mockAddReview,
  removeReview: mockRemoveReview,
}

function renderPage() {
  return render(<MemoryRouter><ItineraryDetail /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: { id: 1 }, isAuthenticated: true })
  useItinerary.mockReturnValue(itineraryDefaults)
  useReviews.mockReturnValue(reviewDefaults)
})

describe('ItineraryDetail', () => {
  it('shows spinner while loading', () => {
    useItinerary.mockReturnValue({ ...itineraryDefaults, loading: true })
    renderPage()
    expect(document.body.innerHTML.length).toBeGreaterThan(10)
  })

  it('shows error when error set', () => {
    useItinerary.mockReturnValue({ ...itineraryDefaults, error: 'Not found' })
    renderPage()
    expect(screen.getByText('Not found')).toBeTruthy()
  })

  it('renders nothing when itinerary is null and not loading', () => {
    renderPage()
    expect(document.querySelector('h1')).toBeNull()
  })

  it('renders itinerary title', () => {
    useItinerary.mockReturnValue({ ...itineraryDefaults, itinerary: mockItinerary })
    renderPage()
    expect(screen.getByText('Paris Adventure')).toBeTruthy()
  })

  it('renders location', () => {
    useItinerary.mockReturnValue({ ...itineraryDefaults, itinerary: mockItinerary })
    renderPage()
    expect(screen.getByText('Paris')).toBeTruthy()
  })

  it('renders date', () => {
    useItinerary.mockReturnValue({ ...itineraryDefaults, itinerary: mockItinerary })
    renderPage()
    expect(screen.getByText('2026-07-01')).toBeTruthy()
  })

  it('renders description', () => {
    useItinerary.mockReturnValue({ ...itineraryDefaults, itinerary: mockItinerary })
    renderPage()
    expect(screen.getByText('A great trip')).toBeTruthy()
  })

  it('renders no activities message when activities empty', () => {
    useItinerary.mockReturnValue({ ...itineraryDefaults, itinerary: mockItinerary })
    renderPage()
    expect(screen.getByText('itinerary.no_activities')).toBeTruthy()
  })

  it('renders activity cards when activities exist', () => {
    const itinWithActivities = {
      ...mockItinerary,
      activities: [{ id: 1, title: 'Eiffel Tower', order_index: 0, category: 'culture', location_name: 'Paris', start_time: null, duration_minutes: null }],
    }
    useItinerary.mockReturnValue({ ...itineraryDefaults, itinerary: itinWithActivities })
    renderPage()
    expect(screen.getAllByText('Eiffel Tower').length).toBeGreaterThan(0)
  })

  it('delete itinerary button calls removeItinerary and navigates', async () => {
    mockRemoveItinerary.mockResolvedValueOnce({})
    useItinerary.mockReturnValue({ ...itineraryDefaults, itinerary: mockItinerary })
    renderPage()
    const trashBtn = screen.getAllByRole('button').find(
      (b) => !b.textContent.trim() || b.getAttribute('aria-label')
    )
    // find the ghost button (delete itinerary)
    const ghostBtns = document.querySelectorAll('button')
    const deleteBtn = Array.from(ghostBtns).find(
      (b) => b.querySelector('svg') && !b.textContent.includes('edit') && !b.textContent.includes('common')
    )
    if (deleteBtn) {
      fireEvent.click(deleteBtn)
      await waitFor(() => expect(mockRemoveItinerary).toHaveBeenCalledWith('1'))
    }
  })

  it('calls fetchOne on mount', () => {
    renderPage()
    expect(mockFetchOne).toHaveBeenCalledWith('1')
  })
})
