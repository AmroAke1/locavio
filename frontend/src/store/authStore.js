import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  get isAdmin() { return get().user?.role === 'admin' },
  get isGuest() { return get().user?.role === 'guest' },
  get isUser() { return get().user?.role === 'user' || get().user?.role === 'admin' },

  login: (user, token) => {
    localStorage.setItem('locavio_token', token)
    localStorage.setItem('locavio_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('locavio_token')
    localStorage.removeItem('locavio_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('locavio_token')
    const userStr = localStorage.getItem('locavio_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true })
      } catch {
        localStorage.removeItem('locavio_token')
        localStorage.removeItem('locavio_user')
      }
    }
  },

  setUser: (user) => {
    localStorage.setItem('locavio_user', JSON.stringify(user))
    set({ user })
  },
}))
