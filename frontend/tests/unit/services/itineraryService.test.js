import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

import api from '../../../src/services/api'
import * as itineraryService from '../../../src/services/itineraryService'

const mockItinerary = { id: 1, title: 'Paris Trip', location: 'Paris', status: 'upcoming' }

beforeEach(() => vi.clearAllMocks())

describe('itineraryService', () => {
  it('getAll() calls GET /itineraries', async () => {
    api.get.mockResolvedValueOnce({ data: [mockItinerary] })
    const result = await itineraryService.getAll()
    expect(api.get).toHaveBeenCalledWith('/itineraries', { params: {} })
    expect(result).toEqual([mockItinerary])
  })

  it('getOne() calls GET /itineraries/:id', async () => {
    api.get.mockResolvedValueOnce({ data: mockItinerary })
    const result = await itineraryService.getOne(1)
    expect(api.get).toHaveBeenCalledWith('/itineraries/1')
    expect(result).toEqual(mockItinerary)
  })

  it('create() calls POST /itineraries', async () => {
    api.post.mockResolvedValueOnce({ data: mockItinerary })
    const result = await itineraryService.create({ title: 'Paris Trip' })
    expect(api.post).toHaveBeenCalledWith('/itineraries', { title: 'Paris Trip' })
    expect(result).toEqual(mockItinerary)
  })

  it('update() calls PUT /itineraries/:id', async () => {
    api.put.mockResolvedValueOnce({ data: { ...mockItinerary, title: 'Updated' } })
    const result = await itineraryService.update(1, { title: 'Updated' })
    expect(api.put).toHaveBeenCalledWith('/itineraries/1', { title: 'Updated' })
    expect(result.title).toBe('Updated')
  })

  it('remove() calls DELETE /itineraries/:id', async () => {
    api.delete.mockResolvedValueOnce({})
    await itineraryService.remove(1)
    expect(api.delete).toHaveBeenCalledWith('/itineraries/1')
  })

  it('generate() calls POST /itineraries/generate', async () => {
    api.post.mockResolvedValueOnce({ data: mockItinerary })
    const result = await itineraryService.generate({ location: 'Paris' })
    expect(api.post).toHaveBeenCalledWith('/itineraries/generate', { location: 'Paris' })
    expect(result).toEqual(mockItinerary)
  })

  it('createActivity() calls POST /activities', async () => {
    const mockAct = { id: 1, title: 'Visit Eiffel', itinerary_id: 1 }
    api.post.mockResolvedValueOnce({ data: mockAct })
    const result = await itineraryService.createActivity({ itinerary_id: 1, title: 'Visit Eiffel' })
    expect(api.post).toHaveBeenCalledWith('/activities', { itinerary_id: 1, title: 'Visit Eiffel' })
    expect(result).toEqual(mockAct)
  })

  it('updateActivity() calls PUT /activities/:id', async () => {
    api.put.mockResolvedValueOnce({ data: { id: 1, title: 'Updated Act' } })
    await itineraryService.updateActivity(1, { title: 'Updated Act' })
    expect(api.put).toHaveBeenCalledWith('/activities/1', { title: 'Updated Act' })
  })

  it('removeActivity() calls DELETE /activities/:id', async () => {
    api.delete.mockResolvedValueOnce({})
    await itineraryService.removeActivity(1)
    expect(api.delete).toHaveBeenCalledWith('/activities/1')
  })

  it('reorderActivity() calls PATCH /activities/:id/reorder', async () => {
    api.patch.mockResolvedValueOnce({ data: { id: 1, order_index: 3 } })
    const result = await itineraryService.reorderActivity(1, 3)
    expect(api.patch).toHaveBeenCalledWith('/activities/1/reorder', { order_index: 3 })
    expect(result.order_index).toBe(3)
  })
})