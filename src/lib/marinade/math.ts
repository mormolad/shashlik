export interface RandomGenerator {
  next: () => number
}

export function createSeededRandom(seed = Date.now()): RandomGenerator {
  let state = seed >>> 0
  return {
    next: () => {
      state = (1664525 * state + 1013904223) >>> 0
      return state / 0xffffffff
    },
  }
}

export function randomBetween(min: number, max: number, rng: RandomGenerator): number {
  return min + (max - min) * rng.next()
}

export function weightedPick<T>(items: T[], getWeight: (item: T) => number, rng: RandomGenerator): T | null {
  const weighted = items
    .map(item => ({ item, weight: Math.max(0, getWeight(item)) }))
    .filter(item => item.weight > 0)

  const total = weighted.reduce((sum, item) => sum + item.weight, 0)
  if (total <= 0) return null

  let cursor = randomBetween(0, total, rng)
  for (const entry of weighted) {
    cursor -= entry.weight
    if (cursor <= 0) return entry.item
  }
  return weighted[weighted.length - 1]?.item ?? null
}

export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2
}
