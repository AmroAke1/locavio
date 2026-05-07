import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers.js'
import {
  googleLogin,
  emailLogin,
  emailRegister,
  getMe,
  linkedinLogin,
} from '../../../src/services/authService'

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('authService', () => {
  it('googleLogin() returns access_token and user', async () => {
    const result = await googleLogin('mock-google-token')
    expect(result.access_token).toBe('mock-jwt')
    expect(result.user.email).toBe('test@test.com')
  })

  it('emailLogin() calls correct endpoint', async () => {
    const result = await emailLogin('test@test.com', 'password')
    expect(result.access_token).toBeDefined()
  })

  it('emailRegister() calls correct endpoint', async () => {
    const result = await emailRegister('new@test.com', 'password', 'New User')
    expect(result.user).toBeDefined()
  })

  it('getMe() returns user data', async () => {
    const result = await getMe()
    expect(result.email).toBe('test@test.com')
  })

  it('linkedinLogin() calls POST /auth/linkedin', async () => {
    const { http, HttpResponse } = await import('msw')
    server.use(
      http.post('*/api/v1/auth/linkedin', () =>
        HttpResponse.json({
          access_token: 'jwt',
          token_type: 'bearer',
          user: {
            id: 1,
            email: 'li@test.com',
            name: 'LI',
            auth_provider: 'linkedin',
            location: null,
            preferences: null,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: null,
          },
        })
      )
    )
    const result = await linkedinLogin('auth-code')
    expect(result.access_token).toBe('jwt')
  })
})