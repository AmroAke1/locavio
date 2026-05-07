import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useItinerary } from '@/hooks/useItinerary'
import { useCommunity } from '@/hooks/useCommunity'
import TripOverviewMap from '@/components/map/TripOverviewMap'
import ItineraryCard from '@/components/cards/ItineraryCard'
import CommunityCard from '@/components/cards/CommunityCard'
import Spinner from '@/components/ui/Spinner'

function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const { itineraries, loading: iLoading, fetchAll: fetchItineraries } = useItinerary()
  const { communities, loading: cLoading, fetchAll: fetchCommunities, join } = useCommunity()

  useEffect(() => {
    document.title = 'Locavio — Dashboard'
    fetchItineraries()
    fetchCommunities({ limit: 6 })

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchItineraries()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const upcoming = itineraries.filter((it) => it.status === 'upcoming')

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div>
        <h1 className="text-2xl font-semibold text-espresso">
          {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-muted text-sm mt-0.5">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <TripOverviewMap itineraries={itineraries} />

      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-base font-semibold text-espresso mb-3">
            {t('itinerary.upcoming_trips')}
          </h2>
          {iLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : upcoming.length === 0 ? (
            <div className="card text-sm text-muted text-center py-8">
              {t('itinerary.no_itineraries')}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.slice(0, 4).map((it) => (
                <ItineraryCard key={it.id} itinerary={it} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-base font-semibold text-espresso mb-3">
            {t('community.your_communities')}
          </h2>
          {cLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : communities.length === 0 ? (
            <div className="card text-sm text-muted text-center py-8">
              {t('common.empty')}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {communities.slice(0, 4).map((c) => (
                <CommunityCard key={c.id} community={c} onJoin={join} />
              ))}
            </div>
          )}
        </section>
      </div>

      <button
        onClick={() => navigate('/itineraries/new')}
        aria-label={t('itinerary.new')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-accent transition-colors z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}

export default Dashboard
