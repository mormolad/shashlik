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

// Порог веса специи, после которого проверяются конфликты высоких доз
const HIGH_DOSE_THRESHOLD = 4

// Форматирование веса в строку с суффиксом "г"
function formatAmount(amountGrams: number): string {
  return `${amountGrams} г`
}

// Поиск определения специи в базе данных по имени
function getSpice(name: string): SpiceDefinition | undefined {
  return SPICE_DB.find(spice => spice.name === name)
}

// Проверка на наличие жестких конфликтов между выбранными специями и кандидатом
function hasHardConflict(selected: string[], candidate: string, meat: MarinadeInput['meat']): boolean {
  // Укроп и баранина — классический запрет
  if (candidate === 'dill' && meat === 'lamb') return true
  // Проверка пар из таблицы HARD_CONFLICTS
  return HARD_CONFLICTS.some(([a, b]) => {
    const includesPair = (a === candidate && selected.includes(b)) || (b === candidate && selected.includes(a))
    return includesPair
  })
}

// Основная функция расчета веса специи с учетом всех коэффициентов
function calcAmount(
  baseAmount: number,
  spiceType: SpiceDefinition['type'],
  input: MarinadeInput,
  rng: RandomGenerator,
): number {
  const meatCoef = MEAT_COEFFICIENT[input.meat] // Коэффициент типа мяса
  const intensityCoef = INTENSITY_COEFFICIENT[input.intensity] // Общая интенсивность маринада
  const fatBaseCoef = FAT_GLOBAL_COEFFICIENT[input.fat] // Влияние жирности мяса
  const randomCoef = randomBetween(0.9, 1.1, rng) // Небольшой рандом для уникальности

  let fatTypeCoef = 1
  // Постное мясо лучше раскрывает ароматные травы
  if (input.fat === 'lean' && AROMATIC_TYPES.includes(spiceType)) {
    fatTypeCoef = FAT_TYPE_BOOSTS.leanAromaticBoost
  }
  // Жирное мясо требует более ярких/кислотных специй
  if (input.fat === 'fatty' && BRIGHT_TYPES.includes(spiceType)) {
    fatTypeCoef = FAT_TYPE_BOOSTS.fattyBrightBoost
  }

  // Расчет влияния ползунка остроты (spiceLevel)
  const spiceLevelCoef = 0.7 + input.spiceLevel / 10
  const hotCoef = spiceType === 'hot' ? spiceLevelCoef : 1

  // Итоговая формула веса
  const calculated = baseAmount * meatCoef * intensityCoef * fatBaseCoef * fatTypeCoef * hotCoef * randomCoef
  // Минимум 0.5г, округление до 0.5
  return Math.max(0.5, roundToHalf(calculated))
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
function filterConflicts(input: MarinadeInput, selected: string[], amounts: Map<string, number>): string[] {
  let result = [...selected]

  // 1. Удаление одного из участников жесткого конфликта (по приоритету)
  for (const [a, b] of HARD_CONFLICTS) {
    if (result.includes(a) && result.includes(b)) {
      const aPriority = getSpice(a)?.priority ?? 0
      const bPriority = getSpice(b)?.priority ?? 0
      const drop = aPriority >= bPriority ? b : a
      result = result.filter(name => name !== drop)
    }
  }

  // 2. Удаление конфликтов при высоких дозировках (например, две сильные специи вместе)
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

  // 3. Финальная проверка на баранину и укроп
  if (input.meat === 'lamb') {
    return result.filter(name => name !== 'dill')
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
  const candidates = SPICE_DB.filter(spice => {
    if (!spice.styles.includes(input.style)) return false // Проверка стиля
    if (!spice.compatibleWith.includes(input.meat)) return false // Совместимость с мясом
    if ((COMPATIBILITY_TABLE[spice.name]?.[input.meat] ?? 0) <= 0) return false // Таблица совместимости
    if (selected.has(spice.name)) return false // Уже выбрана
    if (hasHardConflict([...selected], spice.name, input.meat)) return false // Конфликты
    return true
  })

  const result: string[] = []
  const targetCount = Math.round(randomBetween(2, 4, rng)) // Количество дополнительных специй
  const pool = [...candidates]
  while (result.length < targetCount && pool.length > 0) {
    // Взвешенный выбор на основе приоритета и совместимости
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

// ГЛАВНАЯ ФУНКЦИЯ: Генерация полного рецепта
export function generateMarinadeRecipe(input: MarinadeInput, seed?: number): MarinadeRecipe {
  const rng = createSeededRandom(seed) // Инициализация генератора случайных чисел
  const selected = new Set<string>()

  // 1. Добавляем базу (соль, перец, лук) и обязательные специи для этого мяса
  BASE_INGREDIENTS.forEach(item => selected.add(item.name))
  REQUIRED_SPICES_BY_MEAT[input.meat].forEach(spice => selected.add(spice))
  // 2. Добавляем специи по стилю
  selectStyleSpices(input, selected, rng)

  const amountMap = new Map<string, number>()
  for (const name of selected) {
    // 3. Специальная логика для базовых ингредиентов (соль по мясу, перец по остроте)
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
      // Линейная шкала перца: 5 = база, 10 = двойная база
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

    // 4. Расчет веса для остальных специй
    const spice = getSpice(name)
    if (!spice) continue
    amountMap.set(name, calcAmount(spice.baseAmount, spice.type, input, rng))
  }

  // 5. Добавление лимонного сока для жирного мяса
  if (input.fat === 'fatty') {
    amountMap.set('lemon_juice', roundToHalf(30 * randomBetween(0.95, 1.05, rng)))
  }

  // 6. Фильтрация конфликтов среди выбранных специй
  const styleSpicesAndRequired = [...selected].filter(name => !BASE_INGREDIENTS.find(item => item.name === name))
  const filteredSpices = filterConflicts(input, styleSpicesAndRequired, amountMap)

  // Сборка финального списка имен ингредиентов
  const ingredientNames = [
    ...BASE_INGREDIENTS.map(item => item.name),
    ...filteredSpices,
    ...(input.fat === 'fatty' ? ['lemon_juice'] : []),
  ]

  // Преобразование имен в объекты с весом и локализацией
  const ingredients = ingredientNames
    .filter((name, idx, arr) => arr.indexOf(name) === idx)
    .map(name => makeIngredient(name, amountMap.get(name) ?? 1))

  // 7. Подготовка текстовых инструкций
  const marinadeTimeText = MARINADE_TIME_LABELS[input.marinadeTime]
  const recommendedTime = MEAT_RULES[input.meat].marinationTime
  const steps = [
    'Смешайте сухие специи в отдельной миске.',
    'Добавьте лук, соль и перец, затем вмешайте остальные ингредиенты.',
    `Рекомендуемое время маринования для этого мяса: ${recommendedTime}.`,
    'Перед жаркой уберите излишки маринада и обсушите мясо.',
  ]

  // Возврат готового объекта рецепта
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
