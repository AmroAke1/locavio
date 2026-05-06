import { create } from 'zustand'

export const useUiStore = create((set) => ({
  language: localStorage.getItem('language') || 'en',
  sidebarOpen: false,

  setLanguage: (lang) => {
    localStorage.setItem('language', lang)
    set({ language: lang })
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
