import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

// Mock all page/layout components to prevent deep rendering
vi.mock('@/pages/Landing', () => ({ default: () => <div>Landing</div> }))
vi.mock('@/pages/Login', () => ({ default: () => <div>Login</div> }))
vi.mock('@/pages/LinkedInCallback', () => ({ default: () => <div>LinkedIn</div> }))
vi.mock('@/pages/Onboarding', () => ({ default: () => <div>Onboarding</div> }))
vi.mock('@/pages/Dashboard', () => ({ default: () => <div>Dashboard</div> }))
vi.mock('@/pages/ItineraryList', () => ({ default: () => <div>ItineraryList</div> }))
vi.mock('@/pages/ItineraryNew', () => ({ default: () => <div>ItineraryNew</div> }))
vi.mock('@/pages/ItineraryDetail', () => ({ default: () => <div>ItineraryDetail</div> }))
vi.mock('@/pages/CommunityList', () => ({ default: () => <div>CommunityList</div> }))
vi.mock('@/pages/CommunityNew', () => ({ default: () => <div>CommunityNew</div> }))
vi.mock('@/pages/CommunityDetail', () => ({ default: () => <div>CommunityDetail</div> }))
vi.mock('@/pages/Profile', () => ({ default: () => <div>Profile</div> }))
vi.mock('@/components/layout/Navbar', () => ({ default: () => <nav>Navbar</nav> }))
vi.mock('@/components/layout/Sidebar', () => ({ default: () => <div>Sidebar</div> }))
vi.mock('@/components/layout/Footer', () => ({ default: () => <footer>Footer</footer> }))
vi.mock('@/components/layout/ProtectedRoute', () => ({
  default: () => {
    const { Outlet } = require('react-router-dom')
    return <Outlet />
  },
}))

import { useAuthStore } from '../../src/store/authStore'
import { useUiStore } from '../../src/store/uiStore'
import App from '../../src/App'

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: null, isAuthenticated: false, token: null })
  useUiStore.setState({ language: 'en' })
})

describe('App', () => {
  it('renders Landing page at root route', () => {
    // App uses BrowserRouter internally; jsdom starts at '/'
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByText('Landing')).toBeTruthy()
  })

  it('renders Login page at /login', () => {
    window.history.pushState({}, '', '/login')
    render(<App />)
    expect(screen.getByText('Login')).toBeTruthy()
  })

  it('sets document.dir to ltr for English', () => {
    useUiStore.setState({ language: 'en' })
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(document.dir).toBe('ltr')
  })

  it('sets document.dir to rtl for Arabic', () => {
    useUiStore.setState({ language: 'ar' })
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(document.dir).toBe('rtl')
  })

  it('sets document.documentElement.lang from uiStore', () => {
    useUiStore.setState({ language: 'fr' })
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(document.documentElement.lang).toBe('fr')
  })

  it('unknown route redirects to Landing', () => {
    window.history.pushState({}, '', '/nonexistent-route')
    render(<App />)
    expect(screen.getByText('Landing')).toBeTruthy()
  })
})