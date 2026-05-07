import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from '../../../src/store/uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useUiStore.setState({ language: 'en', sidebarOpen: false })
  })

  it('has default language en', () => {
    expect(useUiStore.getState().language).toBe('en')
  })

  it('has sidebarOpen false by default', () => {
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it('setLanguage updates language and saves to localStorage', () => {
    useUiStore.getState().setLanguage('fr')
    expect(useUiStore.getState().language).toBe('fr')
    expect(localStorage.getItem('language')).toBe('fr')
  })

  it('toggleSidebar flips sidebarOpen', () => {
    expect(useUiStore.getState().sidebarOpen).toBe(false)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(true)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it('setSidebarOpen sets to true', () => {
    useUiStore.getState().setSidebarOpen(true)
    expect(useUiStore.getState().sidebarOpen).toBe(true)
  })

  it('setSidebarOpen sets to false', () => {
    useUiStore.setState({ sidebarOpen: true })
    useUiStore.getState().setSidebarOpen(false)
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it('setLanguage to ar', () => {
    useUiStore.getState().setLanguage('ar')
    expect(useUiStore.getState().language).toBe('ar')
  })
})