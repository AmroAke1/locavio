import { describe, it, expect, vi, beforeEach } from 'vitest'
import L from 'leaflet'
import { createActivityPin, createStatusPin } from '../../../src/components/map/TripPin'

// leaflet is mocked globally in setup.js — L.divIcon is a vi.fn() that returns {}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TripPin', () => {
  describe('createActivityPin', () => {
    it('returns a leaflet divIcon result', () => {
      const icon = createActivityPin(0, 'food')
      expect(icon).toBeDefined()
      expect(L.divIcon).toHaveBeenCalled()
    })

    it('passes html with order index + 1 as label', () => {
      createActivityPin(2, 'culture')
      const call = L.divIcon.mock.calls.at(-1)[0]
      expect(call.html).toContain('3')
    })

    it('uses fallback color for unknown category', () => {
      createActivityPin(0, 'unknown-category')
      const call = L.divIcon.mock.calls.at(-1)[0]
      expect(call.html).toContain('#A0522D')
    })

    it('uses correct color for "sport" category', () => {
      createActivityPin(0, 'sport')
      const call = L.divIcon.mock.calls.at(-1)[0]
      expect(call.html).toContain('#4A7C59')
    })

    it('uses correct color for "nature" category', () => {
      createActivityPin(0, 'nature')
      const call = L.divIcon.mock.calls.at(-1)[0]
      expect(call.html).toContain('#6B7F5E')
    })
  })

  describe('createStatusPin', () => {
    it('returns a leaflet divIcon result', () => {
      const icon = createStatusPin('upcoming')
      expect(icon).toBeDefined()
      expect(L.divIcon).toHaveBeenCalled()
    })

    it('uses correct color for upcoming status', () => {
      createStatusPin('upcoming')
      const call = L.divIcon.mock.calls.at(-1)[0]
      expect(call.html).toContain('#A0522D')
    })

    it('uses correct color for active status', () => {
      createStatusPin('active')
      const call = L.divIcon.mock.calls.at(-1)[0]
      expect(call.html).toContain('#4A7C59')
    })

    it('uses fallback color for unknown status', () => {
      createStatusPin('unknown-status')
      const call = L.divIcon.mock.calls.at(-1)[0]
      expect(call.html).toContain('#8B7355')
    })

    it('uses draft color as default when no status', () => {
      createStatusPin()
      const call = L.divIcon.mock.calls.at(-1)[0]
      expect(call.html).toContain('#3D2B1F')
    })
  })
})