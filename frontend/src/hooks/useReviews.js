import { useState } from 'react'
import * as reviewService from '@/services/reviewService'

export function useReviews() {
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchForActivity = async (activityId) => {
    if (!activityId) return
    setLoading(true)
    setError(null)
    try {
      const data = await reviewService.getForActivity(activityId)
      setReviews(data.reviews || [])
      setAvgRating(data.avg_rating ?? null)
      return data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const addReview = async (data) => {
    try {
      const result = await reviewService.create(data)
      setReviews((prev) => [result, ...prev])
      await fetchForActivity(data.activity_id)
      return result
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to add review'
      setError(message)
      throw err
    }
  }

  const removeReview = async (id, activityId) => {
    try {
      await reviewService.remove(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      if (activityId) await fetchForActivity(activityId)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete review')
      throw err
    }
  }

  return { reviews, avgRating, loading, error, fetchForActivity, addReview, removeReview }
}
