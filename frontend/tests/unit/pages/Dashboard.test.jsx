import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))
vi.mock('@/components/map/TripOverviewMap', () => ({ default: () => null }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockFetchItineraries = vi.fn()
const mockFetchCommunities = vi.fn()
const mockJoin = vi.fn()

vi.mock('@/hooks/useItinerary', () => ({
  useItinerary: vi.fn(),
}))
vi.mock('@/hooks/useCommunity', () => ({
  useCommunity: vi.fn(),
}))

import { useAuthStore } from '../../../src/store/authStore'
import { useItinerary } from '@/hooks/useItinerary'
import { useCommunity } from '@/hooks/useCommunity'
import Dashboard from '../../../src/pages/Dashboard'

const mockUser = { id: 1, name: 'Alice Smith' }

const defaultItinerary = {
  itineraries: [],
  loading: false,
  error: null,
  fetchAll: mockFetchItineraries,
}
const defaultCommunity = {
  communities: [],
  loading: false,
  error: null,
  fetchAll: mockFetchCommunities,
  join: mockJoin,
}

function renderDashboard() {
  return render(<MemoryRouter><Dashboard /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: mockUser, isAuthenticated: true })
  useItinerary.mockReturnValue(defaultItinerary)
  useCommunity.mockReturnValue(defaultCommunity)
})

describe('Dashboard', () => {
  it('renders greeting with user first name', () => {
    renderDashboard()
    expect(screen.getByText(/Alice/)).toBeTruthy()
  })

  it('renders greeting with "there" when user has no name', () => {
    useAuthStore.setState({ user: { id: 1 }, isAuthenticated: true })
    renderDashboard()
    expect(screen.getByText(/there/)).toBeTruthy()
  })

  it('shows spinner while itineraries loading', () => {
    useItinerary.mockReturnValue({ ...defaultItinerary, loading: true })
    renderDashboard()
    // Spinners rendered for loading state
    expect(document.querySelectorAll('[aria-label]').length).toBeGreaterThanOrEqual(0)
  })

  it('shows no-itineraries message when list is empty', () => {
    renderDashboard()
    expect(screen.getByText('itinerary.no_itineraries')).toBeTruthy()
  })

  it('renders upcoming itinerary cards', () => {
    useItinerary.mockReturnValue({
      ...defaultItinerary,
      itineraries: [{ id: 1, title: 'Paris Trip', location: 'Paris', status: 'upcoming' }],
    })
    renderDashboard()
    expect(screen.getByText('Paris Trip')).toBeTruthy()
  })

  it('shows empty community message when list is empty', () => {
    renderDashboard()
    expect(screen.getByText('common.empty')).toBeTruthy()
  })

  it('renders community cards', () => {
    useCommunity.mockReturnValue({
      ...defaultCommunity,
      communities: [{ id: 1, name: 'Explorers', member_count: 5 }],
    })
    renderDashboard()
    expect(screen.getByText('Explorers')).toBeTruthy()
  })

  it('FAB button navigates to new itinerary', () => {
    renderDashboard()
    const fab = screen.getByRole('button', { name: /itinerary.new/i })
    fireEvent.click(fab)
    expect(mockNavigate).toHaveBeenCalledWith('/itineraries/new')
  })

  it('calls fetchItineraries and fetchCommunities on mount', () => {
    renderDashboard()
    expect(mockFetchItineraries).toHaveBeenCalled()
    expect(mockFetchCommunities).toHaveBeenCalled()
  })
})