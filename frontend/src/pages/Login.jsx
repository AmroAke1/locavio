import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton'
import LinkedInLoginButton from '@/components/auth/LinkedInLoginButton'

const LINKEDIN_ERROR_MESSAGES = {
  linkedin_denied: 'LinkedIn sign-in was cancelled.',
  linkedin_failed: 'LinkedIn sign-in failed. Please try again.',
  invalid_state: 'LinkedIn sign-in failed (security check). Please try again.',
}

function Login() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { loginWithEmail, registerWithEmail } = useAuth()
  const [searchParams] = useSearchParams()

  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(() => {
    const errParam = searchParams.get('error')
    return LINKEDIN_ERROR_MESSAGES[errParam] || ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Locavio — Sign in'
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await registerWithEmail(email, password, name)
      } else {
        await loginWithEmail(email, password)
      }
    } catch (err) {
      setError(err?.response?.data?.detail || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-md p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-4xl mb-3">🗺️</p>
          <h1 className="text-2xl font-semibold text-espresso">{t('auth.welcome')}</h1>
          <p className="text-sm text-muted mt-1">{t('auth.subtitle')}</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <GoogleLoginButton />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-accent/40" />
            <span className="text-xs text-muted uppercase tracking-wide">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-accent/40" />
          </div>
          <LinkedInLoginButton />
        </div>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-accent/40" />
          <span className="text-xs text-muted uppercase tracking-wide">{t('auth.or')}</span>
          <div className="flex-1 h-px bg-accent/40" />
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder={t('auth.name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-accent/40 rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          <input
            type="email"
            placeholder={t('auth.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-accent/40 rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder={t('auth.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-accent/40 rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading
              ? t('common.loading')
              : mode === 'signup'
              ? t('auth.sign_up')
              : t('auth.sign_in_email')}
          </button>
        </form>

        <p className="text-xs text-muted text-center">
          {mode === 'signin' ? t('auth.no_account') : t('auth.have_account')}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="text-primary font-medium hover:underline"
          >
            {mode === 'signin' ? t('auth.switch_signup') : t('auth.switch_signin')}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
