import { type RandomGenerator, randomBetween, weightedPick } from './math'
import { HIGH_DOSE_THRESHOLD_GRAMS, STYLE_SPICE_COUNT } from './rules'
import {
  COMPATIBILITY_TABLE,
  HARD_CONFLICTS,
  HIGH_DOSE_CONFLICTS,
  SPICE_DB,
} from './spice-db'

import type { MarinadeInput, SpiceDefinition } from './types'

function getSpice(name: string): SpiceDefinition | undefined {
  return SPICE_DB.find((spice) => spice.name === name)
}

function priorityOf(name: string): number {
  return getSpice(name)?.priority ?? 0
}

function hasHardConflict(selected: ReadonlySet<string>, candidate: string): boolean {
  return HARD_CONFLICTS.some(
    ([a, b]) =>
      (a === candidate && selected.has(b)) || (b === candidate && selected.has(a)),
  )
}

/**
 * Возвращает имя специи, которую нужно удалить из пары конфликта (с меньшим приоритетом),
 * либо null если конфликта нет.
 */
function lowerPriorityOf(a: string, b: string): string {
  return priorityOf(a) >= priorityOf(b) ? b : a
}

/**
 * Подбирает стилевые специи: фильтрует по стилю/мясу/совместимости,
 * затем взвешенно выбирает несколько (количество в STYLE_SPICE_COUNT).
 * Мутирует переданный `selected` (добавляет туда выбранные специи) — это
 * сделано осознанно: выбор должен сразу влиять на проверку конфликтов
 * следующих кандидатов.
 */
export function selectStyleSpices(
  input: MarinadeInput,
  selected: Set<string>,
  rng: RandomGenerator,
): string[] {
  const candidates = SPICE_DB.filter((spice) => {
    if (!spice.styles.includes(input.style)) return false
    if (!spice.compatibleWith.includes(input.meat)) return false
    if ((COMPATIBILITY_TABLE[spice.name]?.[input.meat] ?? 0) <= 0) return false
    if (selected.has(spice.name)) return false
    if (hasHardConflict(selected, spice.name)) return false
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

/**
 * Финальная фильтрация: убирает один элемент из каждой пары жёстких/высокодозных конфликтов.
 * Проходим единым reduce без промежуточных мутаций массива.
 */
export function filterConflicts(
  input: MarinadeInput,
  selected: readonly string[],
  amounts: ReadonlyMap<string, number>,
): string[] {
  const drop = new Set<string>()

  for (const [a, b] of HARD_CONFLICTS) {
    if (selected.includes(a) && selected.includes(b)) {
      drop.add(lowerPriorityOf(a, b))
    }
  }

  for (const [a, b] of HIGH_DOSE_CONFLICTS) {
    if (!selected.includes(a) || !selected.includes(b)) continue
    const max = Math.max(amounts.get(a) ?? 0, amounts.get(b) ?? 0)
    if (max < HIGH_DOSE_THRESHOLD_GRAMS) continue
    drop.add(lowerPriorityOf(a, b))
  }

  // Доп. страховка для баранины (правило также есть в HARD_CONFLICTS, но
  // оставляем явный фильтр — он защищает от случайного внесения dill вне HARD_CONFLICTS).
  if (input.meat === 'lamb') drop.add('dill')

  return selected.filter((name) => !drop.has(name))
}
