import { motion } from 'framer-motion'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import type { MarinadeRecipe } from '../lib/marinade/types'

export interface RecipeResultProps {
  recipe: MarinadeRecipe | null
  onReset: () => void
  onRandomize: () => void
  isGenerating: boolean
}

const RecipeResult = memo(function RecipeResult({
  recipe,
  onReset,
  onRandomize,
  isGenerating,
}: RecipeResultProps) {
  const { t } = useTranslation()
  if (!recipe) return null

  if (isGenerating) {
    return <div className="lazy-route-placeholder" aria-busy="true" />
  }

  const styleLabel = t(recipe.meta.styleKey, { defaultValue: recipe.style })
  const meatLabel = t(`recipe.form.options.meat.${recipe.meat}`, { defaultValue: recipe.meat })
  const intensityLabel = t(`recipe.form.options.intensity.${recipe.intensity}`, {
    defaultValue: recipe.intensity,
  })
  const fatLabel = t(`recipe.form.options.fat.${recipe.fat}`, { defaultValue: recipe.fat })
  const marinationTimeText = t(recipe.meta.marinationTimeKey, { defaultValue: '' })
  const spiceLevelText = t('recipe.result.spiceLevel', { level: recipe.meta.spiceLevel })

  return (
    <motion.div
      className="recipe-result-card"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="recipe-fire-header" aria-hidden="true">
        <video
          className="recipe-fire-video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/videos/fire-loop.mp4" type="video/mp4" />
        </video>
        <div className="recipe-fire-gradient" />
      </div>

      <div className="recipe-content">
        <div className="recipe-header">
          <h2 className="recipe-title">
            {t('recipe.result.titleSuffix', { style: styleLabel })}
          </h2>
          <p className="recipe-subtitle">
            {meatLabel} • {intensityLabel} • {fatLabel} • {marinationTimeText} • {spiceLevelText}
          </p>
        </div>

        <div className="recipe-section">
          <div className="recipe-section-label">{t('recipe.result.ingredients')}</div>
          <ul className="recipe-ingredients">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.name} className="recipe-ingredient">
                <span className="recipe-bullet">&bull;</span>
                <span className="recipe-ingredient-name">
                  {t(`recipe.spice.${ingredient.name}`, { defaultValue: ingredient.name })}
                </span>
                <span className="recipe-dash">&mdash;</span>
                <span className="recipe-ingredient-amount">{ingredient.amount}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-section">
          <div className="recipe-section-label">{t('recipe.result.preparation')}</div>
          <ol className="recipe-steps">
            {recipe.steps.map((step, index) => {
              const params =
                step.key === 'recipe.steps.recommendedTime'
                  ? { ...step.params, time: marinationTimeText }
                  : step.params
              return (
                <li key={`${step.key}-${index}`} className="recipe-step">
                  <span className="recipe-step-number">{index + 1}.</span>
                  <span>{t(step.key, params)}</span>
                </li>
              )
            })}
          </ol>
        </div>

        {recipe.grillTips && recipe.grillTips.length > 0 && (
          <div className="recipe-section">
            <div className="recipe-section-label">{t('recipe.result.grill')}</div>
            <ul className="recipe-grill-tips">
              {recipe.grillTips.map((tip, index) => (
                <li key={`${tip.key}-${index}`} className="recipe-grill-tip">
                  <span className="recipe-bullet">&bull;</span>
                  <span>{t(tip.key)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="recipe-actions">
          <button className="recipe-btn-outline" onClick={onRandomize} type="button">
            {t('recipe.result.randomize')}
          </button>
          <button className="recipe-btn-outline" onClick={onReset} type="button">
            {t('recipe.result.reset')}
          </button>
        </div>
      </div>
    </motion.div>
  )
})

export default RecipeResult
