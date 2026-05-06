import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton'
import AppleLoginButton from '@/components/auth/AppleLoginButton'

function Login() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    document.title = 'Locavio — Sign in'
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
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

          <AppleLoginButton />
        </div>
      </div>
    </div>
  )
}

export default Login
