import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, MapPin, Calendar, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useItinerary } from '@/hooks/useItinerary'
import { useReviews } from '@/hooks/useReviews'
import ItineraryDetailMap from '@/components/map/ItineraryDetailMap'
import ActivityCard from '@/components/cards/ActivityCard'
import ReviewCard from '@/components/cards/ReviewCard'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import * as itineraryService from '@/services/itineraryService'

const STATUS_VARIANT = { draft: 'muted', upcoming: 'default', active: 'success', completed: 'muted', wishlist: 'warning' }

function ItineraryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  const { itinerary, loading, error, fetchOne, removeItinerary } = useItinerary()
  const { reviews, avgRating, loading: rLoading, fetchForActivity, addReview, removeReview } = useReviews()

  const [selectedActivityId, setSelectedActivityId] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Locavio — Itinerary'
    fetchOne(id)
  }, [id])

  useEffect(() => {
    if (itinerary?.activities?.length > 0 && !selectedActivityId) {
      const firstId = itinerary.activities[0].id
      setSelectedActivityId(firstId)
      fetchForActivity(firstId)
    }
  }, [itinerary])

  const handleActivitySelect = (actId) => {
    setSelectedActivityId(actId)
    fetchForActivity(actId)
  }

  const handleDeleteActivity = async (actId) => {
    await itineraryService.removeActivity(actId)
    fetchOne(id)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!selectedActivityId) return
    setReviewSubmitting(true)
    setReviewError(null)
    try {
      await addReview({ activity_id: selectedActivityId, rating: reviewRating, comment: reviewComment })
      setReviewComment('')
      setReviewRating(5)
    } catch (err) {
      setReviewError(err.response?.data?.detail || t('common.error'))
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleDeleteItinerary = async () => {
    await removeItinerary(id)
    navigate('/itineraries')
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error) return <div className="text-danger text-center py-10">{error}</div>
  if (!itinerary) return null

  const sortedActivities = [...(itinerary.activities || [])].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-espresso">{itinerary.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {itinerary.status && (
              <Badge variant={STATUS_VARIANT[itinerary.status]}>{t(`itinerary.status.${itinerary.status}`)}</Badge>
            )}
            {itinerary.purpose && (
              <Badge variant="muted">{t(`itinerary.purpose.${itinerary.purpose}`)}</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted">
            {itinerary.location && (
              <span className="flex items-center gap-1"><MapPin size={13} />{itinerary.location}</span>
            )}
            {itinerary.date && (
              <span className="flex items-center gap-1"><Calendar size={13} />{itinerary.date}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/itineraries/${id}/edit`)}>
            <Pencil size={14} /> {t('common.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeleteItinerary}>
            <Trash2 size={14} className="text-danger" />
          </Button>
        </div>
      </div>

      {itinerary.description && (
        <p className="text-sm text-muted leading-relaxed">{itinerary.description}</p>
      )}

      <ItineraryDetailMap activities={sortedActivities} />

      <section>
        <h2 className="text-base font-semibold text-espresso mb-3">{t('activity.order')}s</h2>
        {sortedActivities.length === 0 ? (
          <p className="text-sm text-muted">{t('itinerary.no_activities')}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedActivities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                showControls
                onDelete={handleDeleteActivity}
              />
            ))}
          </div>
        )}
      </section>

      {sortedActivities.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-espresso">{t('itinerary.reviews')}</h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm text-muted shrink-0" htmlFor="activity-select">
              {t('itinerary.select_activity')}
            </label>
            <select
              id="activity-select"
              value={selectedActivityId || ''}
              onChange={(e) => handleActivitySelect(Number(e.target.value))}
              className="flex-1 rounded-lg border border-accent px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {sortedActivities.map((act) => (
                <option key={act.id} value={act.id}>{act.title}</option>
              ))}
            </select>
            {avgRating != null && (
              <span className="flex items-center gap-2 text-sm text-muted">
                <StarRating rating={Math.round(avgRating)} />
                {avgRating.toFixed(1)}
              </span>
            )}
          </div>

          {rLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="relative">
                  <ReviewCard review={r} />
                  {r.user_id === user?.id && (
                    <button
                      onClick={() => removeReview(r.id, selectedActivityId)}
                      aria-label={t('common.delete')}
                      className="absolute top-3 right-3 p-1 text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="card flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-espresso">{t('itinerary.add_review')}</h3>
            <div>
              <p className="text-xs text-muted mb-1">{t('itinerary.avg_rating')}</p>
              <StarRating rating={reviewRating} onChange={setReviewRating} />
            </div>
            <Input
              name="review-comment"
              label={t('common.edit')}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
            />
            {reviewError && <p className="text-danger text-xs">{reviewError}</p>}
            <Button type="submit" size="sm" loading={reviewSubmitting}>
              {t('common.save')}
            </Button>
          </form>
        </section>
      )}
    </div>
  )
}

export default ItineraryDetail
