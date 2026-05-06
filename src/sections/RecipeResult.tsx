import { memo } from 'react'
import { motion } from 'framer-motion'
import type { MarinadeRecipe } from '../lib/marinade/types'

interface RecipeResultProps {
  recipe: MarinadeRecipe | null
  onReset: () => void
  onRandomize: () => void
  isGenerating: boolean
}

const RecipeResult = memo(function RecipeResult({ recipe, onReset, onRandomize, isGenerating }: RecipeResultProps) {
  if (!recipe) {
    return null
  }

  if (isGenerating) {
    return <div style={{ minHeight: '400px' }} />
  }

  return (
    <motion.div
      className="recipe-result-card"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="recipe-fire-header">
        <video
          className="recipe-fire-video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src="/videos/fire-loop.mp4" type="video/mp4" />
        </video>
        <div className="recipe-fire-gradient" />
      </div>

      <div className="recipe-content">
        <div className="recipe-header">
          <h2 className="recipe-title">{recipe.meta.styleLabel} маринад</h2>
          <p className="recipe-subtitle">
            {recipe.meat} • {recipe.intensity} • {recipe.fat} • {recipe.meta.marinadeTimeText}
          </p>
        </div>

        <div className="recipe-section">
          <div className="recipe-section-label">ИНГРЕДИЕНТЫ</div>
          <ul className="recipe-ingredients">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="recipe-ingredient">
                <span className="recipe-bullet">&bull;</span>
                <span className="recipe-ingredient-name">{ingredient.name}</span>
                <span className="recipe-dash">&mdash;</span>
                <span className="recipe-ingredient-amount">{ingredient.amount}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-section">
          <div className="recipe-section-label">ПРИГОТОВЛЕНИЕ</div>
          <ol className="recipe-steps">
            {recipe.steps.map((step, index) => (
              <li key={index} className="recipe-step">
                <span className="recipe-step-number">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="recipe-section">
          <div className="recipe-section-label">V4 МЕТАДАННЫЕ</div>
          <ul className="recipe-ingredients">
            <li className="recipe-ingredient">
              <span className="recipe-bullet">&bull;</span>
              <span className="recipe-ingredient-name">Рекомендация по нарезке</span>
              <span className="recipe-dash">&mdash;</span>
              <span className="recipe-ingredient-amount">{recipe.meta.cutNote}</span>
            </li>
            <li className="recipe-ingredient">
              <span className="recipe-bullet">&bull;</span>
              <span className="recipe-ingredient-name">Алкогольный акцент</span>
              <span className="recipe-dash">&mdash;</span>
              <span className="recipe-ingredient-amount">{recipe.meta.alcoholNote}</span>
            </li>
            <li className="recipe-ingredient">
              <span className="recipe-bullet">&bull;</span>
              <span className="recipe-ingredient-name">Острота</span>
              <span className="recipe-dash">&mdash;</span>
              <span className="recipe-ingredient-amount">{recipe.meta.spiceLevel}/10</span>
            </li>
          </ul>
        </div>

        <div className="recipe-actions">
          <button className="recipe-btn-outline" onClick={onRandomize} type="button">
            Сгенерировать другой
          </button>
          <button className="recipe-btn-outline" onClick={onReset} type="button">
            Начать заново
          </button>
        </div>
      </div>
    </motion.div>
  )
})

export default RecipeResult
