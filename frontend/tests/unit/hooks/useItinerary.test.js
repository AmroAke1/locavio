import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../../../src/services/itineraryService', () => ({
  getAll: vi.fn(),
  getOne: vi.fn(),
  create: vi.fn(),
  generate: vi.fn(),
  remove: vi.fn(),
}))

import { useItinerary } from '../../../src/hooks/useItinerary'
import * as itineraryService from '../../../src/services/itineraryService'

const mockItinerary = { id: 1, title: 'Paris Trip', location: 'Paris', status: 'upcoming' }

beforeEach(() => vi.clearAllMocks())

describe('useItinerary', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useItinerary())
    expect(result.current.itineraries).toEqual([])
    expect(result.current.itinerary).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetchAll() sets itineraries on success', async () => {
    itineraryService.getAll.mockResolvedValueOnce([mockItinerary])
    const { result } = renderHook(() => useItinerary())
    await act(async () => { await result.current.fetchAll() })
    expect(result.current.itineraries).toEqual([mockItinerary])
    expect(result.current.loading).toBe(false)
  })

  it('fetchAll() sets error on failure', async () => {
    itineraryService.getAll.mockRejectedValueOnce({ response: { data: { detail: 'Unauthorized' } } })
    const { result } = renderHook(() => useItinerary())
    await act(async () => { await result.current.fetchAll() })
    expect(result.current.error).toBe('Unauthorized')
  })

  it('fetchOne() sets itinerary on success', async () => {
    itineraryService.getOne.mockResolvedValueOnce(mockItinerary)
    const { result } = renderHook(() => useItinerary())
    await act(async () => { await result.current.fetchOne(1) })
    expect(result.current.itinerary).toEqual(mockItinerary)
  })

  it('fetchOne() sets error on failure', async () => {
    itineraryService.getOne.mockRejectedValueOnce({})
    const { result } = renderHook(() => useItinerary())
    await act(async () => { await result.current.fetchOne(1) })
    expect(result.current.error).toBe('Failed to load itinerary')
  })

  it('createItinerary() sets itinerary and returns result', async () => {
    itineraryService.create.mockResolvedValueOnce(mockItinerary)
    const { result } = renderHook(() => useItinerary())
    let returned
    await act(async () => { returned = await result.current.createItinerary({ title: 'Paris Trip' }) })
    expect(returned).toEqual(mockItinerary)
    expect(result.current.itinerary).toEqual(mockItinerary)
  })

  it('createItinerary() throws and sets error on failure', async () => {
    itineraryService.create.mockRejectedValueOnce({ response: { data: { detail: 'Bad request' } } })
    const { result } = renderHook(() => useItinerary())
    await act(async () => {
      await expect(result.current.createItinerary({})).rejects.toBeDefined()
    })
    expect(result.current.error).toBe('Bad request')
  })

  it('generate() sets itinerary on success', async () => {
    itineraryService.generate.mockResolvedValueOnce(mockItinerary)
    const { result } = renderHook(() => useItinerary())
    let returned
    await act(async () => { returned = await result.current.generate({ location: 'Paris' }) })
    expect(returned).toEqual(mockItinerary)
  })

  it('removeItinerary() filters itinerary from list', async () => {
    itineraryService.getAll.mockResolvedValueOnce([mockItinerary, { id: 2, title: 'Berlin' }])
    itineraryService.remove.mockResolvedValueOnce({})
    const { result } = renderHook(() => useItinerary())
    await act(async () => { await result.current.fetchAll() })
    await act(async () => { await result.current.removeItinerary(1) })
    expect(result.current.itineraries.find((i) => i.id === 1)).toBeUndefined()
  })
})