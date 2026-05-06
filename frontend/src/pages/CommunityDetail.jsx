import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Users } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCommunity } from '@/hooks/useCommunity'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

const TABS = ['about', 'members', 'activities']

function CommunityDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  const { community, members, loading, error, fetchOne, fetchMembers, join, leave } = useCommunity()
  const [activeTab, setActiveTab] = useState('about')
  const [isMember, setIsMember] = useState(false)
  const [memberLoading, setMemberLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    document.title = 'Locavio — Community'
    fetchOne(id)
  }, [id])

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers(id, { page, limit: 20 })
    }
  }, [activeTab, page, id])

  useEffect(() => {
    if (members.length > 0 && user) {
      setIsMember(members.some((m) => m.user_id === user.id))
    }
  }, [members, user])

  const handleJoin = async () => {
    setMemberLoading(true)
    try {
      await join(id)
      setIsMember(true)
      fetchMembers(id, { page: 1 })
    } catch (err) {
      if (err?.response?.status === 409) setIsMember(true)
    } finally {
      setMemberLoading(false)
    }
  }

  const handleLeave = async () => {
    setMemberLoading(true)
    try {
      await leave(id)
      setIsMember(false)
    } finally {
      setMemberLoading(false)
    }
  }

  if (loading && !community) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error) return <div className="text-danger text-center py-10">{error}</div>
  if (!community) return null

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-xl h-48 flex items-end p-5"
        style={{
          background: community.cover_image
            ? `url(${community.cover_image}) center/cover`
            : 'linear-gradient(135deg, #A0522D 0%, #D4A373 100%)',
        }}
      >
        {community.category && <Badge variant="default">{community.category}</Badge>}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-espresso">{community.name}</h1>
          <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-muted">
            {community.location && (
              <span className="flex items-center gap-1"><MapPin size={13} />{community.location}</span>
            )}
            <span className="flex items-center gap-1">
              <Users size={13} />
              {community.member_count ?? 0} {t('community.members')}
            </span>
          </div>
        </div>
        <Button
          variant={isMember ? 'secondary' : 'primary'}
          onClick={isMember ? handleLeave : handleJoin}
          loading={memberLoading}
          size="sm"
          className="shrink-0"
        >
          {isMember ? t('community.leave') : t('community.join')}
        </Button>
      </div>

      <div className="flex border-b border-accent/30" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-espresso'}`}
          >
            {t(`community.${tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'about' && (
        <div className="flex flex-col gap-3">
          {community.description ? (
            <p className="text-sm text-muted leading-relaxed">{community.description}</p>
          ) : (
            <p className="text-sm text-muted">{t('common.empty')}</p>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="flex flex-col gap-3">
          {members.length === 0 ? (
            <p className="text-sm text-muted">{t('common.empty')}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {members.map((m) => (
                <div key={m.id} className="card flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {m.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-espresso truncate">{m.user?.name || 'User'}</p>
                    <p className="text-xs text-muted capitalize">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 justify-center mt-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              ←
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)}>
              →
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-4xl">🚧</span>
          <p className="text-muted text-sm">{t('community.coming_soon')}</p>
        </div>
      )}
    </div>
  )
}

export default CommunityDetail
