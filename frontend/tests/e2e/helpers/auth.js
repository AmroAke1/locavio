export async function loginAs(page, role = 'user') {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    auth_provider: 'email',
    location: null,
    preferences: null,
    created_at: new Date().toISOString(),
    updated_at: null,
  }
  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock'
  await page.addInitScript(
    ({ user, token }) => {
      localStorage.setItem('locavio_token', token)
      localStorage.setItem('locavio_user', JSON.stringify(user))
    },
    { user: mockUser, token: mockToken }
  )
}