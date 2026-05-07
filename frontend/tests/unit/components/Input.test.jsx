import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../../../src/components/ui/Input'

describe('Input', () => {
  it('renders label correctly', () => {
    render(<Input name="email" label="Email Address" value="" onChange={() => {}} />)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<Input name="email" error="Invalid email" value="" onChange={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
  })

  it('calls onChange when user types', () => {
    const onChange = vi.fn()
    render(<Input name="test" label="Test" value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('shows required asterisk when required is true', () => {
    render(<Input name="req" label="Required Field" required value="" onChange={() => {}} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not show asterisk when not required', () => {
    render(<Input name="opt" label="Optional" value="" onChange={() => {}} />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })
})