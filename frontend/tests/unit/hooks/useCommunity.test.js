import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../../../src/services/communityService', () => ({
  getAll: vi.fn(),
  getOne: vi.fn(),
  create: vi.fn(),
  join: vi.fn(),
  leave: vi.fn(),
  getMembers: vi.fn(),
}))

import { useCommunity } from '../../../src/hooks/useCommunity'
import * as communityService from '../../../src/services/communityService'

const mockCommunity = { id: 1, name: 'Istanbul', location: 'Istanbul', member_count: 5 }

beforeEach(() => vi.clearAllMocks())

describe('useCommunity', () => {
  it('initial state is empty', () => {
    const { result } = renderHook(() => useCommunity())
    expect(result.current.communities).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetchAll() sets communities on success', async () => {
    communityService.getAll.mockResolvedValueOnce([mockCommunity])
    const { result } = renderHook(() => useCommunity())
    await act(async () => { await result.current.fetchAll() })
    expect(result.current.communities).toEqual([mockCommunity])
    expect(result.current.loading).toBe(false)
  })

  it('fetchAll() sets error on failure', async () => {
    communityService.getAll.mockRejectedValueOnce({ response: { data: { detail: 'Server error' } } })
    const { result } = renderHook(() => useCommunity())
    await act(async () => { await result.current.fetchAll() })
    expect(result.current.error).toBe('Server error')
  })

  it('fetchOne() sets community on success', async () => {
    communityService.getOne.mockResolvedValueOnce(mockCommunity)
    const { result } = renderHook(() => useCommunity())
    await act(async () => { await result.current.fetchOne(1) })
    expect(result.current.community).toEqual(mockCommunity)
  })

  it('fetchMembers() sets members on success', async () => {
    const members = [{ id: 1, user_id: 1 }]
    communityService.getMembers.mockResolvedValueOnce(members)
    const { result } = renderHook(() => useCommunity())
    await act(async () => { await result.current.fetchMembers(1) })
    expect(result.current.members).toEqual(members)
  })

  it('createCommunity() sets community and returns result', async () => {
    communityService.create.mockResolvedValueOnce(mockCommunity)
    const { result } = renderHook(() => useCommunity())
    let returned
    await act(async () => { returned = await result.current.createCommunity({ name: 'Istanbul' }) })
    expect(returned).toEqual(mockCommunity)
    expect(result.current.community).toEqual(mockCommunity)
  })

  it('createCommunity() throws and sets error on failure', async () => {
    communityService.create.mockRejectedValueOnce({ response: { data: { detail: 'Already exists' } } })
    const { result } = renderHook(() => useCommunity())
    await act(async () => {
      await expect(result.current.createCommunity({})).rejects.toBeDefined()
    })
    expect(result.current.error).toBe('Already exists')
  })

  it('join() calls service and re-fetches community', async () => {
    communityService.join.mockResolvedValueOnce({})
    communityService.getOne.mockResolvedValueOnce(mockCommunity)
    const { result } = renderHook(() => useCommunity())
    await act(async () => { await result.current.join(1) })
    expect(communityService.join).toHaveBeenCalledWith(1)
    expect(communityService.getOne).toHaveBeenCalledWith(1)
  })

  it('leave() calls service and re-fetches community', async () => {
    communityService.leave.mockResolvedValueOnce({})
    communityService.getOne.mockResolvedValueOnce(mockCommunity)
    const { result } = renderHook(() => useCommunity())
    await act(async () => { await result.current.leave(1) })
    expect(communityService.leave).toHaveBeenCalledWith(1)
  })
})