import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../src/i18n'
import Landing from '../../../src/pages/Landing'

function renderLanding() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    </I18nextProvider>
  )
}

describe('Landing page', () => {
  it('renders hero heading', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders Get started button', () => {
    renderLanding()
    // Multiple "Get started" buttons exist (header + hero + footer CTA); just check at least one
    expect(screen.getAllByText(/Get started/i).length).toBeGreaterThan(0)
  })

  it('renders features section', () => {
    renderLanding()
    expect(screen.getByText(/AI Itineraries/i)).toBeInTheDocument()
  })
})