import { useState } from 'react'
import * as itineraryService from '@/services/itineraryService'

export function useItinerary() {
  const [itineraries, setItineraries] = useState([])
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await itineraryService.getAll(params)
      setItineraries(data)
      return data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load itineraries')
    } finally {
      setLoading(false)
    }
  }

  const fetchOne = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const data = await itineraryService.getOne(id)
      setItinerary(data)
      return data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load itinerary')
    } finally {
      setLoading(false)
    }
  }

  const generate = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await itineraryService.generate(data)
      setItinerary(result)
      return result
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to generate itinerary'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createItinerary = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await itineraryService.create(data)
      setItinerary(result)
      return result
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create itinerary'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeItinerary = async (id) => {
    try {
      await itineraryService.remove(id)
      setItineraries((prev) => prev.filter((it) => it.id !== id))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete itinerary')
      throw err
    }
  }

  return {
    itineraries,
    itinerary,
    loading,
    error,
    fetchAll,
    fetchOne,
    generate,
    createItinerary,
    removeItinerary,
  }
}
