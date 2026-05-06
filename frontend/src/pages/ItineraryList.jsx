import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useItinerary } from '@/hooks/useItinerary'
import ItineraryCard from '@/components/cards/ItineraryCard'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

const STATUSES = ['all', 'upcoming', 'active', 'draft', 'completed', 'wishlist']

function ItineraryList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { itineraries, loading, error, fetchAll } = useItinerary()
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    document.title = 'Locavio — My Itineraries'
    fetchAll()
  }, [])

  const filtered = activeTab === 'all'
    ? itineraries
    : itineraries.filter((it) => it.status === activeTab)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-espresso">{t('itinerary.new')}</h1>
        <Button onClick={() => navigate('/itineraries/new')} size="sm">
          <Plus size={16} />
          {t('itinerary.new')}
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Filter by status">
        {STATUSES.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={activeTab === s}
            onClick={() => setActiveTab(s)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeTab === s
                ? 'bg-primary text-white'
                : 'bg-card text-muted hover:text-espresso border border-accent/30'}`}
          >
            {s === 'all' ? t('itinerary.all') : t(`itinerary.status.${s}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="text-danger text-sm py-8 text-center">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="text-5xl">🗺️</span>
          <p className="text-espresso font-medium">{t('itinerary.no_itineraries')}</p>
          <Button onClick={() => navigate('/itineraries/new')}>
            {t('itinerary.new')}
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => (
            <ItineraryCard key={it.id} itinerary={it} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ItineraryList
