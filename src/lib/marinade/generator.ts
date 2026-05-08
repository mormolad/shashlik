import { calcSpiceAmount } from './calcAmounts'
import { createSeededRandom, randomBetween, roundToHalf } from './math'
import { getAlcoholNoteKey, getCutNoteKey } from './notes'
import {
  BASE_INGREDIENTS,
  LEMON_JUICE_BASE_GRAMS,
  LEMON_JUICE_VARIANCE,
  MEAT_RULES,
  PEPPER_BASE_PER_KG,
  REQUIRED_SPICES_BY_MEAT,
} from './rules'
import { filterConflicts, selectStyleSpices } from './selectSpices'
import { SPICE_DB } from './spice-db'

import type {
  MarinadeIngredient,
  MarinadeInput,
  MarinadeRecipe,
  RecipeStep,
  SpiceDefinition,
} from './types'

function getSpice(name: string): SpiceDefinition | undefined {
  return SPICE_DB.find((spice) => spice.name === name)
}

function makeIngredient(name: string, amountGrams: number): MarinadeIngredient {
  return {
    name,
    amount: `${amountGrams} г`,
    amountGrams,
  }
}

type BaseName = 'salt' | 'black_pepper' | 'onion'

function isBase(name: string): name is BaseName {
  return name === 'salt' || name === 'black_pepper' || name === 'onion'
}

/**
 * Возвращает массу базового ингредиента в граммах, либо null если
 * ингредиент не должен попасть в рецепт (black_pepper при spiceLevel=0).
 */
function calcBaseAmount(name: BaseName, input: MarinadeInput): number | null {
  if (name === 'salt') {
    return roundToHalf(MEAT_RULES[input.meat].saltPerKg)
  }
  if (name === 'black_pepper') {
    if (input.spiceLevel === 0) return null
    return roundToHalf(PEPPER_BASE_PER_KG * (input.spiceLevel / 5))
  }
  // onion
  const baseItem = BASE_INGREDIENTS.find((item) => item.name === 'onion')
  return roundToHalf(baseItem?.amount ?? 300)
}

function buildSteps(input: MarinadeInput): RecipeStep[] {
  const recommendedTime = MEAT_RULES[input.meat].marinationTime
  return [
    { key: 'recipe.steps.mixDry' },
    { key: 'recipe.steps.combine' },
    { key: 'recipe.steps.recommendedTime', params: { time: recommendedTime } },
    { key: 'recipe.steps.dryBeforeGrill' },
  ]
}

/**
 * Главный оркестратор. Делает только маршрутизацию между шагами:
 *  1) собрать обязательные специи + стилевые,
 *  2) посчитать массы (база + расчётные),
 *  3) добавить лимонный сок для жирного мяса,
 *  4) убрать конфликты,
 *  5) собрать финальный объект рецепта с метой и шагами.
 */
export function generateMarinadeRecipe(input: MarinadeInput, seed?: number): MarinadeRecipe {
  // Math.random() даёт лучшую дисперсию, чем Date.now() при быстрых повторных вызовах
  const effectiveSeed = seed ?? Math.floor(Math.random() * 0x7fffffff)
  const rng = createSeededRandom(effectiveSeed)

  // 1. Кандидаты
  const selected = new Set<string>()
  BASE_INGREDIENTS.forEach((item) => selected.add(item.name))
  REQUIRED_SPICES_BY_MEAT[input.meat].forEach((spice) => selected.add(spice))
  selectStyleSpices(input, selected, rng)

  // 2. Массы
  const amountMap = new Map<string, number>()
  for (const name of [...selected]) {
    if (isBase(name)) {
      const baseAmount = calcBaseAmount(name, input)
      if (baseAmount === null) {
        selected.delete(name)
      } else {
        amountMap.set(name, baseAmount)
      }
      continue
    }
    const spice = getSpice(name)
    if (!spice) continue
    amountMap.set(name, calcSpiceAmount(spice.baseAmount, spice.type, input, rng))
  }

  // 3. Лимонный сок для жирного мяса
  if (input.fat === 'fatty') {
    const variance = randomBetween(LEMON_JUICE_VARIANCE[0], LEMON_JUICE_VARIANCE[1], rng)
    amountMap.set('lemon_juice', roundToHalf(LEMON_JUICE_BASE_GRAMS * variance))
  }

  // 4. Конфликты
  const styleSpicesAndRequired = [...selected].filter(
    (name) => !BASE_INGREDIENTS.find((item) => item.name === name),
  )
  const filteredSpices = filterConflicts(input, styleSpicesAndRequired, amountMap)

  // 5. Финальная сборка (база попадает только если у неё есть амаунт —
  //    например, black_pepper при spiceLevel=0 удалён из amountMap)
  const ingredientNames = [
    ...BASE_INGREDIENTS.filter((item) => amountMap.has(item.name)).map((item) => item.name),
    ...filteredSpices,
    ...(input.fat === 'fatty' ? ['lemon_juice'] : []),
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
    steps: buildSteps(input),
    meta: {
      marinadeTimeKey: `recipe.form.options.marinadeTime.${input.marinadeTime}`,
      cutNoteKey: getCutNoteKey(input.cutType),
      alcoholNoteKey: getAlcoholNoteKey(input.alcoholPairing),
      styleKey: `recipe.form.options.style.${input.style}`,
      spiceLevel: input.spiceLevel,
    },
  }
}
