import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth.js'

test.describe('Navigation', () => {
  test('landing page renders without errors', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('unknown route redirects to home', async ({ page }) => {
    await page.goto('/this-does-not-exist')
    await expect(page).toHaveURL('/')
  })

  test('authenticated user on login redirects to dashboard', async ({ page }) => {
    // Mock the /auth/me endpoint so the app thinks the token is valid
    await page.route('**/api/v1/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Test',
          email: 'test@test.com',
          auth_provider: 'email',
          location: null,
          preferences: null,
          created_at: new Date().toISOString(),
          updated_at: null,
        }),
      })
    )
    await page.route('**/api/v1/itineraries/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    )
    await page.route('**/api/v1/communities/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    )
    await loginAs(page)
    await page.goto('/login')
    await expect(page).toHaveURL(/dashboard/)
  })
})