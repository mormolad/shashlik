import { createSeededRandom, randomBetween, roundToHalf, weightedPick, type RandomGenerator } from './math'
import {
  AROMATIC_TYPES,
  BASE_INGREDIENTS,
  BRIGHT_TYPES,
  FAT_GLOBAL_COEFFICIENT,
  FAT_TYPE_BOOSTS,
  INTENSITY_COEFFICIENT,
  MARINADE_TIME_LABELS,
  MEAT_COEFFICIENT,
  MEAT_RULES,
  PEPPER_BASE_PER_KG,
  REQUIRED_SPICES_BY_MEAT,
  STYLE_LABELS,
} from './rules'
import { COMPATIBILITY_TABLE, HARD_CONFLICTS, HIGH_DOSE_CONFLICTS, SPICE_DB, SPICE_LABELS_RU } from './spice-db'
import type { MarinadeIngredient, MarinadeInput, MarinadeRecipe, SpiceDefinition } from './types'

const HIGH_DOSE_THRESHOLD = 4

function formatAmount(amountGrams: number): string {
  return `${amountGrams} г`
}

function getSpice(name: string): SpiceDefinition | undefined {
  return SPICE_DB.find(spice => spice.name === name)
}

function hasHardConflict(selected: string[], candidate: string, meat: MarinadeInput['meat']): boolean {
  if (candidate === 'dill' && meat === 'lamb') return true
  return HARD_CONFLICTS.some(([a, b]) => {
    const includesPair = (a === candidate && selected.includes(b)) || (b === candidate && selected.includes(a))
    return includesPair
  })
}

function calcAmount(
  baseAmount: number,
  spiceType: SpiceDefinition['type'],
  input: MarinadeInput,
  rng: RandomGenerator,
): number {
  const meatCoef = MEAT_COEFFICIENT[input.meat]
  const intensityCoef = INTENSITY_COEFFICIENT[input.intensity]
  const fatBaseCoef = FAT_GLOBAL_COEFFICIENT[input.fat]
  const randomCoef = randomBetween(0.9, 1.1, rng)

  let fatTypeCoef = 1
  if (input.fat === 'lean' && AROMATIC_TYPES.includes(spiceType)) {
    fatTypeCoef = FAT_TYPE_BOOSTS.leanAromaticBoost
  }
  if (input.fat === 'fatty' && BRIGHT_TYPES.includes(spiceType)) {
    fatTypeCoef = FAT_TYPE_BOOSTS.fattyBrightBoost
  }

  const spiceLevelCoef = 0.7 + input.spiceLevel / 10
  const hotCoef = spiceType === 'hot' ? spiceLevelCoef : 1

  const calculated = baseAmount * meatCoef * intensityCoef * fatBaseCoef * fatTypeCoef * hotCoef * randomCoef
  return Math.max(0.5, roundToHalf(calculated))
}

function makeIngredient(name: string, amountGrams: number): MarinadeIngredient {
  const label = SPICE_LABELS_RU[name] ?? name
  return {
    name: label,
    amount: formatAmount(amountGrams),
    amountGrams,
  }
}

function filterConflicts(input: MarinadeInput, selected: string[], amounts: Map<string, number>): string[] {
  let result = [...selected]

  // 1. Обработка HARD_CONFLICTS
  for (const [a, b] of HARD_CONFLICTS) {
    if (result.includes(a) && result.includes(b)) {
      const aPriority = getSpice(a)?.priority ?? 0
      const bPriority = getSpice(b)?.priority ?? 0
      const drop = aPriority >= bPriority ? b : a
      result = result.filter(name => name !== drop)
    }
  }

  // 2. Обработка HIGH_DOSE_CONFLICTS
  for (const [a, b] of HIGH_DOSE_CONFLICTS) {
    if (!result.includes(a) || !result.includes(b)) continue
    const aAmount = amounts.get(a) ?? 0
    const bAmount = amounts.get(b) ?? 0
    if (Math.max(aAmount, bAmount) < HIGH_DOSE_THRESHOLD) continue
    const aPriority = getSpice(a)?.priority ?? 0
    const bPriority = getSpice(b)?.priority ?? 0
    const drop = aPriority >= bPriority ? b : a
    result = result.filter(name => name !== drop)
  }

  if (input.meat === 'lamb') {
    return result.filter(name => name !== 'dill')
  }
  return result
}

function getCutNote(cutType: MarinadeInput['cutType']): string {
  if (cutType === 'steak') return 'Для стейков держите маринад мягче и без избытка кислоты.'
  if (cutType === 'ribs') return 'Для ребер можно увеличить время маринования на 1-2 часа.'
  return 'Для кубиков 4-5 см соблюдайте равномерное покрытие маринадом.'
}

