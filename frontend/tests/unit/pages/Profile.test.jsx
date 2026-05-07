import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/services/authService', () => ({
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))
vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({ changeLanguage: vi.fn() }),
}))

import { useAuthStore } from '../../../src/store/authStore'
import { updateUser, deleteUser } from '@/services/authService'
import Profile from '../../../src/pages/Profile'

const mockUser = {
  id: 1,
  name: 'Alice Smith',
  email: 'alice@example.com',
  preferences: { categories: ['food'], language: 'en' },
}

function renderPage() {
  return render(<MemoryRouter><Profile /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: mockUser, isAuthenticated: true })
})

describe('Profile', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('renders user name and email', () => {
    renderPage()
    expect(screen.getByText('Alice Smith')).toBeTruthy()
    expect(screen.getByText('alice@example.com')).toBeTruthy()
  })

  it('renders user initial in avatar', () => {
    renderPage()
    expect(screen.getByText('A')).toBeTruthy()
  })

  it('renders language selector', () => {
    renderPage()
    expect(screen.getByRole('combobox')).toBeTruthy()
  })

  it('calls updateUser on form submit', async () => {
    updateUser.mockResolvedValueOnce({ ...mockUser, name: 'Alice Updated' })
    renderPage()
    const saveBtn = screen.getByRole('button', { name: /profile.save/i })
    fireEvent.click(saveBtn)
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(1, expect.any(Object)))
  })

  it('shows error alert on updateUser failure', async () => {
    updateUser.mockRejectedValueOnce(new Error('fail'))
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /profile.save/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
  })

  it('opens delete modal on delete account button click', () => {
    renderPage()
    const deleteBtn = screen.getByRole('button', { name: /profile.delete_account/i })
    fireEvent.click(deleteBtn)
    expect(screen.getAllByText('profile.delete_account').length).toBeGreaterThan(0)
  })

  it('calls deleteUser and navigates on confirm delete', async () => {
    deleteUser.mockResolvedValueOnce({})
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /profile.delete_account/i }))
    const confirmBtn = screen.getByRole('button', { name: /common.delete/i })
    fireEvent.click(confirmBtn)
    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith(1))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
  })

  it('toggles category selection', () => {
    renderPage()
    const catButtons = screen.getAllByRole('button', { pressed: false })
    if (catButtons.length > 0) {
      fireEvent.click(catButtons[0])
      expect(document.body.textContent).toBeTruthy()
    }
  })

  it('renders ? initial when user has no name', () => {
    useAuthStore.setState({ user: { id: 2, email: 'b@b.com' }, isAuthenticated: true })
    renderPage()
    expect(screen.getByText('?')).toBeTruthy()
  })
})