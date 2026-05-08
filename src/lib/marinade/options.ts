import type { FatType, IntensityType, MeatType, StyleType } from './types'

export const MEAT_VALUES: readonly MeatType[] = [
  'pork',
  'chicken',
  'beef',
  'lamb',
  'turkey',
] as const

export const STYLE_VALUES: readonly StyleType[] = [
  'classic',
  'caucasus',
  'turkish',
  'eastern',
  'spicy',
  'premium',
  'herbal',
  'express',
] as const

export const INTENSITY_VALUES: readonly IntensityType[] = ['light', 'medium', 'strong'] as const

export const FAT_VALUES: readonly FatType[] = ['lean', 'normal', 'fatty'] as const
