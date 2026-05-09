import type { MarinadeRecipe } from '../marinade/types'

const RECIPE_HISTORY_STORAGE_KEY = 'shashlik.recipeHistory.v1'
const MAX_ENTRIES = 50

export interface StoredRecipe {
  id: string
  savedAt: number
  recipe: MarinadeRecipe
}

/**
 * UUID v4 с фолбэком: `crypto.randomUUID()` есть в современных браузерах и в
 * `secure context`, но недоступен под `http://` (кроме `localhost`) и в
 * некоторых приватных режимах. Идентификатор нужен только для key в списке
 * истории, поэтому слабый фолбэк допустим.
 */
function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function loadRecipeHistory(): StoredRecipe[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECIPE_HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredRecipe[]) : []
  } catch {
    return []
  }
}

export function appendRecipeToHistory(recipe: MarinadeRecipe): void {
  if (typeof window === 'undefined') return
  try {
    const entry: StoredRecipe = {
      id: makeId(),
      savedAt: Date.now(),
      recipe,
    }
    const next = [entry, ...loadRecipeHistory()].slice(0, MAX_ENTRIES)
    window.localStorage.setItem(RECIPE_HISTORY_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // quota / private mode — игнорируем
  }
}
