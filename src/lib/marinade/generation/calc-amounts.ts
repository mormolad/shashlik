import { meatAffinityFor } from '../ingredients/catalog'
import { type RandomGenerator, randomBetween, roundToHalf } from '../math'
import {
  AROMATIC_TYPES,
  BRIGHT_TYPES,
  FAT_GLOBAL_COEFFICIENT,
  FAT_TYPE_BOOSTS,
  INTENSITY_COEFFICIENT,
  MEAT_COEFFICIENT,
  MIN_SPICE_AMOUNT_GRAMS,
  RANDOM_VARIANCE,
  SPICE_LEVEL_DIVISOR,
  SPICE_LEVEL_OFFSET,
} from '../rules'

import type { IngredientDefinition, MarinadeInput, SpiceType } from '../types'

/**
 * Возвращает массу специи в граммах с учётом всех доменных коэффициентов:
 * мясо × интенсивность × жирность × bonus за тип специи × коэффициент остроты × лёгкий рандом.
 */
export function calcSpiceAmount(
  baseAmount: number,
  spiceType: SpiceType,
  input: MarinadeInput,
  rng: RandomGenerator,
): number {
  const meatCoef = MEAT_COEFFICIENT[input.meat]
  const intensityCoef = INTENSITY_COEFFICIENT[input.intensity]
  const fatBaseCoef = FAT_GLOBAL_COEFFICIENT[input.fat]
  const randomCoef = randomBetween(RANDOM_VARIANCE[0], RANDOM_VARIANCE[1], rng)
  const fatTypeCoef = getFatTypeBoost(input.fat, spiceType)
  const hotCoef = spiceType === 'hot' ? getSpiceLevelCoef(input.spiceLevel) : 1

  const calculated =
    baseAmount * meatCoef * intensityCoef * fatBaseCoef * fatTypeCoef * hotCoef * randomCoef
  return Math.max(MIN_SPICE_AMOUNT_GRAMS, roundToHalf(calculated))
}

function getFatTypeBoost(
  fat: MarinadeInput['fat'],
  spiceType: SpiceType,
): number {
  if (fat === 'lean' && AROMATIC_TYPES.includes(spiceType)) {
    return FAT_TYPE_BOOSTS.leanAromaticBoost
  }
  if (fat === 'fatty' && BRIGHT_TYPES.includes(spiceType)) {
    return FAT_TYPE_BOOSTS.fattyBrightBoost
  }
  return 1
}

function getSpiceLevelCoef(spiceLevel: number): number {
  return SPICE_LEVEL_OFFSET + spiceLevel / SPICE_LEVEL_DIVISOR
}

/**
 * Граммы для позиции из каталога v2: середина dosePerKg × множитель стиля × meat affinity,
 * далее общий calcSpiceAmount (интенсивность, жирность, острота для hot).
 */
export function calcCatalogIngredientGrams(
  ing: IngredientDefinition,
  input: MarinadeInput,
  styleMultiplier: number,
  rng: RandomGenerator,
): number {
  const mid = (ing.dosePerKg[0] + ing.dosePerKg[1]) / 2
  const base = mid * styleMultiplier * meatAffinityFor(ing.id, input.meat)
  return calcSpiceAmount(base, ing.calcType, input, rng)
}
