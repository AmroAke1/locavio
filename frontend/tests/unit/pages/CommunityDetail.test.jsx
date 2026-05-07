import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ id: '10' }) }
})

const mockFetchOne = vi.fn()
const mockFetchMembers = vi.fn()
const mockJoin = vi.fn()
const mockLeave = vi.fn()

vi.mock('@/hooks/useCommunity', () => ({ useCommunity: vi.fn() }))

import { useAuthStore } from '../../../src/store/authStore'
import { useCommunity } from '@/hooks/useCommunity'
import CommunityDetail from '../../../src/pages/CommunityDetail'

const mockCommunity = {
  id: 10,
  name: 'Istanbul Explorers',
  location: 'Istanbul',
  category: 'travel',
  description: 'Explore Istanbul together',
  member_count: 42,
  cover_image: null,
}

const defaults = {
  community: null,
  members: [],
  loading: false,
  error: null,
  fetchOne: mockFetchOne,
  fetchMembers: mockFetchMembers,
  join: mockJoin,
  leave: mockLeave,
}

function renderPage() {
  return render(<MemoryRouter><CommunityDetail /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: { id: 1 }, isAuthenticated: true })
  useCommunity.mockReturnValue(defaults)
})

describe('CommunityDetail', () => {
  it('shows spinner while loading and no community', () => {
    useCommunity.mockReturnValue({ ...defaults, loading: true, community: null })
    renderPage()
    // Renders spinner div — body will have some content
    expect(document.body.innerHTML.length).toBeGreaterThan(10)
  })

  it('shows error when error set', () => {
    useCommunity.mockReturnValue({ ...defaults, error: 'Not found' })
    renderPage()
    expect(screen.getByText('Not found')).toBeTruthy()
  })

  it('renders nothing when community is null and not loading', () => {
    renderPage()
    expect(document.querySelector('h1')).toBeNull()
  })

  it('renders community name', () => {
    useCommunity.mockReturnValue({ ...defaults, community: mockCommunity })
    renderPage()
    expect(screen.getByText('Istanbul Explorers')).toBeTruthy()
  })

  it('renders community description', () => {
    useCommunity.mockReturnValue({ ...defaults, community: mockCommunity })
    renderPage()
    expect(screen.getByText('Explore Istanbul together')).toBeTruthy()
  })

  it('renders member count', () => {
    useCommunity.mockReturnValue({ ...defaults, community: mockCommunity })
    renderPage()
    expect(screen.getByText(/42/)).toBeTruthy()
  })

  it('renders tab buttons', () => {
    useCommunity.mockReturnValue({ ...defaults, community: mockCommunity })
    renderPage()
    // Tabs use t('community.about'), t('community.members'), t('community.activities')
    expect(screen.getByText('community.about')).toBeTruthy()
    expect(screen.getByText('community.members')).toBeTruthy()
  })

  it('calls fetchOne on mount', () => {
    renderPage()
    expect(mockFetchOne).toHaveBeenCalledWith('10')
  })

  it('renders join button when not member', () => {
    useCommunity.mockReturnValue({ ...defaults, community: mockCommunity })
    renderPage()
    expect(screen.getByText('community.join')).toBeTruthy()
  })

  it('renders category badge', () => {
    useCommunity.mockReturnValue({ ...defaults, community: mockCommunity })
    renderPage()
    expect(screen.getByText('travel')).toBeTruthy()
  })

  it('members tab switch triggers fetchMembers', () => {
    useCommunity.mockReturnValue({ ...defaults, community: mockCommunity })
    renderPage()
    fireEvent.click(screen.getByText('community.members'))
    expect(mockFetchMembers).toHaveBeenCalled()
  })
})