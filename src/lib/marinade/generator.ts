import { calcSpiceAmount } from './calcAmounts'
import { createSeededRandom, randomBetween, roundToHalf } from './math'
import { getAlcoholNote, getCutNote } from './notes'
import {
  BASE_INGREDIENTS,
  LEMON_JUICE_BASE_GRAMS,
  LEMON_JUICE_VARIANCE,
  MARINADE_TIME_LABELS,
  MEAT_RULES,
  PEPPER_BASE_PER_KG,
  REQUIRED_SPICES_BY_MEAT,
  STYLE_LABELS,
} from './rules'
import { filterConflicts, selectStyleSpices } from './selectSpices'
import { SPICE_DB, SPICE_LABELS_RU } from './spice-db'

import type {
  MarinadeIngredient,
  MarinadeInput,
  MarinadeRecipe,
  SpiceDefinition,
} from './types'

function getSpice(name: string): SpiceDefinition | undefined {
  return SPICE_DB.find((spice) => spice.name === name)
}

function makeIngredient(name: string, amountGrams: number): MarinadeIngredient {
  return {
    name: SPICE_LABELS_RU[name] ?? name,
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

  const recommendedTime = MEAT_RULES[input.meat].marinationTime
  const steps = [
    'Смешайте сухие специи в отдельной миске.',
    'Добавьте лук, соль и перец, затем вмешайте остальные ингредиенты.',
    `Рекомендуемое время маринования для этого мяса: ${recommendedTime}.`,
    'Перед жаркой уберите излишки маринада и обсушите мясо.',
  ]

  return {
    meat: input.meat,
    style: input.style,
    intensity: input.intensity,
    fat: input.fat,
    ingredients,
    steps,
    meta: {
      marinadeTimeText: MARINADE_TIME_LABELS[input.marinadeTime],
      cutNote: getCutNote(input.cutType),
      alcoholNote: getAlcoholNote(input.alcoholPairing),
      spiceLevel: input.spiceLevel,
      styleLabel: STYLE_LABELS[input.style],
    },
  }
}
