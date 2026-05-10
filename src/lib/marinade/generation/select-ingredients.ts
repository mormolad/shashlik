/**
 * v2: выбор ингредиентов по профилю стиля (якоря, роли, добор из пула).
 * Порядок: required по мясу → якоря (preference) → закрытие requiredRoles →
 * добор до extraPickRange → конфликты (жёсткие + высокая доза) + укроп/баранина.
 */
import { HARD_CONFLICTS } from '../conflicts/hard'
import { HIGH_DOSE_CONFLICTS } from '../conflicts/high-dose'
import { getIngredientById, meatAffinityFor, poolForStyleAndMeat } from '../ingredients/catalog'
import { type RandomGenerator, randomBetween, weightedPick } from '../math'
import { BASE_INGREDIENT_NAMES, HIGH_DOSE_THRESHOLD_GRAMS, REQUIRED_SPICES_BY_MEAT } from '../rules'
import { getStyleProfile } from '../styles/profiles'

import type { IngredientDefinition, IngredientRole, MarinadeInput } from '../types'

const BASE_SET = new Set<string>(BASE_INGREDIENT_NAMES)

/** Базовые ингредиенты считаем неприкосновенными — у них «бесконечный» приоритет. */
function priorityOf(id: string): number {
  if (BASE_SET.has(id)) return Number.POSITIVE_INFINITY
  return getIngredientById(id)?.priority ?? 0
}

function lowerPriorityOf(a: string, b: string): string {
  return priorityOf(a) >= priorityOf(b) ? b : a
}

function hasHardConflict(selected: ReadonlySet<string>, candidate: string): boolean {
  return HARD_CONFLICTS.some(
    ([x, y]) =>
      (x === candidate && selected.has(y)) || (y === candidate && selected.has(x)),
  )
}

export function filterIngredientConflicts(
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

  if (input.meat === 'lamb') drop.add('dill')

  return selected.filter((name) => !drop.has(name))
}

function hasRoleCoverage(selected: ReadonlySet<string>, role: IngredientRole): boolean {
  for (const id of selected) {
    const ing = getIngredientById(id)
    if (ing?.roles.includes(role)) return true
  }
  return false
}

function pickForRole(
  selected: Set<string>,
  pool: IngredientDefinition[],
  role: IngredientRole,
  meat: MarinadeInput['meat'],
  rng: RandomGenerator,
): boolean {
  const candidates = pool.filter(
    (c) =>
      c.roles.includes(role) &&
      !selected.has(c.id) &&
      !hasHardConflict(selected, c.id),
  )
  if (candidates.length === 0) return false
  const picked = weightedPick(
    candidates,
    (c) => Math.max(0.01, (c.compatibilityWeight[meat] ?? 0) * c.priority * meatAffinityFor(c.id, meat)),
    rng,
  )
  if (!picked) return false
  selected.add(picked.id)
  return true
}

function tryAnchors(
  selected: Set<string>,
  pool: IngredientDefinition[],
  input: MarinadeInput,
  rng: RandomGenerator,
): void {
  const profile = getStyleProfile(input.style)
  const poolIds = new Set(pool.map((p) => p.id))
  for (const anchor of profile.anchors) {
    if (rng.next() >= anchor.preference) continue
    if (!poolIds.has(anchor.id)) continue
    if (hasHardConflict(selected, anchor.id)) continue
    selected.add(anchor.id)
  }
}

/**
 * Возвращает id выбранных специй (без salt / black_pepper / onion).
 *
 * База участвует в проверке конфликтов через предзаполненный `selected`,
 * чтобы каталог не выдавал дубли вроде `red_onion` рядом с `onion`.
 */
export function selectCatalogIngredientIds(input: MarinadeInput, rng: RandomGenerator): string[] {
  const profile = getStyleProfile(input.style)
  const pool = poolForStyleAndMeat(input.style, input.meat)
  const selected = new Set<string>(BASE_SET)

  for (const id of REQUIRED_SPICES_BY_MEAT[input.meat]) {
    if (!getIngredientById(id)) continue
    if (hasHardConflict(selected, id)) continue
    selected.add(id)
  }

  tryAnchors(selected, pool, input, rng)

  for (const role of profile.marinadeTemplate.requiredRoles ?? []) {
    if (hasRoleCoverage(selected, role)) continue
    pickForRole(selected, pool, role, input.meat, rng)
  }

  const extraTarget = Math.round(
    randomBetween(profile.marinadeTemplate.extraPickRange[0], profile.marinadeTemplate.extraPickRange[1], rng),
  )
  // После required, якорей и закрытия ролей — добираем до +extraTarget позиций.
  // База в `selected` уже учтена в счёте, поэтому таргет считаем от неё.
  const targetSize = selected.size + extraTarget
  const poolList = [...pool]

  while (selected.size < targetSize && poolList.length > 0) {
    const available = poolList.filter((c) => !selected.has(c.id) && !hasHardConflict(selected, c.id))
    if (available.length === 0) break
    const picked = weightedPick(
      available,
      (c) =>
        Math.max(0.01, (c.compatibilityWeight[input.meat] ?? 0) * c.priority * meatAffinityFor(c.id, input.meat)),
      rng,
    )
    if (!picked) break
    selected.add(picked.id)
    const idx = poolList.findIndex((p) => p.id === picked.id)
    if (idx >= 0) poolList.splice(idx, 1)
  }

  return [...selected].filter((id) => !BASE_SET.has(id))
}
