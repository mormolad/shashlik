import {
  type RandomGenerator,
  createSeededRandom,
  randomBetween,
  roundToHalf,
  weightedPick,
} from './math'
import {
  AROMATIC_TYPES,
  BASE_INGREDIENTS,
  BRIGHT_TYPES,
  FAT_GLOBAL_COEFFICIENT,
  FAT_TYPE_BOOSTS,
  HIGH_DOSE_THRESHOLD_GRAMS,
  INTENSITY_COEFFICIENT,
  LEMON_JUICE_BASE_GRAMS,
  LEMON_JUICE_VARIANCE,
  MARINADE_TIME_LABELS,
  MEAT_COEFFICIENT,
  MEAT_RULES,
  MIN_SPICE_AMOUNT_GRAMS,
  PEPPER_BASE_PER_KG,
  RANDOM_VARIANCE,
  REQUIRED_SPICES_BY_MEAT,
  SPICE_LEVEL_DIVISOR,
  SPICE_LEVEL_OFFSET,
  STYLE_LABELS,
  STYLE_SPICE_COUNT,
} from './rules'
import {
  COMPATIBILITY_TABLE,
  HARD_CONFLICTS,
  HIGH_DOSE_CONFLICTS,
  SPICE_DB,
  SPICE_LABELS_RU,
} from './spice-db'

import type {
  MarinadeIngredient,
  MarinadeInput,
  MarinadeRecipe,
  SpiceDefinition,
} from './types'

// Форматирование веса в строку с суффиксом "г"
function formatAmount(amountGrams: number): string {
  return `${amountGrams} г`
}

// Поиск определения специи в базе данных по имени
function getSpice(name: string): SpiceDefinition | undefined {
  return SPICE_DB.find((spice) => spice.name === name)
}

// Проверка на наличие жестких конфликтов между выбранными специями и кандидатом
// (правило "dill + lamb" уже описано в HARD_CONFLICTS, отдельный кейс не нужен)
function hasHardConflict(selected: string[], candidate: string): boolean {
  return HARD_CONFLICTS.some(
    ([a, b]) =>
      (a === candidate && selected.includes(b)) || (b === candidate && selected.includes(a)),
  )
}

// Основная функция расчета веса специи с учетом всех коэффициентов
function calcAmount(
  baseAmount: number,
  spiceType: SpiceDefinition['type'],
  input: MarinadeInput,
  rng: RandomGenerator,
): number {
  const meatCoef = MEAT_COEFFICIENT[input.meat]
  const intensityCoef = INTENSITY_COEFFICIENT[input.intensity]
  const fatBaseCoef = FAT_GLOBAL_COEFFICIENT[input.fat]
  const randomCoef = randomBetween(RANDOM_VARIANCE[0], RANDOM_VARIANCE[1], rng)

  let fatTypeCoef = 1
  // Постное мясо лучше раскрывает ароматные травы
  if (input.fat === 'lean' && AROMATIC_TYPES.includes(spiceType)) {
    fatTypeCoef = FAT_TYPE_BOOSTS.leanAromaticBoost
  }
  // Жирное мясо требует более ярких/кислотных специй
  if (input.fat === 'fatty' && BRIGHT_TYPES.includes(spiceType)) {
    fatTypeCoef = FAT_TYPE_BOOSTS.fattyBrightBoost
  }

  // Расчет влияния ползунка остроты (spiceLevel) только для hot-специй
  const spiceLevelCoef = SPICE_LEVEL_OFFSET + input.spiceLevel / SPICE_LEVEL_DIVISOR
  const hotCoef = spiceType === 'hot' ? spiceLevelCoef : 1

  const calculated =
    baseAmount * meatCoef * intensityCoef * fatBaseCoef * fatTypeCoef * hotCoef * randomCoef
  return Math.max(MIN_SPICE_AMOUNT_GRAMS, roundToHalf(calculated))
}

// Создание объекта ингредиента с локализованным именем
function makeIngredient(name: string, amountGrams: number): MarinadeIngredient {
  const label = SPICE_LABELS_RU[name] ?? name
  return {
    name: label,
    amount: formatAmount(amountGrams),
    amountGrams,
  }
}

// Фильтрация конфликтующих специй в финальном наборе
function filterConflicts(
  input: MarinadeInput,
  selected: string[],
  amounts: Map<string, number>,
): string[] {
  let result = [...selected]

  // 1. Удаление одного из участников жесткого конфликта (по приоритету)
  for (const [a, b] of HARD_CONFLICTS) {
    if (result.includes(a) && result.includes(b)) {
      const aPriority = getSpice(a)?.priority ?? 0
      const bPriority = getSpice(b)?.priority ?? 0
      const drop = aPriority >= bPriority ? b : a
      result = result.filter((name) => name !== drop)
    }
  }

  // 2. Удаление конфликтов при высоких дозировках
  for (const [a, b] of HIGH_DOSE_CONFLICTS) {
    if (!result.includes(a) || !result.includes(b)) continue
    const aAmount = amounts.get(a) ?? 0
    const bAmount = amounts.get(b) ?? 0
    if (Math.max(aAmount, bAmount) < HIGH_DOSE_THRESHOLD_GRAMS) continue
    const aPriority = getSpice(a)?.priority ?? 0
    const bPriority = getSpice(b)?.priority ?? 0
    const drop = aPriority >= bPriority ? b : a
    result = result.filter((name) => name !== drop)
  }

  // 3. Финальная страховка: укроп + баранина (правило также есть в HARD_CONFLICTS)
  if (input.meat === 'lamb') {
    return result.filter((name) => name !== 'dill')
  }
  return result
}

