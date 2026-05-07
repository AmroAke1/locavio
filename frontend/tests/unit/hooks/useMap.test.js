import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMap } from '../../../src/hooks/useMap'

describe('useMap', () => {
  it('starts with default center and zoom', () => {
    const { result } = renderHook(() => useMap())
    expect(result.current.centerCoords).toEqual([20, 0])
    expect(result.current.zoom).toBe(13)
  })

  it('setCenter() updates centerCoords', () => {
    const { result } = renderHook(() => useMap())
    act(() => { result.current.setCenter(48.8566, 2.3522) })
    expect(result.current.centerCoords).toEqual([48.8566, 2.3522])
  })

  it('setZoomLevel() updates zoom', () => {
    const { result } = renderHook(() => useMap())
    act(() => { result.current.setZoomLevel(5) })
    expect(result.current.zoom).toBe(5)
  })

  it('setCenter() with different coords', () => {
    const { result } = renderHook(() => useMap())
    act(() => { result.current.setCenter(41.0082, 28.9784) })
    expect(result.current.centerCoords).toEqual([41.0082, 28.9784])
  })
})