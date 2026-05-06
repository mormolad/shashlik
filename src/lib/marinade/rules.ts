import type {
  FatType,
  IntensityType,
  MarinadeTimePreference,
  MeatType,
  NationalStyle,
  SpiceType,
  StyleType,
} from './types'

export const BASE_INGREDIENTS = [
  { name: 'salt', amount: 20, type: 'base' as SpiceType },
  { name: 'black_pepper', amount: 5, type: 'base' as SpiceType },
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
  smoky: 'Копченый',
}

export const MARINADE_TIME_LABELS: Record<MarinadeTimePreference, string> = {
  quick: '2-4 часа',
  standard: '6-8 часов',
  long: '10-12 часов',
}

export const NATIONAL_STYLE_BOOST: Record<NationalStyle, Partial<Record<StyleType, number>>> = {
  none: {},
  georgian: { caucasus: 1.25, herbal: 1.1 },
  armenian: { caucasus: 1.2, smoky: 1.1 },
  turkish: { turkish: 1.25, eastern: 1.1 },
  uzbek: { eastern: 1.25, classic: 1.05 },
}
