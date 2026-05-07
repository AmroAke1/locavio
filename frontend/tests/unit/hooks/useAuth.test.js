import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../../../src/hooks/useAuth'
import { useAuthStore } from '../../../src/store/authStore'
import * as authService from '../../../src/services/authService'

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('returns isAuthenticated false by default', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('loginWithEmail() calls emailLogin and updates store', async () => {
    vi.spyOn(authService, 'emailLogin').mockResolvedValue({
      access_token: 'token',
      user: { id: 1, name: 'Test', email: 'test@test.com' },
    })
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.loginWithEmail('test@test.com', 'pass')
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('logout() clears store', () => {
    useAuthStore.setState({ user: { id: 1 }, token: 'tok', isAuthenticated: true })
    const { result } = renderHook(() => useAuth())
    act(() => result.current.logout())
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})