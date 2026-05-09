import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { buildSpiceTranslationBundles } from './lib/marinade/ingredients/catalog'
import translationEN from './locales/en/translation.json'
import translationRU from './locales/ru/translation.json'

const resources = {
  en: {
    translation: translationEN,
  },
  ru: {
    translation: translationRU,
  },
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    const ext = buildSpiceTranslationBundles()
    i18n.addResourceBundle('ru', 'translation', ext.ru, true, true)
    i18n.addResourceBundle('en', 'translation', ext.en, true, true)
  })

export default i18n
