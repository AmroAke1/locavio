import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockCreate = vi.fn()
vi.mock('@/hooks/useCommunity', () => ({ useCommunity: vi.fn() }))

import { useCommunity } from '@/hooks/useCommunity'
import CommunityNew from '../../../src/pages/CommunityNew'

const defaults = {
  createCommunity: mockCreate,
  loading: false,
  error: null,
}

function renderPage() {
  return render(<MemoryRouter><CommunityNew /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useCommunity.mockReturnValue(defaults)
})

describe('CommunityNew', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('renders name input', () => {
    renderPage()
    expect(screen.getByRole('textbox', { name: /community.name_label/i })).toBeTruthy()
  })

  it('renders category select', () => {
    renderPage()
    expect(screen.getByRole('combobox')).toBeTruthy()
  })

  it('renders description textarea', () => {
    renderPage()
    expect(screen.getByRole('textbox', { name: /community.description_label/i })).toBeTruthy()
  })

  it('submit button disabled when name is empty', () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /community.create_btn/i })
    expect(btn).toBeDisabled()
  })

  it('submit button enabled when name is filled', () => {
    renderPage()
    const nameInput = screen.getByRole('textbox', { name: /community.name_label/i })
    fireEvent.change(nameInput, { target: { value: 'My Community' } })
    const btn = screen.getByRole('button', { name: /community.create_btn/i })
    expect(btn).not.toBeDisabled()
  })

  it('calls createCommunity and navigates on success', async () => {
    mockCreate.mockResolvedValueOnce({ id: 42 })
    renderPage()
    fireEvent.change(screen.getByRole('textbox', { name: /community.name_label/i }), {
      target: { value: 'Test Community' },
    })
    fireEvent.submit(document.querySelector('form'))
    await waitFor(() => expect(mockCreate).toHaveBeenCalled())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/communities/42'))
  })

  it('shows error alert when error set', () => {
    useCommunity.mockReturnValue({ ...defaults, error: 'Already exists' })
    renderPage()
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Already exists')).toBeTruthy()
  })
})