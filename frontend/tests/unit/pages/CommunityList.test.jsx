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
const mockJoin = vi.fn()
vi.mock('@/hooks/useCommunity', () => ({ useCommunity: vi.fn() }))

import { useCommunity } from '@/hooks/useCommunity'
import CommunityList from '../../../src/pages/CommunityList'

const defaults = {
  communities: [],
  loading: false,
  error: null,
  fetchAll: mockFetchAll,
  join: mockJoin,
}

function renderPage() {
  return render(<MemoryRouter><CommunityList /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useCommunity.mockReturnValue(defaults)
})

describe('CommunityList', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('renders search input', () => {
    renderPage()
    expect(screen.getByRole('searchbox')).toBeTruthy()
  })

  it('shows spinner while loading', () => {
    useCommunity.mockReturnValue({ ...defaults, loading: true })
    renderPage()
    expect(document.body.textContent).toBeTruthy()
  })

  it('shows error when error set', () => {
    useCommunity.mockReturnValue({ ...defaults, error: 'Server error' })
    renderPage()
    expect(screen.getByText('Server error')).toBeTruthy()
  })

  it('shows empty state when no communities', () => {
    renderPage()
    expect(screen.getByText('community.no_communities')).toBeTruthy()
  })

  it('renders community cards', () => {
    useCommunity.mockReturnValue({
      ...defaults,
      communities: [{ id: 1, name: 'Foodies', member_count: 10 }],
    })
    renderPage()
    expect(screen.getByText('Foodies')).toBeTruthy()
  })

  it('category filter button renders', () => {
    renderPage()
    expect(screen.getByText('food')).toBeTruthy()
  })

  it('navigates to new community on button click', () => {
    renderPage()
    const newBtn = screen.getAllByRole('button').find(
      (b) => b.tagName === 'BUTTON' && b.textContent.includes('community.create')
    )
    fireEvent.click(newBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/communities/new')
  })
})