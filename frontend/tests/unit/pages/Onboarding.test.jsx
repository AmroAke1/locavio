import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/services/authService', () => ({ updateUser: vi.fn() }))
vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({ changeLanguage: vi.fn() }),
}))

import { useAuthStore } from '../../../src/store/authStore'
import { updateUser } from '@/services/authService'
import Onboarding from '../../../src/pages/Onboarding'

function renderPage() {
  return render(<MemoryRouter><Onboarding /></MemoryRouter>)
}

const getNextBtn = () =>
  screen.getAllByRole('button').find((b) => b.textContent === 'onboarding.next')
const getBackBtn = () =>
  screen.getAllByRole('button').find((b) => b.textContent === 'onboarding.back')
const getFinishBtn = () =>
  screen.getAllByRole('button').find((b) => b.textContent === 'onboarding.finish')

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: { id: 1, name: 'Alice' }, isAuthenticated: true })
})

describe('Onboarding', () => {
  it('renders step 1 by default with location heading', () => {
    renderPage()
    expect(screen.getByText('onboarding.where_title')).toBeTruthy()
  })

  it('step 1 has no back button', () => {
    renderPage()
    expect(getBackBtn()).toBeUndefined()
  })

  it('step 1 shows next button', () => {
    renderPage()
    expect(getNextBtn()).toBeTruthy()
  })

  it('advance to step 2 shows interests heading', () => {
    renderPage()
    fireEvent.click(getNextBtn())
    expect(screen.getByText('onboarding.interests_title')).toBeTruthy()
  })

  it('step 2 shows back button', () => {
    renderPage()
    fireEvent.click(getNextBtn())
    expect(getBackBtn()).toBeTruthy()
  })

  it('step 2 back button returns to step 1', () => {
    renderPage()
    fireEvent.click(getNextBtn())
    fireEvent.click(getBackBtn())
    expect(screen.getByText('onboarding.where_title')).toBeTruthy()
  })

  it('step 2 category buttons can be toggled', () => {
    renderPage()
    fireEvent.click(getNextBtn())
    const catBtn = screen.getByText('activity.category.food')
    fireEvent.click(catBtn)
    expect(catBtn.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(catBtn)
    expect(catBtn.getAttribute('aria-pressed')).toBe('false')
  })

  it('advance to step 3 shows language heading', () => {
    renderPage()
    fireEvent.click(getNextBtn())
    fireEvent.click(getNextBtn())
    expect(screen.getByText('onboarding.language_title')).toBeTruthy()
  })

  it('step 3 shows finish button instead of next', () => {
    renderPage()
    fireEvent.click(getNextBtn())
    fireEvent.click(getNextBtn())
    expect(getFinishBtn()).toBeTruthy()
    expect(getNextBtn()).toBeUndefined()
  })

  it('step 3 language radio buttons are selectable', () => {
    renderPage()
    fireEvent.click(getNextBtn())
    fireEvent.click(getNextBtn())
    const frBtn = screen.getByText('Français').closest('button')
    fireEvent.click(frBtn)
    expect(frBtn.getAttribute('aria-checked')).toBe('true')
  })

  it('finish calls updateUser and navigates to dashboard', async () => {
    updateUser.mockResolvedValueOnce({ id: 1 })
    renderPage()
    fireEvent.click(getNextBtn())
    fireEvent.click(getNextBtn())
    fireEvent.click(getFinishBtn())
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(1, expect.any(Object)))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows error alert when updateUser fails', async () => {
    updateUser.mockRejectedValueOnce(new Error('fail'))
    renderPage()
    fireEvent.click(getNextBtn())
    fireEvent.click(getNextBtn())
    fireEvent.click(getFinishBtn())
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.getByText('common.error')).toBeTruthy()
  })
})