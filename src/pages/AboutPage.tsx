import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <motion.div
      className="page-content"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="form-title">{t('about.title')}</h1>
      <p className="form-subtitle">{t('about.lead')}</p>

      <section className="recipe-section">
        <div className="recipe-section-label">{t('about.howItWorks.label')}</div>
        <ul className="recipe-ingredients">
          <li className="recipe-ingredient">
            <span className="recipe-bullet">&bull;</span>
            <span>{t('about.howItWorks.step1')}</span>
          </li>
          <li className="recipe-ingredient">
            <span className="recipe-bullet">&bull;</span>
            <span>{t('about.howItWorks.step2')}</span>
          </li>
          <li className="recipe-ingredient">
            <span className="recipe-bullet">&bull;</span>
            <span>{t('about.howItWorks.step3')}</span>
          </li>
        </ul>
      </section>

      <section className="recipe-section">
        <div className="recipe-section-label">{t('about.stack.label')}</div>
        <ul className="recipe-ingredients">
          <li className="recipe-ingredient">
            <span className="recipe-bullet">&bull;</span>
            <span>{t('about.stack.line1')}</span>
          </li>
          <li className="recipe-ingredient">
            <span className="recipe-bullet">&bull;</span>
            <span>{t('about.stack.line2')}</span>
          </li>
        </ul>
      </section>
    </motion.div>
  )
}
