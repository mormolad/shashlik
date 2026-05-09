import type {
  FatType,
  IntensityType,
  MeatType,
  SpiceType,
} from './types'

/**
 * Доменные параметры по типу мяса (соль на кг).
 * Длительность маринования живёт в i18n: ключ `recipe.meat.<id>.marinationTime`.
 */
export const MEAT_RULES: Record<MeatType, { saltPerKg: number }> = {
  pork: { saltPerKg: 10 },
  lamb: { saltPerKg: 14 },
  chicken: { saltPerKg: 9 },
  beef: { saltPerKg: 12 },
  turkey: { saltPerKg: 10 },
}

export const PEPPER_BASE_PER_KG = 2

/** Имена базы (всегда добавляются в рецепт, дозы считаются отдельно). */
export const BASE_INGREDIENT_NAMES = ['salt', 'black_pepper', 'onion'] as const
export type BaseIngredientName = (typeof BASE_INGREDIENT_NAMES)[number]

/** Базовая доза лука (г) — больше нигде не настраивается. */
export const ONION_GRAMS = 300

export const REQUIRED_SPICES_BY_MEAT: Record<MeatType, string[]> = {
  lamb: ['cumin', 'coriander'],
  chicken: ['garlic'],
  pork: ['paprika'],
  beef: ['coriander'],
  turkey: ['garlic', 'basil'],
}

export const MEAT_COEFFICIENT: Record<MeatType, number> = {
  chicken: 1,
  pork: 1.1,
  beef: 0.84,
  lamb: 1.5,
  turkey: 0.95,
}

export const INTENSITY_COEFFICIENT: Record<IntensityType, number> = {
  light: 0.8,
  medium: 1,
  strong: 1.3,
}

export const FAT_GLOBAL_COEFFICIENT: Record<FatType, number> = {
  lean: 1.2,
  normal: 1,
  fatty: 0.7,
}

export const AROMATIC_TYPES: SpiceType[] = ['warm', 'fresh', 'herb']
export const BRIGHT_TYPES: SpiceType[] = ['hot', 'smoky', 'acid']

export const FAT_TYPE_BOOSTS = {
  leanAromaticBoost: 1.2,
  fattyBrightBoost: 1.25,
}

// --- Tunables for the generator (extracted from magic numbers) ---

/** Минимальная масса специи (г), ниже которой ингредиент не имеет смысла. */
export const MIN_SPICE_AMOUNT_GRAMS = 0.5

/** Лёгкий случайный разброс веса каждой специи (±10%). */
export const RANDOM_VARIANCE: readonly [number, number] = [0.9, 1.1]

/** Базовая масса лимонного сока для жирного мяса (г). */
export const LEMON_JUICE_BASE_GRAMS = 30

/** Лёгкий разброс лимонного сока (±5%). */
export const LEMON_JUICE_VARIANCE: readonly [number, number] = [0.95, 1.05]

/**
 * Порог дозировки (г), выше которого пары из HIGH_DOSE_CONFLICTS
 * считаются конфликтующими и одна из них удаляется.
 */
export const HIGH_DOSE_THRESHOLD_GRAMS = 4

/** При spiceLevel = 5 hot-специи имеют коэффициент 1.2 (0.7 + 5/10). */
export const SPICE_LEVEL_OFFSET = 0.7
export const SPICE_LEVEL_DIVISOR = 10
