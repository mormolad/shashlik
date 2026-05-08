import { describe, expect, it } from 'vitest'

import { generateMarinadeRecipe } from '../generator'
import { REQUIRED_SPICES_BY_MEAT } from '../rules'
import { HARD_CONFLICTS, SPICE_LABELS_RU } from '../spice-db'

import type { MarinadeInput, MeatType } from '../types'

const baseInput: MarinadeInput = {
  meat: 'pork',
  style: 'classic',
  intensity: 'medium',
  fat: 'normal',
  marinadeTime: 'standard',
  cutType: 'cube',
  alcoholPairing: 'none',
  spiceLevel: 5,
}

function ingredientNames(input: MarinadeInput, seed: number): string[] {
  const recipe = generateMarinadeRecipe(input, seed)
  // Назад из RU-лейбла в имя из SPICE_DB (через обратный словарь),
  // плюс добавляем имя как есть, если не нашли (например, для unrecognized).
  const reverse = Object.fromEntries(
    Object.entries(SPICE_LABELS_RU).map(([k, v]) => [v, k]),
  )
  return recipe.ingredients.map((ing) => reverse[ing.name] ?? ing.name)
}

describe('generateMarinadeRecipe', () => {
  it('is deterministic for the same input + seed', () => {
    const a = generateMarinadeRecipe(baseInput, 12345)
    const b = generateMarinadeRecipe(baseInput, 12345)
    expect(a).toEqual(b)
  })

  it('produces different recipes for different seeds (most of the time)', () => {
    const a = generateMarinadeRecipe(baseInput, 1)
    const b = generateMarinadeRecipe(baseInput, 999_999)
    expect(a).not.toEqual(b)
  })

  it('always includes salt and onion (base ingredients)', () => {
    for (const meat of ['pork', 'lamb', 'chicken', 'beef', 'turkey'] as MeatType[]) {
      const names = ingredientNames({ ...baseInput, meat }, 42)
      expect(names).toContain('salt')
      expect(names).toContain('onion')
    }
  })

  it('omits black_pepper when spiceLevel is 0', () => {
    const names = ingredientNames({ ...baseInput, spiceLevel: 0 }, 42)
    expect(names).not.toContain('black_pepper')
  })

  it('includes required spices for each meat (most of the time)', () => {
    // Required-специи добавляются в `selected` ДО фильтрации конфликтов,
    // но фильтр может их выкинуть в пользу выше-приоритетной — это редкий
    // случай, поэтому проверяем "встречается хотя бы раз на 5 сидов".
    for (const meat of Object.keys(REQUIRED_SPICES_BY_MEAT) as MeatType[]) {
      const required = REQUIRED_SPICES_BY_MEAT[meat]
      for (const spice of required) {
        let found = false
        for (let seed = 1; seed <= 5; seed += 1) {
          const names = ingredientNames({ ...baseInput, meat }, seed)
          if (names.includes(spice)) {
            found = true
            break
          }
        }
        expect(found, `${meat} should include ${spice} for at least one of seeds 1..5`).toBe(true)
      }
    }
  })

  it('never produces hard-conflict pairs together', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      for (const meat of ['pork', 'lamb', 'chicken', 'beef', 'turkey'] as MeatType[]) {
        const names = ingredientNames({ ...baseInput, meat }, seed)
        for (const [a, b] of HARD_CONFLICTS) {
          const both = names.includes(a) && names.includes(b)
          expect(both, `seed=${seed} meat=${meat} produced ${a}+${b}`).toBe(false)
        }
      }
    }
  })

  it('never produces dill for lamb', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const names = ingredientNames({ ...baseInput, meat: 'lamb' }, seed)
      expect(names).not.toContain('dill')
    }
  })

  it('adds lemon_juice for fatty meat', () => {
    const names = ingredientNames({ ...baseInput, fat: 'fatty' }, 42)
    expect(names).toContain('lemon_juice')
  })

  it('does not add lemon_juice for non-fatty meat', () => {
    for (const fat of ['lean', 'normal'] as const) {
      const names = ingredientNames({ ...baseInput, fat }, 42)
      expect(names).not.toContain('lemon_juice')
    }
  })

  it('returns positive amounts for all ingredients', () => {
    const recipe = generateMarinadeRecipe(baseInput, 42)
    for (const ing of recipe.ingredients) {
      expect(ing.amountGrams).toBeGreaterThan(0)
    }
  })

  it('returns the expected style label', () => {
    const recipe = generateMarinadeRecipe({ ...baseInput, style: 'caucasus' }, 1)
    expect(recipe.meta.styleLabel).toBe('Кавказский')
  })

  it('returns 4 step instructions', () => {
    const recipe = generateMarinadeRecipe(baseInput, 1)
    expect(recipe.steps).toHaveLength(4)
  })
})