function getAlcoholNote(pairing: MarinadeInput['alcoholPairing']): string {
  if (pairing === 'wine') return 'Под вино: добавьте щепотку тимьяна и сумаха.'
  if (pairing === 'beer') return 'Под пиво: усилите копченые ноты паприкой.'
  if (pairing === 'vodka') return 'Под крепкий алкоголь: держите баланс соли и остроты.'
  return 'Универсальный профиль без алкогольного акцента.'
}

function selectStyleSpices(input: MarinadeInput, selected: Set<string>, rng: RandomGenerator): string[] {
  const candidates = SPICE_DB.filter(spice => {
    if (!spice.styles.includes(input.style)) return false
    if (!spice.compatibleWith.includes(input.meat)) return false
    if ((COMPATIBILITY_TABLE[spice.name]?.[input.meat] ?? 0) <= 0) return false
    if (selected.has(spice.name)) return false
    if (hasHardConflict([...selected], spice.name, input.meat)) return false
    return true
  })

  const result: string[] = []
  const targetCount = Math.round(randomBetween(2, 4, rng))
  const pool = [...candidates]
  while (result.length < targetCount && pool.length > 0) {
    const picked = weightedPick(
      pool,
      spice => (COMPATIBILITY_TABLE[spice.name]?.[input.meat] ?? 0) * spice.priority,
      rng,
    )
    if (!picked) break
    result.push(picked.name)
    selected.add(picked.name)
    const idx = pool.findIndex(sp => sp.name === picked.name)
    if (idx >= 0) pool.splice(idx, 1)
  }

  return result
}
export function generateMarinadeRecipe(input: MarinadeInput, seed?: number): MarinadeRecipe {
  const rng = createSeededRandom(seed)
  const selected = new Set<string>()

  BASE_INGREDIENTS.forEach(item => selected.add(item.name))
  REQUIRED_SPICES_BY_MEAT[input.meat].forEach(spice => selected.add(spice))
  selectStyleSpices(input, selected, rng)

  const amountMap = new Map<string, number>()
  for (const name of selected) {
    // Специальная логика для базовых ингредиентов
    if (name === 'salt') {
      const saltPerKg = MEAT_RULES[input.meat].saltPerKg
      amountMap.set(name, roundToHalf(saltPerKg))
      continue
    }
    if (name === 'black_pepper') {
      if (input.spiceLevel === 0) {
        selected.delete(name)
        continue
      }
      // Линейная шкала: 5 = база, 10 = 2x база
      const pepperAmount = PEPPER_BASE_PER_KG * (input.spiceLevel / 5)
      amountMap.set(name, roundToHalf(pepperAmount))
      continue
    }
    if (name === 'onion') {
      const baseItem = BASE_INGREDIENTS.find(item => item.name === 'onion')
      const onionAmount = baseItem?.amount ?? 300
      amountMap.set(name, roundToHalf(onionAmount))
      continue
    }

    const spice = getSpice(name)
    if (!spice) continue
    amountMap.set(name, calcAmount(spice.baseAmount, spice.type, input, rng))
  }

  if (input.fat === 'fatty') {
    amountMap.set('lemon_juice', roundToHalf(30 * randomBetween(0.95, 1.05, rng)))
  }

  const styleSpicesAndRequired = [...selected].filter(name => !BASE_INGREDIENTS.find(item => item.name === name))
  const filteredSpices = filterConflicts(input, styleSpicesAndRequired, amountMap)
  const ingredientNames = [...BASE_INGREDIENTS.map(item => item.name),
  ...filteredSpices,
  ...(input.fat === 'fatty' ? ['lemon_juice'] : []),
  ]

  const ingredients = ingredientNames
    .filter((name, idx, arr) => arr.indexOf(name) === idx)
    .map(name => makeIngredient(name, amountMap.get(name) ?? 1))

  const marinadeTimeText = MARINADE_TIME_LABELS[input.marinadeTime]
  const recommendedTime = MEAT_RULES[input.meat].marinationTime
  const steps = [
    'Смешайте сухие специи в отдельной миске.',
    'Добавьте лук, соль и перец, затем вмешайте остальные ингредиенты.',
    `Маринуйте мясо ${marinadeTimeText} в холодильнике (рекомендуемое время для этого мяса: ${recommendedTime}).`,
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
      marinadeTimeText,
      cutNote: getCutNote(input.cutType),
      alcoholNote: getAlcoholNote(input.alcoholPairing),
      spiceLevel: input.spiceLevel,
      styleLabel: STYLE_LABELS[input.style],
    },
  }
}
