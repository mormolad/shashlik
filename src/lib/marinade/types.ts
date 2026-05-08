export type MeatType = 'chicken' | 'pork' | 'beef' | 'lamb' | 'turkey'
export type StyleType =
  | 'classic'
  | 'caucasus'
  | 'turkish'
  | 'eastern'
  | 'spicy'
  | 'premium'
  | 'herbal'
  | 'express'
export type IntensityType = 'light' | 'medium' | 'strong'
export type FatType = 'lean' | 'normal' | 'fatty'

export type MarinadeTimePreference = 'quick' | 'standard' | 'long'
export type CutType = 'cube' | 'steak' | 'ribs'
export type AlcoholPairing = 'none' | 'wine' | 'beer' | 'vodka'

export type SpiceType = 'base' | 'warm' | 'fresh' | 'hot' | 'smoky' | 'acid' | 'herb'

export interface MarinadeInput {
  meat: MeatType
  style: StyleType
  intensity: IntensityType
  fat: FatType
  marinadeTime: MarinadeTimePreference
  cutType: CutType
  alcoholPairing: AlcoholPairing
  spiceLevel: number
}

export interface SpiceDefinition {
  name: string
  baseAmount: number
  type: SpiceType
  styles: StyleType[]
  compatibleWith: MeatType[]
  priority: number
}

/**
 * Один шаг рецепта в формате "ключ i18n + параметры".
 * UI достаёт его как `t(step.key, step.params)`.
 */
export interface RecipeStep {
  key: string
  params?: Record<string, string | number>
}

export interface MarinadeIngredient {
  /** Имя из SPICE_DB ('cumin', 'salt', 'lemon_juice', ...). UI переводит как `t('recipe.spice.${name}')`. */
  name: string
  /** Локализованная строка вида "12 г". */
  amount: string
  amountGrams: number
}

export interface MarinadeMeta {
  /** Ключ i18n для длительности маринования (например, 'recipe.form.options.marinadeTime.standard'). */
  marinadeTimeKey: string
  /** Ключ i18n для заметки по типу нарезки. */
  cutNoteKey: string
  /** Ключ i18n для заметки по сочетанию с алкоголем. */
  alcoholNoteKey: string
  /** Ключ i18n для названия стиля. */
  styleKey: string
  spiceLevel: number
}

export interface MarinadeRecipe {
  meat: MeatType
  style: StyleType
  intensity: IntensityType
  fat: FatType
  ingredients: MarinadeIngredient[]
  steps: RecipeStep[]
  meta: MarinadeMeta
}
