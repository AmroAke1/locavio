import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles, PenLine } from 'lucide-react'
import { useItinerary } from '@/hooks/useItinerary'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

const PURPOSES = ['tourism', 'work', 'local_life', 'social']
const CATEGORIES = ['food', 'culture', 'sport', 'social', 'nature', 'shopping']

function ItineraryNew() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { generate, createItinerary, loading, error } = useItinerary()

  const [tab, setTab] = useState('ai')

  const [aiForm, setAiForm] = useState({ location: '', purpose: 'tourism', date: '', preferences: [] })
  const [manualForm, setManualForm] = useState({ title: '', location: '', purpose: 'tourism', date: '', description: '' })

  useEffect(() => {
    document.title = 'Locavio — New Itinerary'
  }, [])

  const togglePreference = (cat) => {
    setAiForm((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(cat)
        ? prev.preferences.filter((c) => c !== cat)
        : [...prev.preferences, cat],
    }))
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    try {
      const result = await generate({
        location: aiForm.location,
        purpose: aiForm.purpose,
        date: aiForm.date || undefined,
        preferences: { categories: aiForm.preferences },
      })
      navigate(`/itineraries/${result.id}`)
    } catch {
      // error state is set by the hook
    }
  }

  const handleManualCreate = async (e) => {
    e.preventDefault()
    try {
      const result = await createItinerary(manualForm)
      navigate(`/itineraries/${result.id}`)
    } catch {
      // error state is set by the hook
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-espresso">{t('itinerary.new')}</h1>

      <div className="flex rounded-xl overflow-hidden border border-accent/30" role="tablist">
        {[
          { key: 'ai', label: t('itinerary.generate'), icon: Sparkles },
          { key: 'manual', label: t('itinerary.manual'), icon: PenLine },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
              ${tab === key ? 'bg-primary text-white' : 'bg-card text-muted hover:text-espresso'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'ai' && (
        <form onSubmit={handleGenerate} className="card flex flex-col gap-4">
          <Input
            name="ai-location"
            label={t('itinerary.location_placeholder')}
            value={aiForm.location}
            onChange={(e) => setAiForm({ ...aiForm, location: e.target.value })}
            placeholder="Paris, London, Tokyo..."
            required
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="ai-purpose" className="text-sm font-medium text-espresso">
              {t('itinerary.purpose_label')}
            </label>
            <select
              id="ai-purpose"
              value={aiForm.purpose}
              onChange={(e) => setAiForm({ ...aiForm, purpose: e.target.value })}
              className="rounded-lg border border-accent px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{t(`itinerary.purpose.${p}`)}</option>
              ))}
            </select>
          </div>

          <Input
            name="ai-date"
            type="date"
            label={t('itinerary.date_label')}
            value={aiForm.date}
            onChange={(e) => setAiForm({ ...aiForm, date: e.target.value })}
          />

          <div>
            <p className="text-sm font-medium text-espresso mb-2">{t('itinerary.preferences_label')}</p>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label={t('itinerary.preferences_label')}>
              {CATEGORIES.map((cat) => {
                const selected = aiForm.preferences.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => togglePreference(cat)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border transition-colors
                      ${selected ? 'bg-primary text-white border-primary' : 'border-accent text-muted hover:text-espresso hover:border-primary'}`}
                  >
                    {t(`activity.category.${cat}`)}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p role="alert" className="text-danger text-sm">{error}</p>}

          <Button type="submit" loading={loading} disabled={!aiForm.location} size="lg" className="w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {t('itinerary.generating')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={16} />
                {t('itinerary.generate_btn')}
              </span>
            )}
          </Button>
        </form>
      )}

      {tab === 'manual' && (
        <form onSubmit={handleManualCreate} className="card flex flex-col gap-4">
          <Input
            name="title"
            label={t('itinerary.title_label')}
            value={manualForm.title}
            onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
            placeholder="My trip to Rome"
            required
          />
          <Input
            name="location"
            label={t('itinerary.location_placeholder')}
            value={manualForm.location}
            onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
            placeholder="Rome, Italy"
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="manual-purpose" className="text-sm font-medium text-espresso">
              {t('itinerary.purpose_label')}
            </label>
            <select
              id="manual-purpose"
              value={manualForm.purpose}
              onChange={(e) => setManualForm({ ...manualForm, purpose: e.target.value })}
              className="rounded-lg border border-accent px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{t(`itinerary.purpose.${p}`)}</option>
              ))}
            </select>
          </div>
          <Input
            name="manual-date"
            type="date"
            label={t('itinerary.date_label')}
            value={manualForm.date}
            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium text-espresso">
              {t('itinerary.description_label')}
            </label>
            <textarea
              id="description"
              value={manualForm.description}
              onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
              rows={3}
              className="rounded-lg border border-accent px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Describe your trip..."
            />
          </div>

          {error && <p role="alert" className="text-danger text-sm">{error}</p>}

          <Button type="submit" loading={loading} disabled={!manualForm.title} size="lg" className="w-full">
            {t('itinerary.create_btn')}
          </Button>
        </form>
      )}
    </div>
  )
}

export default ItineraryNew
