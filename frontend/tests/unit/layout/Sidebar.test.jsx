import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

import { useAuthStore } from '../../../src/store/authStore'
import { useUiStore } from '../../../src/store/uiStore'
import Sidebar from '../../../src/components/layout/Sidebar'

function renderSidebar() {
  return render(<MemoryRouter><Sidebar /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: { id: 1, name: 'Alice' }, isAuthenticated: true })
  useUiStore.setState({ sidebarOpen: false, setSidebarOpen: vi.fn() })
})

describe('Sidebar', () => {
  it('renders sidebar aside element with label', () => {
    useUiStore.setState({ sidebarOpen: true })
    renderSidebar()
    expect(screen.getByRole('complementary', { name: /Sidebar navigation/i })).toBeTruthy()
  })

  it('renders nav links when open', () => {
    useUiStore.setState({ sidebarOpen: true })
    renderSidebar()
    expect(screen.getByText('nav.dashboard')).toBeTruthy()
    expect(screen.getByText('nav.itineraries')).toBeTruthy()
    expect(screen.getByText('nav.communities')).toBeTruthy()
    expect(screen.getByText('nav.profile')).toBeTruthy()
  })

  it('renders close button when open', () => {
    useUiStore.setState({ sidebarOpen: true })
    renderSidebar()
    expect(screen.getByLabelText('Close sidebar')).toBeTruthy()
  })

  it('close button calls setSidebarOpen(false)', () => {
    const setSidebarOpen = vi.fn()
    useUiStore.setState({ sidebarOpen: true, setSidebarOpen })
    renderSidebar()
    fireEvent.click(screen.getByLabelText('Close sidebar'))
    expect(setSidebarOpen).toHaveBeenCalledWith(false)
  })

  it('shows backdrop overlay when open', () => {
    useUiStore.setState({ sidebarOpen: true })
    renderSidebar()
    expect(document.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('backdrop click closes sidebar', () => {
    const setSidebarOpen = vi.fn()
    useUiStore.setState({ sidebarOpen: true, setSidebarOpen })
    renderSidebar()
    const backdrop = document.querySelector('[aria-hidden="true"]')
    fireEvent.click(backdrop)
    expect(setSidebarOpen).toHaveBeenCalledWith(false)
  })

  it('renders logout button', () => {
    useUiStore.setState({ sidebarOpen: true })
    renderSidebar()
    expect(screen.getByText('nav.logout')).toBeTruthy()
  })

  it('does not show backdrop when closed', () => {
    useUiStore.setState({ sidebarOpen: false })
    renderSidebar()
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull()
  })
})