import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../../../src/store/authStore'

const mockUser = { id: 1, name: 'Test User', email: 'test@test.com' }
const mockToken = 'mock-jwt-token'

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  })

  it('login() sets user and isAuthenticated', () => {
    useAuthStore.getState().login(mockUser, mockToken)
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.isAuthenticated).toBe(true)
  })

  it('login() saves token to localStorage', () => {
    useAuthStore.getState().login(mockUser, mockToken)
    expect(localStorage.getItem('locavio_token')).toBe(mockToken)
  })

  it('login() saves user to localStorage', () => {
    useAuthStore.getState().login(mockUser, mockToken)
    expect(JSON.parse(localStorage.getItem('locavio_user'))).toEqual(mockUser)
  })

  it('logout() clears state', () => {
    useAuthStore.getState().login(mockUser, mockToken)
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('logout() removes token from localStorage', () => {
    useAuthStore.getState().login(mockUser, mockToken)
    useAuthStore.getState().logout()
    expect(localStorage.getItem('locavio_token')).toBeNull()
  })

  it('loadFromStorage() restores state from localStorage', () => {
    localStorage.setItem('locavio_token', mockToken)
    localStorage.setItem('locavio_user', JSON.stringify(mockUser))
    useAuthStore.getState().loadFromStorage()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
  })

  it('loadFromStorage() does nothing if no token', () => {
    useAuthStore.getState().loadFromStorage()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})