import type {
  FatType,
  IntensityType,
  MarinadeTimePreference,
  MeatType,

  SpiceType,
  StyleType,
} from './types'

export const MEAT_RULES: Record<MeatType, { saltPerKg: number; marinationTime: string }> = {
  pork: { saltPerKg: 10, marinationTime: '6-8 часов' },
  lamb: { saltPerKg: 14, marinationTime: '8-10 часов' },
  chicken: { saltPerKg: 9, marinationTime: '2-4 часа' },
  beef: { saltPerKg: 12, marinationTime: '10-12 часов' },
  turkey: { saltPerKg: 10, marinationTime: '4-6 часов' },
}

export const PEPPER_BASE_PER_KG = 2

export const BASE_INGREDIENTS = [
  { name: 'salt', amount: 10, type: 'base' as SpiceType },
  { name: 'black_pepper', amount: 2, type: 'base' as SpiceType },
  { name: 'onion', amount: 300, type: 'base' as SpiceType },
]

export const REQUIRED_SPICES_BY_MEAT: Record<MeatType, string[]> = {
  lamb: ['cumin', 'coriander'],
  chicken: ['garlic'],
  pork: ['paprika'],
  beef: ['coriander'],
  turkey: ['garlic', 'basil'],
}

export const MEAT_COEFFICIENT: Record<MeatType, number> = {
  chicken: 1,
  pork: 1.1,
  beef: 0.84,
  lamb: 1.5,
  turkey: 0.95,
}

export const INTENSITY_COEFFICIENT: Record<IntensityType, number> = {
  light: 0.8,
  medium: 1,
  strong: 1.3,
}

export const FAT_GLOBAL_COEFFICIENT: Record<FatType, number> = {
  lean: 1,
  normal: 1,
  fatty: 1,
}

export const AROMATIC_TYPES: SpiceType[] = ['warm', 'fresh', 'herb']
export const BRIGHT_TYPES: SpiceType[] = ['hot', 'smoky', 'acid']

export const FAT_TYPE_BOOSTS = {
  leanAromaticBoost: 1.2,
  fattyBrightBoost: 1.25,
}

export const STYLE_LABELS: Record<StyleType, string> = {
  classic: 'Классический',
  caucasus: 'Кавказский',
  turkish: 'Турецкий',
  eastern: 'Восточный',
  spicy: 'Острый',
  premium: 'Премиальный',
  herbal: 'Травяной',
}

export const MARINADE_TIME_LABELS: Record<MarinadeTimePreference, string> = {
  quick: '2-4 часа',
  standard: '6-8 часов',
  long: '10-12 часов',
}
