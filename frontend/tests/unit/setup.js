import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Ensure localStorage is fully functional in jsdom
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] ?? null,
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Ensure navigator.language is available (used by i18n.js at module init)
Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  configurable: true,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => children,
  TileLayer: () => null,
  Marker: () => null,
  Popup: ({ children }) => children,
  useMap: () => ({ fitBounds: vi.fn(), setView: vi.fn() }),
  Polyline: () => null,
}))

// Mock leaflet
vi.mock('leaflet', () => ({
  default: { divIcon: vi.fn(() => ({})), icon: vi.fn(() => ({})) },
  divIcon: vi.fn(() => ({})),
  icon: vi.fn(() => ({})),
}))

// Mock @react-oauth/google
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess }) => {
    const { createElement } = require('react')
    return createElement(
      'button',
      { onClick: () => onSuccess({ credential: 'mock-google-token' }) },
      'Sign in with Google'
    )
  },
  GoogleOAuthProvider: ({ children }) => children,
}))