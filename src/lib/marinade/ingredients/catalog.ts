import ingredientsData from '../data/spices_database.json'

import type {
  IngredientDefinition,
  IngredientGroup,
  IngredientRole,
  MeatType,
  SpiceType,
  StyleType,
} from '../types'

/**
 * Единственный источник правды по ингредиентам — `data/spices_database.json`.
 * Здесь только: чтение, валидация ролей/доз, индекс по id, пул для (style, meat),
 * жёсткие/высокодозные конфликты и i18n-бандлы.
 */

interface IngredientRecord {
  id: string
  labels: { ru: string; en: string }
  group: IngredientGroup
  calcType: SpiceType
  baseAmount: number
  priority: number
  allowedStyles: StyleType[]
  /**
   * Веса для weightedPick по типу мяса. 0 = ингредиент не предлагается этому
   * мясу (это и есть единственный фильтр совместимости — отдельного
   * `allowedMeats` в данных нет).
   */
  compatibilityWeight: Record<MeatType, number>
  meatAffinity?: Partial<Record<MeatType, number>>
}

const RAW: readonly IngredientRecord[] = ingredientsData as readonly IngredientRecord[]

function rolesFor(type: SpiceType): readonly IngredientRole[] {
  switch (type) {
    case 'hot':
      return ['heat']
    case 'smoky':
      return ['smoky', 'aroma']
    case 'acid':
      return ['acid', 'aroma']
    case 'herb':
      return ['herbal', 'aroma']
    case 'fresh':
      return ['fresh', 'umami']
    case 'warm':
      return ['aroma', 'herbal']
    case 'base':
      return ['salt']
    case 'sweet':
      return ['sweet', 'aroma']
    case 'fat':
      return ['fat']
    case 'umami':
      return ['umami', 'aroma']
    default:
      return ['aroma']
  }
}

function recordToDefinition(r: IngredientRecord): IngredientDefinition {
  const dosePerKg: [number, number] = [
    Math.max(0.5, r.baseAmount * 0.65),
    Math.max(1, r.baseAmount * 1.35),
  ]
  return {
    id: r.id,
    group: r.group,
    roles: rolesFor(r.calcType),
    dosePerKg,
    allowedStyles: [...r.allowedStyles],
    compatibilityWeight: { ...r.compatibilityWeight },
    priority: r.priority,
    calcType: r.calcType,
  }
}

const RECORD_BY_ID: Map<string, IngredientRecord> = new Map(RAW.map((r) => [r.id, r]))

export const INGREDIENT_CATALOG: readonly IngredientDefinition[] = RAW.map(recordToDefinition)

const INGREDIENT_BY_ID: Map<string, IngredientDefinition> = new Map(
  INGREDIENT_CATALOG.map((i) => [i.id, i]),
)

export function getIngredientById(id: string): IngredientDefinition | undefined {
  return INGREDIENT_BY_ID.get(id)
}

/** Пул кандидатов для стиля и мяса (совместимость > 0). */
export function poolForStyleAndMeat(style: StyleType, meat: MeatType): IngredientDefinition[] {
  return INGREDIENT_CATALOG.filter(
    (ing) => ing.allowedStyles.includes(style) && (ing.compatibilityWeight[meat] ?? 0) > 0,
  )
}

/** Множитель дозы «мясо × ингредиент»; 1 если в JSON нет переопределения. */
export function meatAffinityFor(id: string, meat: MeatType): number {
  return RECORD_BY_ID.get(id)?.meatAffinity?.[meat] ?? 1
}

/** RU/EN-метки для i18next (recipe.spice.<id>). */
export function buildSpiceTranslationBundles(): {
  ru: { recipe: { spice: Record<string, string> } }
  en: { recipe: { spice: Record<string, string> } }
} {
  const ru: Record<string, string> = {}
  const en: Record<string, string> = {}
  for (const r of RAW) {
    ru[r.id] = r.labels.ru
    en[r.id] = r.labels.en
  }
  return { ru: { recipe: { spice: ru } }, en: { recipe: { spice: en } } }
}
