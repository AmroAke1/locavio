import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth.js'

test.describe('Authentication', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Locavio/)
    await expect(page.getByRole('heading').first()).toBeVisible()
    await expect(page.getByText('Get started')).toBeVisible()
  })

  test('login page shows auth buttons', async ({ page }) => {
    await page.goto('/login')
    await expect(
      page.getByText('Sign in with Google').or(page.locator('[aria-label*="Google"]').first())
    ).toBeVisible()
    await expect(page.getByText('Continue with LinkedIn')).toBeVisible()
  })

  test('unauthenticated user redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })

  test('unauthenticated user redirected from itineraries', async ({ page }) => {
    await page.goto('/itineraries')
    await expect(page).toHaveURL(/login/)
  })

  test('unauthenticated user redirected from communities', async ({ page }) => {
    await page.goto('/communities')
    await expect(page).toHaveURL(/login/)
  })
})