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
import * as communityService from '../../../src/services/communityService'

const mockCommunity = { id: 1, name: 'Istanbul Explorers', location: 'Istanbul', member_count: 5 }

beforeEach(() => vi.clearAllMocks())

describe('communityService', () => {
  it('getAll() calls GET /communities', async () => {
    api.get.mockResolvedValueOnce({ data: [mockCommunity] })
    const result = await communityService.getAll()
    expect(api.get).toHaveBeenCalledWith('/communities', { params: {} })
    expect(result).toEqual([mockCommunity])
  })

  it('getAll() passes params', async () => {
    api.get.mockResolvedValueOnce({ data: [] })
    await communityService.getAll({ location: 'Paris' })
    expect(api.get).toHaveBeenCalledWith('/communities', { params: { location: 'Paris' } })
  })

  it('getOne() calls GET /communities/:id', async () => {
    api.get.mockResolvedValueOnce({ data: mockCommunity })
    const result = await communityService.getOne(1)
    expect(api.get).toHaveBeenCalledWith('/communities/1')
    expect(result).toEqual(mockCommunity)
  })

  it('create() calls POST /communities', async () => {
    api.post.mockResolvedValueOnce({ data: mockCommunity })
    const result = await communityService.create({ name: 'New' })
    expect(api.post).toHaveBeenCalledWith('/communities', { name: 'New' })
    expect(result).toEqual(mockCommunity)
  })

  it('update() calls PUT /communities/:id', async () => {
    api.put.mockResolvedValueOnce({ data: { ...mockCommunity, name: 'Updated' } })
    const result = await communityService.update(1, { name: 'Updated' })
    expect(api.put).toHaveBeenCalledWith('/communities/1', { name: 'Updated' })
    expect(result.name).toBe('Updated')
  })

  it('join() calls POST /communities/:id/join', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1 } })
    const result = await communityService.join(1)
    expect(api.post).toHaveBeenCalledWith('/communities/1/join')
    expect(result).toEqual({ id: 1 })
  })

  it('leave() calls DELETE /communities/:id/leave', async () => {
    api.delete.mockResolvedValueOnce({})
    await communityService.leave(1)
    expect(api.delete).toHaveBeenCalledWith('/communities/1/leave')
  })

  it('getMembers() calls GET /communities/:id/members', async () => {
    api.get.mockResolvedValueOnce({ data: [] })
    await communityService.getMembers(1)
    expect(api.get).toHaveBeenCalledWith('/communities/1/members', { params: {} })
  })
})