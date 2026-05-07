import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CommunityCard from '../../../src/components/cards/CommunityCard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockCommunity = {
  id: 1,
  name: 'Istanbul Explorers',
  location: 'Istanbul',
  category: 'travel',
  description: 'Explore Istanbul together',
  member_count: 42,
}

describe('CommunityCard', () => {
  it('renders community name', () => {
    render(<MemoryRouter><CommunityCard community={mockCommunity} /></MemoryRouter>)
    expect(screen.getByText('Istanbul Explorers')).toBeTruthy()
  })

  it('renders location', () => {
    render(<MemoryRouter><CommunityCard community={mockCommunity} /></MemoryRouter>)
    expect(screen.getByText('Istanbul')).toBeTruthy()
  })

  it('renders member count', () => {
    render(<MemoryRouter><CommunityCard community={mockCommunity} /></MemoryRouter>)
    expect(screen.getByText(/42/)).toBeTruthy()
  })

  it('renders description', () => {
    render(<MemoryRouter><CommunityCard community={mockCommunity} /></MemoryRouter>)
    expect(screen.getByText('Explore Istanbul together')).toBeTruthy()
  })

  it('renders category badge', () => {
    render(<MemoryRouter><CommunityCard community={mockCommunity} /></MemoryRouter>)
    expect(screen.getByText('travel')).toBeTruthy()
  })

  it('shows join button when onJoin provided and not member', () => {
    const onJoin = vi.fn()
    render(<MemoryRouter><CommunityCard community={mockCommunity} onJoin={onJoin} isMember={false} /></MemoryRouter>)
    // There are two role="button" elements (div wrapper + actual button), find the <button> tag
    const buttons = screen.getAllByRole('button')
    expect(buttons.some(b => b.tagName === 'BUTTON')).toBe(true)
  })

  it('does not show join button when isMember is true', () => {
    render(<MemoryRouter><CommunityCard community={mockCommunity} onJoin={vi.fn()} isMember={true} /></MemoryRouter>)
    // Only the outer div with role="button" remains
    const buttons = screen.getAllByRole('button')
    expect(buttons.every(b => b.tagName !== 'BUTTON')).toBe(true)
  })

  it('calls onJoin with community id when join clicked', () => {
    const onJoin = vi.fn()
    render(<MemoryRouter><CommunityCard community={mockCommunity} onJoin={onJoin} /></MemoryRouter>)
    const joinBtn = screen.getAllByRole('button').find(b => b.tagName === 'BUTTON')
    fireEvent.click(joinBtn)
    expect(onJoin).toHaveBeenCalledWith(1)
  })

  it('navigates to community detail on card click', () => {
    // No onJoin — only the outer div has role="button"
    render(<MemoryRouter><CommunityCard community={mockCommunity} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/communities/1')
  })

  it('renders without optional fields', () => {
    const minimal = { id: 2, name: 'Minimal', member_count: 0 }
    render(<MemoryRouter><CommunityCard community={minimal} /></MemoryRouter>)
    expect(screen.getByText('Minimal')).toBeTruthy()
  })
})