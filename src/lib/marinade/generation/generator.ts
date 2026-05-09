import { calcCatalogIngredientGrams } from './calc-amounts'
import { getIngredientById } from '../ingredients/catalog'
import { createSeededRandom, randomBetween, roundToHalf } from '../math'
import {
  type BaseIngredientName,
  BASE_INGREDIENT_NAMES,
  LEMON_JUICE_BASE_GRAMS,
  LEMON_JUICE_VARIANCE,
  MEAT_RULES,
  ONION_GRAMS,
  PEPPER_BASE_PER_KG,
} from '../rules'
import { filterIngredientConflicts, selectCatalogIngredientIds } from './select-ingredients'
import { getStyleProfile } from '../styles/profiles'

import type { MarinadeIngredient, MarinadeInput, MarinadeRecipe, RecipeStep, StyleProfile } from '../types'

function makeIngredient(name: string, amountGrams: number): MarinadeIngredient {
  return {
    name,
    amount: `${amountGrams} г`,
    amountGrams,
  }
}

function calcBaseAmount(name: BaseIngredientName, input: MarinadeInput): number | null {
  if (name === 'salt') {
    return roundToHalf(MEAT_RULES[input.meat].saltPerKg)
  }
  if (name === 'black_pepper') {
    if (input.spiceLevel === 0) return null
    return roundToHalf(PEPPER_BASE_PER_KG * (input.spiceLevel / 5))
  }
  return roundToHalf(ONION_GRAMS)
}

function buildRecipeSteps(profile: StyleProfile): RecipeStep[] {
  return profile.stepKeys.map((key) => ({ key }))
}

function buildGrillTips(profile: StyleProfile): RecipeStep[] {
  return profile.grillTipKeys.map((key) => ({ key }))
}

/**
 * Оркестратор v2: каталог ингредиентов + профиль стиля (шаги, жарка, якоря, множитель),
 * выбор через select-ingredients, дозы через calcCatalogIngredientGrams, конфликты — filterIngredientConflicts.
 *
 * Доза каталожной позиции: середина `dosePerKg` × `styleMultiplier` профиля × разреженный `meatAffinity`
 * → база в `calcSpiceAmount` (интенсивность, жирность, острота для `heat`, случайный разброс).
 * Соль / перец / лук: отдельно через `MEAT_RULES` / `PEPPER_BASE_PER_KG` (роль `salt` у вторичных солей — вне MVP).
 */
export function generateMarinadeRecipe(input: MarinadeInput, seed?: number): MarinadeRecipe {
  const effectiveSeed = seed ?? Math.floor(Math.random() * 0x7fffffff)
  const rng = createSeededRandom(effectiveSeed)
  const profile = getStyleProfile(input.style)

  const catalogNamesRaw = selectCatalogIngredientIds(input, rng)
  // Жирному мясу всегда нужна кислота: гарантируем lemon_juice в наборе кандидатов.
  const catalogNames =
    input.fat === 'fatty' && !catalogNamesRaw.includes('lemon_juice')
      ? [...catalogNamesRaw, 'lemon_juice']
      : catalogNamesRaw

  const amountMap = new Map<string, number>()

  for (const name of BASE_INGREDIENT_NAMES) {
    const baseAmount = calcBaseAmount(name, input)
    if (baseAmount === null) continue
    amountMap.set(name, baseAmount)
  }

  for (const name of catalogNames) {
    const ing = getIngredientById(name)
    if (!ing) continue
    amountMap.set(name, calcCatalogIngredientGrams(ing, input, profile.styleMultiplier, rng))
  }

  // Для fatty закрепляем «бытовую» дозу lemon_juice (~30g ±5%) поверх каталожной.
  if (input.fat === 'fatty' && amountMap.has('lemon_juice')) {
    const variance = randomBetween(LEMON_JUICE_VARIANCE[0], LEMON_JUICE_VARIANCE[1], rng)
    amountMap.set('lemon_juice', roundToHalf(LEMON_JUICE_BASE_GRAMS * variance))
  }

  const conflictList = catalogNames.filter((n) => amountMap.has(n))
  const filteredCatalog = filterIngredientConflicts(input, conflictList, amountMap)
  const filteredSet = new Set(filteredCatalog)
  const orderedCatalog = catalogNames.filter((n) => filteredSet.has(n))

  const ingredientNames = [
    ...BASE_INGREDIENT_NAMES.filter((name) => amountMap.has(name)),
    ...orderedCatalog,
  ]

  const ingredients = ingredientNames
    .filter((name, idx, arr) => arr.indexOf(name) === idx)
    .map((name) => makeIngredient(name, amountMap.get(name) ?? 1))

  return {
    meat: input.meat,
    style: input.style,
    intensity: input.intensity,
    fat: input.fat,
    ingredients,
    steps: buildRecipeSteps(profile),
    grillTips: buildGrillTips(profile),
    meta: {
      marinationTimeKey: `recipe.meat.${input.meat}.marinationTime`,
      styleKey: `recipe.form.options.style.${input.style}`,
      spiceLevel: input.spiceLevel,
    },
  }
}
