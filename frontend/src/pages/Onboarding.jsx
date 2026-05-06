import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { updateUser } from '@/services/authService'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'

const CATEGORIES = ['food', 'culture', 'sport', 'social', 'nature', 'shopping']
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
]
const TOTAL_STEPS = 3

function Onboarding() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const { changeLanguage } = useLanguage()

  const [step, setStep] = useState(1)
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedLang, setSelectedLang] = useState('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'Locavio — Getting started'
  }, [])

  const toggleCategory = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleFinish = async () => {
    setLoading(true)
    setError(null)
    try {
      const preferences = { categories, language: selectedLang }
      const updated = await updateUser(user.id, { location, preferences })
      setUser(updated)
      changeLanguage(selectedLang)
      navigate('/dashboard')
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const progressPct = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-md p-8 flex flex-col gap-6">
        <div>
          <p className="text-xs text-muted mb-2">
            {t('onboarding.step', { current: step, total: TOTAL_STEPS })}
          </p>
          <div className="w-full bg-surface rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-espresso">{t('onboarding.where_title')}</h2>
              <p className="text-sm text-muted mt-1">{t('onboarding.where_sub')}</p>
            </div>
            <Input
              name="location"
              label={t('profile.location_label')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Paris, Tokyo, New York"
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-espresso">{t('onboarding.interests_title')}</h2>
              <p className="text-sm text-muted mt-1">{t('onboarding.interests_sub')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('onboarding.interests_title')}>
              {CATEGORIES.map((cat) => {
                const selected = categories.includes(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    aria-pressed={selected}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors
                      ${selected
                        ? 'bg-primary text-white border-primary'
                        : 'border-accent text-espresso hover:bg-surface'}`}
                  >
                    {t(`activity.category.${cat}`)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-espresso">{t('onboarding.language_title')}</h2>
              <p className="text-sm text-muted mt-1">{t('onboarding.language_sub')}</p>
            </div>
            <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label={t('onboarding.language_title')}>
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  role="radio"
                  aria-checked={selectedLang === code}
                  onClick={() => setSelectedLang(code)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors
                    ${selectedLang === code
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-accent text-espresso hover:bg-surface'}`}
                >
                  <span>{label}</span>
                  {selectedLang === code && (
                    <span className="w-4 h-4 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p role="alert" className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)} className="flex-1">
              {t('onboarding.back')}
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)} className="flex-1">
              {t('onboarding.next')}
            </Button>
          ) : (
            <Button onClick={handleFinish} loading={loading} className="flex-1">
              {t('onboarding.finish')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
