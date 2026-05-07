import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

import api from '../../../src/services/api'
import * as reviewService from '../../../src/services/reviewService'

const mockReview = { id: 1, rating: 4, comment: 'Great', activity_id: 1 }

beforeEach(() => vi.clearAllMocks())

describe('reviewService', () => {
  it('getForActivity() calls GET /reviews/activity/:id', async () => {
    api.get.mockResolvedValueOnce({ data: { reviews: [mockReview], avg_rating: 4 } })
    const result = await reviewService.getForActivity(1)
    expect(api.get).toHaveBeenCalledWith('/reviews/activity/1', { params: {} })
    expect(result.reviews).toEqual([mockReview])
  })

  it('create() calls POST /reviews', async () => {
    api.post.mockResolvedValueOnce({ data: mockReview })
    const result = await reviewService.create({ activity_id: 1, rating: 4 })
    expect(api.post).toHaveBeenCalledWith('/reviews', { activity_id: 1, rating: 4 })
    expect(result).toEqual(mockReview)
  })

  it('update() calls PUT /reviews/:id', async () => {
    api.put.mockResolvedValueOnce({ data: { ...mockReview, rating: 5 } })
    const result = await reviewService.update(1, { rating: 5 })
    expect(api.put).toHaveBeenCalledWith('/reviews/1', { rating: 5 })
    expect(result.rating).toBe(5)
  })

  it('remove() calls DELETE /reviews/:id', async () => {
    api.delete.mockResolvedValueOnce({})
    await reviewService.remove(1)
    expect(api.delete).toHaveBeenCalledWith('/reviews/1')
  })
})