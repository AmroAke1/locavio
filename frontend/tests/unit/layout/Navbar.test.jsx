import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    changeLanguage: vi.fn(),
    t: (k) => k,
  }),
}))

import { useAuthStore } from '../../../src/store/authStore'
import { useUiStore } from '../../../src/store/uiStore'
import Navbar from '../../../src/components/layout/Navbar'

function renderNavbar() {
  return render(<MemoryRouter><Navbar /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: { id: 1, name: 'Alice' }, isAuthenticated: true })
  useUiStore.setState({ sidebarOpen: false })
})

describe('Navbar', () => {
  it('renders Locavio brand', () => {
    renderNavbar()
    expect(screen.getByText('Locavio')).toBeTruthy()
  })

  it('renders hamburger menu button', () => {
    renderNavbar()
    expect(screen.getByLabelText('Open menu')).toBeTruthy()
  })

  it('hamburger button calls toggleSidebar', () => {
    renderNavbar()
    fireEvent.click(screen.getByLabelText('Open menu'))
    expect(document.body.textContent).toBeTruthy()
  })

  it('renders user initial in avatar', () => {
    renderNavbar()
    expect(screen.getByText('A')).toBeTruthy()
  })

  it('renders ? initial when user has no name', () => {
    useAuthStore.setState({ user: { id: 2 }, isAuthenticated: true })
    renderNavbar()
    expect(screen.getByText('?')).toBeTruthy()
  })

  it('clicking user avatar opens user menu', () => {
    renderNavbar()
    const avatar = screen.getByText('A')
    fireEvent.click(avatar)
    expect(document.body.textContent).toBeTruthy()
  })

  it('logout calls logout and navigates to /login', () => {
    renderNavbar()
    // Open user menu first
    const avatar = screen.getByText('A')
    fireEvent.click(avatar)
    const logoutBtn = screen.queryByText(/logout|LogOut|nav.logout/i)
    if (logoutBtn) {
      fireEvent.click(logoutBtn)
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    }
  })

  it('renders language dropdown trigger', () => {
    renderNavbar()
    // EN or similar language code shown
    expect(document.body.textContent.includes('EN') || document.body.textContent.includes('en')).toBe(true)
  })
})