import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import ar from './locales/ar.json'
import tr from './locales/tr.json'

const savedLanguage = localStorage.getItem('language')
const browserLanguage = navigator.language.split('-')[0]
const supportedLanguages = ['en', 'fr', 'es', 'ar', 'tr']
const defaultLanguage = supportedLanguages.includes(savedLanguage)
  ? savedLanguage
  : supportedLanguages.includes(browserLanguage)
  ? browserLanguage
  : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    ar: { translation: ar },
    tr: { translation: tr },
  },
  lng: defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
