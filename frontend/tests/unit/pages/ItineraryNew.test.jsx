import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockGenerate = vi.fn()
const mockCreate = vi.fn()
vi.mock('@/hooks/useItinerary', () => ({ useItinerary: vi.fn() }))

import { useItinerary } from '@/hooks/useItinerary'
import ItineraryNew from '../../../src/pages/ItineraryNew'

const defaults = {
  generate: mockGenerate,
  createItinerary: mockCreate,
  loading: false,
  error: null,
}

function renderPage() {
  return render(<MemoryRouter><ItineraryNew /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useItinerary.mockReturnValue(defaults)
})

describe('ItineraryNew', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('renders AI and Manual tabs', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: /itinerary.generate/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /itinerary.manual/i })).toBeTruthy()
  })

  it('AI tab selected by default', () => {
    renderPage()
    const aiTab = screen.getByRole('tab', { name: /itinerary.generate/i })
    expect(aiTab.getAttribute('aria-selected')).toBe('true')
  })

  it('switches to manual tab on click', () => {
    renderPage()
    const manualTab = screen.getByRole('tab', { name: /itinerary.manual/i })
    fireEvent.click(manualTab)
    expect(manualTab.getAttribute('aria-selected')).toBe('true')
  })

  it('renders location input in AI form', () => {
    renderPage()
    expect(screen.getByRole('textbox', { name: /itinerary.location/i })).toBeTruthy()
  })

  it('renders preference category buttons in AI form', () => {
    renderPage()
    expect(screen.getByText('activity.category.food')).toBeTruthy()
  })

  it('calls generate on AI form submit', async () => {
    mockGenerate.mockResolvedValueOnce({ id: 5 })
    renderPage()
    const locationInput = screen.getByRole('textbox', { name: /itinerary.location/i })
    fireEvent.change(locationInput, { target: { value: 'Paris' } })
    fireEvent.submit(document.querySelector('form'))
    await waitFor(() => expect(mockGenerate).toHaveBeenCalled())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/itineraries/5'))
  })

  it('shows error from hook', () => {
    useItinerary.mockReturnValue({ ...defaults, error: 'AI failed' })
    renderPage()
    expect(screen.getByText('AI failed')).toBeTruthy()
  })

  it('renders manual form title input after tab switch', () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: /itinerary.manual/i }))
    expect(screen.getByRole('textbox', { name: /itinerary.title_label/i })).toBeTruthy()
  })

  it('calls createItinerary on manual form submit', async () => {
    mockCreate.mockResolvedValueOnce({ id: 7 })
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: /itinerary.manual/i }))
    fireEvent.submit(document.querySelectorAll('form')[0])
    await waitFor(() => expect(mockCreate).toHaveBeenCalled())
  })
})