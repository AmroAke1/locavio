import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCommunity } from '@/hooks/useCommunity'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const CATEGORIES = ['food', 'culture', 'sport', 'social', 'nature', 'shopping']

function CommunityNew() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createCommunity, loading, error } = useCommunity()

  const [form, setForm] = useState({
    name: '',
    category: '',
    location: '',
    description: '',
    cover_image: '',
  })

  useEffect(() => {
    document.title = 'Locavio — New Community'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await createCommunity({
        name: form.name,
        category: form.category || null,
        location: form.location || null,
        description: form.description || null,
        cover_image: form.cover_image || null,
      })
      navigate(`/communities/${result.id}`)
    } catch {
      // error state is set by the hook
    }
  }

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-espresso">{t('community.create')}</h1>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
        <Input
          name="name"
          label={t('community.name_label')}
          value={form.name}
          onChange={set('name')}
          placeholder={t('community.name_placeholder')}
          required
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium text-espresso">
            {t('community.category_label')}
          </label>
          <select
            id="category"
            value={form.category}
            onChange={set('category')}
            className="rounded-lg border border-accent px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">{t('community.category_placeholder')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`activity.category.${c}`)}</option>
            ))}
          </select>
        </div>

        <Input
          name="location"
          label={t('community.location_label')}
          value={form.location}
          onChange={set('location')}
          placeholder={t('community.location_placeholder')}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-espresso">
            {t('community.description_label')}
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={set('description')}
            rows={3}
            className="rounded-lg border border-accent px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t('community.description_placeholder')}
          />
        </div>

        <Input
          name="cover_image"
          label={t('community.cover_image_label')}
          value={form.cover_image}
          onChange={set('cover_image')}
          placeholder="https://..."
        />

        {error && <p role="alert" className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={!form.name} size="lg" className="w-full">
          {t('community.create_btn')}
        </Button>
      </form>
    </div>
  )
}

export default CommunityNew
