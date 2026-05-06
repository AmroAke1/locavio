import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus } from 'lucide-react'
import { useCommunity } from '@/hooks/useCommunity'
import CommunityCard from '@/components/cards/CommunityCard'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

const CATEGORIES = ['food', 'culture', 'sport', 'social', 'nature', 'travel', 'technology']

function CommunityList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { communities, loading, error, fetchAll, join } = useCommunity()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)

  useEffect(() => {
    document.title = 'Locavio — Communities'
  }, [])

  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    const timer = setTimeout(() => fetchAll(params), 300)
    return () => clearTimeout(timer)
  }, [search, category])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-espresso">{t('community.near_you')}</h1>
        <Button size="sm" onClick={() => navigate('/communities/new')}>
          <Plus size={16} />
          {t('community.create')}
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('community.search_placeholder')}
          aria-label={t('common.search')}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-accent text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label={t('common.filter')}>
        <button
          onClick={() => setCategory(null)}
          aria-pressed={category === null}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
            ${category === null ? 'bg-primary text-white border-primary' : 'border-accent/30 bg-card text-muted hover:text-espresso'}`}
        >
          {t('itinerary.all')}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(category === cat ? null : cat)}
            aria-pressed={category === cat}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize
              ${category === cat ? 'bg-primary text-white border-primary' : 'border-accent/30 bg-card text-muted hover:text-espresso'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="text-danger text-center py-10 text-sm">{error}</div>
      ) : communities.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="text-5xl">👥</span>
          <p className="text-espresso font-medium">{t('community.no_communities')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => (
            <CommunityCard key={c.id} community={c} onJoin={join} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommunityList
