import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth.js'

const mockCommunity = {
  id: 1,
  name: 'Istanbul Explorers',
  location: 'Istanbul',
  category: 'travel',
  member_count: 42,
  description: 'Explore Istanbul',
  created_by: 1,
  cover_image_url: null,
  created_at: new Date().toISOString(),
  updated_at: null,
}

test.describe('Communities', () => {
  test('communities page loads', async ({ page }) => {
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
    await page.route('**/api/v1/communities/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockCommunity]),
      })
    )
    await page.route('**/api/v1/itineraries/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      })
    )
    await loginAs(page)
    await page.goto('/communities')
    await expect(page.locator('body')).toBeVisible()
  })
})