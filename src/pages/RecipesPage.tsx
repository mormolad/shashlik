import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MarinadeRecipe } from '../lib/marinade/types'

const STORAGE_KEY = 'shashlik.recipeHistory.v1'

interface StoredRecipe {
  id: string
  savedAt: number
  recipe: MarinadeRecipe
}

function loadHistory(): StoredRecipe[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredRecipe[]) : []
  } catch {
    return []
  }
}

export default function RecipesPage() {
  const { t } = useTranslation()
  const [history] = useState<StoredRecipe[]>(loadHistory)

  return (
    <motion.div
      className="page-content"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="form-title">{t('recipes.title')}</h1>

      {history.length === 0 ? (
        <p className="form-subtitle">{t('recipes.empty')}</p>
      ) : (
        <ul className="recipe-ingredients">
          {history.map((entry) => (
            <li key={entry.id} className="recipe-ingredient">
              <span className="recipe-bullet">&bull;</span>
              <span className="recipe-ingredient-name">
                {t(entry.recipe.meta.styleKey, { defaultValue: entry.recipe.style })} —{' '}
                {t(`recipe.form.options.meat.${entry.recipe.meat}`, {
                  defaultValue: entry.recipe.meat,
                })}
              </span>
              <span className="recipe-dash">&mdash;</span>
              <span className="recipe-ingredient-amount">
                {new Date(entry.savedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
