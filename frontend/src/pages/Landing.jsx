import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Map, Users, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'

function Landing() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    document.title = 'Locavio — Plan your perfect day'
  }, [])

  const features = [
    {
      icon: Sparkles,
      title: t('landing.feature_ai_title'),
      desc: t('landing.feature_ai_desc'),
    },
    {
      icon: Map,
      title: t('landing.feature_map_title'),
      desc: t('landing.feature_map_desc'),
    },
    {
      icon: Users,
      title: t('landing.feature_community_title'),
      desc: t('landing.feature_community_desc'),
    },
  ]

  const steps = [
    { n: 1, title: t('landing.step1_title'), desc: t('landing.step1_desc') },
    { n: 2, title: t('landing.step2_title'), desc: t('landing.step2_desc') },
    { n: 3, title: t('landing.step3_title'), desc: t('landing.step3_desc') },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <header className="container mx-auto px-4 py-4 flex items-center justify-between">
        <span className="text-primary font-semibold text-xl">🗺️ Locavio</span>
        <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
          {t('landing.cta_start')}
        </Button>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-card via-surface to-accent/20 py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold text-espresso leading-tight mb-4">
            {t('landing.hero_title')}
          </h1>
          <p className="text-lg text-muted mb-8 max-w-xl mx-auto">
            {t('landing.hero_sub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>
              {t('landing.cta_start')}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}>
              {t('landing.cta_how')}
            </Button>
          </div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-surface" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-espresso text-center mb-10">
          {t('landing.features_title')}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-espresso">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-card py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold text-espresso text-center mb-10">
            {t('landing.how_title')}
          </h2>
          <div className="flex flex-col gap-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-espresso mb-1">{title}</h3>
                  <p className="text-sm text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-semibold text-espresso mb-3">{t('landing.cta_bottom')}</h2>
        <p className="text-muted mb-8">{t('landing.cta_bottom_sub')}</p>
        <Button size="lg" onClick={() => navigate('/login')}>
          {t('landing.cta_start')} <ArrowRight size={18} />
        </Button>
      </section>

      <footer className="bg-card border-t border-accent/30 py-4 text-center text-sm text-muted">
        © 2025 Locavio
      </footer>
    </div>
  )
}

export default Landing
