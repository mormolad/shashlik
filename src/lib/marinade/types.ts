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

export type SpiceType =
  | 'base'
  | 'warm'
  | 'fresh'
  | 'hot'
  | 'smoky'
  | 'acid'
  | 'herb'
  | 'sweet'
  | 'fat'
  | 'umami'

/** Роли вкуса для v2-генератора (закрытый список из ТЗ). */
export type IngredientRole =
  | 'salt'
  | 'acid'
  | 'heat'
  | 'sweet'
  | 'fat'
  | 'fresh'
  | 'herbal'
  | 'umami'
  | 'aroma'
  | 'smoky'

export type IngredientGroup =
  | 'dry_spices'
  | 'fresh_herbs'
  | 'vegetables'
  | 'liquids'
  | 'acids'
  | 'sweeteners'
  | 'sauces'
  | 'premium'

/**
 * Каталог ингредиентов v2: id, группа, роли, доза на кг, совместимость со стилем/мясом.
 * Тексты для UI — только через i18n `recipe.spice.${id}`.
 */
export interface IngredientDefinition {
  id: string
  group: IngredientGroup
  roles: readonly IngredientRole[]
  /** Диапазон граммов на 1 кг мяса (до множителей интенсивности/стиля/остроты). */
  dosePerKg: readonly [number, number]
  allowedStyles: readonly StyleType[]
  /** Вес в weightedPick; 0 = не предлагать этому мясу (заменяет отдельный список allowedMeats). */
  compatibilityWeight: Readonly<Record<MeatType, number>>
  priority: number
  /** Наследие расчёта жира/остроты из calcSpiceAmount. */
  calcType: SpiceType
}

export interface StyleMarinadeTemplate {
  /** Сколько дополнительных позиций набрать из пула (мин..макс). */
  extraPickRange: readonly [number, number]
  /** Сначала пытаемся закрыть роль из пула (кислота, жир…). */
  requiredRoles?: readonly IngredientRole[]
}

export interface StyleAnchor {
  readonly id: string
  /** Вероятность включения при генерации (0..1). */
  readonly preference: number
}

export interface StyleProfile {
  styleMultiplier: number
  marinadeTemplate: StyleMarinadeTemplate
  anchors: readonly StyleAnchor[]
  /** Ключи i18n шагов по порядку. UI подставляет `time` для `recipe.steps.recommendedTime` из `MarinadeMeta.marinationTimeKey`. */
  stepKeys: readonly string[]
  grillTipKeys: readonly string[]
}

export interface MarinadeInput {
  meat: MeatType
  style: StyleType
  intensity: IntensityType
  fat: FatType
  spiceLevel: number
}

/**
 * Один шаг рецепта в формате "ключ i18n + параметры".
 * UI достаёт его как `t(step.key, step.params)`. Если шагу нужна
 * переводимая подстановка (например, время маринования), UI берёт
 * её из соответствующего поля `MarinadeMeta` (см. `marinationTimeKey`).
 */
export interface RecipeStep {
  key: string
  params?: Record<string, string | number>
}

export interface MarinadeIngredient {
  /** id из каталога ('cumin', 'salt', 'lemon_juice', ...). UI переводит как `t('recipe.spice.${name}')`. */
  name: string
  /** Локализованная строка вида "12 г". */
  amount: string
  amountGrams: number
}

export interface MarinadeMeta {
  /** Ключ i18n рекомендованной длительности маринования по типу мяса (`recipe.meat.<id>.marinationTime`). */
  marinationTimeKey: string
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
  /** Советы по жарке (ключи i18n), из профиля стиля v2. */
  grillTips?: RecipeStep[]
  meta: MarinadeMeta
}
