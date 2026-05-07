import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../../../src/components/ui/Badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies default variant by default', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default').className).toMatch(/bg-accent/)
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success').className).toMatch(/bg-success/)
  })

  it('applies danger variant', () => {
    render(<Badge variant="danger">Error</Badge>)
    expect(screen.getByText('Error').className).toMatch(/bg-danger/)
  })

  it('applies muted variant', () => {
    render(<Badge variant="muted">Muted</Badge>)
    expect(screen.getByText('Muted').className).toMatch(/bg-muted/)
  })
})