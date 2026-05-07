import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../../../src/services/reviewService', () => ({
  getForActivity: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}))

import { useReviews } from '../../../src/hooks/useReviews'
import * as reviewService from '../../../src/services/reviewService'

const mockReview = { id: 1, rating: 4, comment: 'Great', activity_id: 1 }

beforeEach(() => vi.clearAllMocks())

describe('useReviews', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useReviews())
    expect(result.current.reviews).toEqual([])
    expect(result.current.avgRating).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('fetchForActivity() sets reviews and avgRating', async () => {
    reviewService.getForActivity.mockResolvedValueOnce({ reviews: [mockReview], avg_rating: 4.0 })
    const { result } = renderHook(() => useReviews())
    await act(async () => { await result.current.fetchForActivity(1) })
    expect(result.current.reviews).toEqual([mockReview])
    expect(result.current.avgRating).toBe(4.0)
  })

  it('fetchForActivity() does nothing if no activityId', async () => {
    const { result } = renderHook(() => useReviews())
    await act(async () => { await result.current.fetchForActivity(null) })
    expect(reviewService.getForActivity).not.toHaveBeenCalled()
  })

  it('fetchForActivity() sets error on failure', async () => {
    reviewService.getForActivity.mockRejectedValueOnce({ response: { data: { detail: 'Not found' } } })
    const { result } = renderHook(() => useReviews())
    await act(async () => { await result.current.fetchForActivity(1) })
    expect(result.current.error).toBe('Not found')
  })

  it('addReview() prepends review to list', async () => {
    reviewService.create.mockResolvedValueOnce(mockReview)
    reviewService.getForActivity.mockResolvedValueOnce({ reviews: [mockReview], avg_rating: 4 })
    const { result } = renderHook(() => useReviews())
    await act(async () => { await result.current.addReview({ activity_id: 1, rating: 4 }) })
    expect(result.current.reviews[0]).toEqual(mockReview)
  })

  it('addReview() throws and sets error on failure', async () => {
    reviewService.create.mockRejectedValueOnce({ response: { data: { detail: 'Already reviewed' } } })
    const { result } = renderHook(() => useReviews())
    await act(async () => {
      await expect(result.current.addReview({ activity_id: 1, rating: 5 })).rejects.toBeDefined()
    })
    expect(result.current.error).toBe('Already reviewed')
  })

  it('removeReview() removes review from list', async () => {
    // First call loads the review; second call (after delete) returns empty list
    reviewService.getForActivity.mockResolvedValueOnce({ reviews: [mockReview], avg_rating: 4 })
    reviewService.getForActivity.mockResolvedValueOnce({ reviews: [], avg_rating: null })
    reviewService.remove.mockResolvedValueOnce({})
    const { result } = renderHook(() => useReviews())
    await act(async () => { await result.current.fetchForActivity(1) })
    await act(async () => { await result.current.removeReview(1, 1) })
    expect(result.current.reviews.find((r) => r.id === 1)).toBeUndefined()
  })
})