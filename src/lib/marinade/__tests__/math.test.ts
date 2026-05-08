import { describe, expect, it } from 'vitest'

import { createSeededRandom, randomBetween, roundToHalf, weightedPick } from '../math'

describe('roundToHalf', () => {
  it('rounds to nearest 0.5', () => {
    expect(roundToHalf(0)).toBe(0)
    expect(roundToHalf(0.24)).toBe(0)
    expect(roundToHalf(0.25)).toBe(0.5)
    expect(roundToHalf(0.74)).toBe(0.5)
    expect(roundToHalf(0.75)).toBe(1)
    expect(roundToHalf(1.249)).toBe(1)
    expect(roundToHalf(1.25)).toBe(1.5)
    expect(roundToHalf(3.7)).toBe(3.5)
  })

  it('handles negatives', () => {
    // Math.round(-0.5) === -0 in IEEE-754, so use closeTo for the boundary
    expect(roundToHalf(-0.25)).toBeCloseTo(0)
    expect(roundToHalf(-0.26)).toBe(-0.5)
    expect(roundToHalf(-1.5)).toBe(-1.5)
  })
})

describe('createSeededRandom', () => {
  it('produces deterministic sequence for the same seed', () => {
    const a = createSeededRandom(42)
    const b = createSeededRandom(42)
    const seqA = Array.from({ length: 5 }, () => a.next())
    const seqB = Array.from({ length: 5 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequence for different seeds', () => {
    const a = createSeededRandom(1)
    const b = createSeededRandom(2)
    expect(a.next()).not.toEqual(b.next())
  })

  it('returns numbers in [0, 1] range', () => {
    const rng = createSeededRandom(123)
    for (let i = 0; i < 50; i += 1) {
      const n = rng.next()
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(1)
    }
  })
})

describe('randomBetween', () => {
  it('stays within [min, max]', () => {
    const rng = createSeededRandom(7)
    for (let i = 0; i < 50; i += 1) {
      const n = randomBetween(2, 5, rng)
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(5)
    }
  })

  it('returns min when min === max', () => {
    const rng = createSeededRandom(7)
    expect(randomBetween(3, 3, rng)).toBe(3)
  })
})

describe('weightedPick', () => {
  it('returns null for empty list', () => {
    const rng = createSeededRandom(1)
    expect(weightedPick([], () => 1, rng)).toBeNull()
  })

  it('returns null when all weights are 0', () => {
    const rng = createSeededRandom(1)
    expect(weightedPick(['a', 'b'], () => 0, rng)).toBeNull()
  })

  it('always picks the only positive-weight item', () => {
    const rng = createSeededRandom(1)
    const items = ['a', 'b', 'c']
    for (let i = 0; i < 20; i += 1) {
      const picked = weightedPick(items, (item) => (item === 'b' ? 1 : 0), rng)
      expect(picked).toBe('b')
    }
  })

  it('respects relative weights over many runs', () => {
    let rng = createSeededRandom(1)
    const counts: Record<string, number> = { rare: 0, common: 0 }
    const items = ['rare', 'common']
    for (let i = 0; i < 1000; i += 1) {
      const picked = weightedPick(items, (it) => (it === 'rare' ? 1 : 9), rng)
      if (picked) counts[picked] += 1
      rng = createSeededRandom(i + 2)
    }
    expect(counts.common).toBeGreaterThan(counts.rare * 3)
  })
})