// Получение текстовой заметки в зависимости от типа нарезки
function getCutNote(cutType: MarinadeInput['cutType']): string {
  if (cutType === 'steak') return 'Для стейков держите маринад мягче и без избытка кислоты.'
  if (cutType === 'ribs') return 'Для ребер можно увеличить время маринования на 1-2 часа.'
  return 'Для кубиков 4-5 см соблюдайте равномерное покрытие маринадом.'
}

// Получение рекомендации по специям в зависимости от напитка
function getAlcoholNote(pairing: MarinadeInput['alcoholPairing']): string {
  if (pairing === 'wine') return 'Под вино: добавьте щепотку тимьяна и сумаха.'
  if (pairing === 'beer') return 'Под пиво: усилите копченые ноты паприкой.'
  if (pairing === 'vodka') return 'Под крепкий алкоголь: держите баланс соли и остроты.'
  return 'Универсальный профиль без алкогольного акцента.'
}

// Случайный подбор специй, подходящих под выбранный стиль и мясо
function selectStyleSpices(input: MarinadeInput, selected: Set<string>, rng: RandomGenerator): string[] {
  const candidates = SPICE_DB.filter((spice) => {
    if (!spice.styles.includes(input.style)) return false
    if (!spice.compatibleWith.includes(input.meat)) return false
    if ((COMPATIBILITY_TABLE[spice.name]?.[input.meat] ?? 0) <= 0) return false
    if (selected.has(spice.name)) return false
    if (hasHardConflict([...selected], spice.name)) return false
    return true
  })

  const result: string[] = []
  const targetCount = Math.round(randomBetween(STYLE_SPICE_COUNT[0], STYLE_SPICE_COUNT[1], rng))
  const pool = [...candidates]
  while (result.length < targetCount && pool.length > 0) {
    const picked = weightedPick(
      pool,
      (spice) => (COMPATIBILITY_TABLE[spice.name]?.[input.meat] ?? 0) * spice.priority,
      rng,
    )
    if (!picked) break
    result.push(picked.name)
    selected.add(picked.name)
    const idx = pool.findIndex((sp) => sp.name === picked.name)
    if (idx >= 0) pool.splice(idx, 1)
  }

  return result
}

// ГЛАВНАЯ ФУНКЦИЯ: Генерация полного рецепта
export function generateMarinadeRecipe(input: MarinadeInput, seed?: number): MarinadeRecipe {
  // Math.random() даёт лучшую дисперсию, чем Date.now() при быстрых повторных вызовах
  const effectiveSeed = seed ?? Math.floor(Math.random() * 0x7fffffff)
  const rng = createSeededRandom(effectiveSeed)
  const selected = new Set<string>()

  // 1. Базовые ингредиенты + обязательные для типа мяса
  BASE_INGREDIENTS.forEach((item) => selected.add(item.name))
  REQUIRED_SPICES_BY_MEAT[input.meat].forEach((spice) => selected.add(spice))
  // 2. Стилевые специи
  selectStyleSpices(input, selected, rng)

  const amountMap = new Map<string, number>()
  for (const name of selected) {
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
      const pepperAmount = PEPPER_BASE_PER_KG * (input.spiceLevel / 5)
      amountMap.set(name, roundToHalf(pepperAmount))
      continue
    }
    if (name === 'onion') {
      const baseItem = BASE_INGREDIENTS.find((item) => item.name === 'onion')
      const onionAmount = baseItem?.amount ?? 300
      amountMap.set(name, roundToHalf(onionAmount))
      continue
    }

    const spice = getSpice(name)
    if (!spice) continue
    amountMap.set(name, calcAmount(spice.baseAmount, spice.type, input, rng))
  }

  // 3. Лимонный сок для жирного мяса
  if (input.fat === 'fatty') {
    const variance = randomBetween(LEMON_JUICE_VARIANCE[0], LEMON_JUICE_VARIANCE[1], rng)
    amountMap.set('lemon_juice', roundToHalf(LEMON_JUICE_BASE_GRAMS * variance))
  }

  // 4. Фильтрация конфликтов
  const styleSpicesAndRequired = [...selected].filter(
    (name) => !BASE_INGREDIENTS.find((item) => item.name === name),
  )
  const filteredSpices = filterConflicts(input, styleSpicesAndRequired, amountMap)

  // Сборка финального списка имен ингредиентов
  const ingredientNames = [
    ...BASE_INGREDIENTS.map((item) => item.name),
    ...filteredSpices,
    ...(input.fat === 'fatty' ? ['lemon_juice'] : []),
  ]

  const ingredients = ingredientNames
    .filter((name, idx, arr) => arr.indexOf(name) === idx)
    .map((name) => makeIngredient(name, amountMap.get(name) ?? 1))

  // 5. Текстовые инструкции
  const marinadeTimeText = MARINADE_TIME_LABELS[input.marinadeTime]
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
      marinadeTimeText,
      cutNote: getCutNote(input.cutType),
      alcoholNote: getAlcoholNote(input.alcoholPairing),
      spiceLevel: input.spiceLevel,
      styleLabel: STYLE_LABELS[input.style],
    },
  }
}
