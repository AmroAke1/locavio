import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth.js'

const mockItinerary = {
  id: 1,
  title: 'Day in Istanbul',
  location: 'Istanbul',
  lat: 41.0082,
  lng: 28.9784,
  status: 'upcoming',
  purpose: 'tourism',
  generated_by_ai: false,
  date: '2026-07-01',
  activities: [],
  user_id: 1,
  description: null,
  created_at: new Date().toISOString(),
  updated_at: null,
}

function mockAuthAndItineraries(page) {
  page.route('**/api/v1/auth/me', (route) =>
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
  page.route('**/api/v1/itineraries/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockItinerary]),
    })
  )
  page.route('**/api/v1/communities/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  )
}

test.describe('Itineraries', () => {
  test('dashboard shows upcoming trips section', async ({ page }) => {
    mockAuthAndItineraries(page)
    await loginAs(page)
    await page.goto('/dashboard')
    await expect(page.getByText(/upcoming/i).first()).toBeVisible()
  })

  test('itinerary new page has generate and manual tabs', async ({ page }) => {
    mockAuthAndItineraries(page)
    await loginAs(page)
    await page.goto('/itineraries/new')
    await expect(page.getByText(/Generate with AI/i)).toBeVisible()
    await expect(page.getByText(/Create manually/i)).toBeVisible()
  })

  test('itinerary list page loads', async ({ page }) => {
    mockAuthAndItineraries(page)
    await loginAs(page)
    await page.goto('/itineraries')
    await expect(page.locator('body')).toBeVisible()
  })
})