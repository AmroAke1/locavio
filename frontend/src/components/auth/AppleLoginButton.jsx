import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import Spinner from '@/components/ui/Spinner'

function AppleLoginButton() {
  const { loginWithApple } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    const script = document.createElement('script')
    script.src =
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    script.async = true
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.locavio.app',
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      })
      initialized.current = true
    }
    document.head.appendChild(script)
  }, [])

  const handleAppleLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      const response = await window.AppleID.auth.signIn()
      const identityToken = response.authorization.id_token
      await loginWithApple(identityToken)
      navigate('/dashboard')
    } catch (err) {
      if (err?.error !== 'popup_closed_by_user') {
        setError(t('common.error'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <button
        onClick={handleAppleLogin}
        disabled={loading}
        aria-label={t('auth.sign_apple')}
        className="w-full flex items-center justify-center gap-3 bg-espresso text-white rounded-lg px-4 py-2.5 font-medium hover:bg-opacity-80 transition-opacity disabled:opacity-50"
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <svg className="w-5 h-5 fill-white" viewBox="0 0 814 1000" aria-hidden="true">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 790.8 0 663.6 0 541.4c0-207.4 134.4-317 266.5-317 69.4 0 127.4 45.7 170.8 45.7 42.4 0 109.4-48.7 190.5-48.7 32.9 0 120.2 2.5 176 68.2zm-225.1-200.3c46.4-55.7 80.6-133.5 80.6-211.3 0-10.8-.6-21.7-2.5-30.6C574.5 10.6 474.5 52.8 414.2 119c-43.2 49-82.5 126-82.5 204.3 0 11.5 1.9 22.9 2.5 26.6 4.4.6 11.5 1.9 18.6 1.9 59.4 0 150.6-40 225.2-111.2z" />
          </svg>
        )}
        {t('auth.sign_apple')}
      </button>
      {error && <p role="alert" className="text-danger text-sm text-center">{error}</p>}
    </div>
  )
}

export default AppleLoginButton
