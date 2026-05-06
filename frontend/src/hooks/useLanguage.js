import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/store/uiStore'
import i18n from '@/i18n'

export function useLanguage() {
  const { language, setLanguage } = useUiStore()
  const { t } = useTranslation()

  const changeLanguage = (lang) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    document.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  return { language, changeLanguage, t }
}
