import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../../src/components/ui/Modal'

const renderModal = (props = {}) => {
  const defaults = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  }
  return render(<Modal {...defaults} {...props} />)
}

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders when isOpen is true', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('renders title', () => {
    renderModal({ title: 'My Modal' })
    expect(screen.getByText('My Modal')).toBeTruthy()
  })

  it('renders children', () => {
    renderModal({ children: <span>Hello inside</span> })
    expect(screen.getByText('Hello inside')).toBeTruthy()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.click(screen.getByLabelText('Close modal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    const backdrop = document.querySelector('[aria-hidden="true"]')
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders with sm size', () => {
    renderModal({ size: 'sm' })
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('renders with lg size', () => {
    renderModal({ size: 'lg' })
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
})