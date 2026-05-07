import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '../../../src/store/authStore'
import ProtectedRoute from '../../../src/components/layout/ProtectedRoute'

const renderWithRouter = (isAuthenticated) => {
  useAuthStore.setState({ isAuthenticated, user: isAuthenticated ? { id: 1 } : null })
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>Protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderWithRouter(true)
    expect(screen.getByText('Protected content')).toBeTruthy()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithRouter(false)
    expect(screen.getByText('Login page')).toBeTruthy()
    expect(screen.queryByText('Protected content')).toBeNull()
  })
})