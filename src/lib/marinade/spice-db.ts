import type { MeatType, SpiceDefinition } from './types'

export const SPICE_DB: SpiceDefinition[] = [
  { name: 'cumin', baseAmount: 3, type: 'warm', styles: ['caucasus', 'turkish', 'eastern'], compatibleWith: ['lamb', 'beef', 'pork'], priority: 5 },
  { name: 'coriander', baseAmount: 3, type: 'warm', styles: ['classic', 'caucasus', 'eastern', 'premium'], compatibleWith: ['chicken', 'pork', 'beef', 'lamb', 'turkey'], priority: 5 },
  { name: 'paprika', baseAmount: 4, type: 'smoky', styles: ['classic', 'spicy', 'express'], compatibleWith: ['chicken', 'pork', 'beef', 'turkey'], priority: 4 },
  { name: 'smoked_paprika', baseAmount: 3, type: 'smoky', styles: ['spicy', 'premium', 'express'], compatibleWith: ['chicken', 'pork', 'beef', 'lamb'], priority: 4 },
  { name: 'garlic', baseAmount: 5, type: 'fresh', styles: ['classic', 'caucasus', 'turkish', 'spicy', 'herbal', 'express'], compatibleWith: ['chicken', 'pork', 'beef', 'lamb', 'turkey'], priority: 5 },
  { name: 'basil', baseAmount: 2.5, type: 'herb', styles: ['herbal', 'premium', 'turkish'], compatibleWith: ['chicken', 'pork', 'turkey'], priority: 3 },
  { name: 'mint', baseAmount: 2, type: 'fresh', styles: ['eastern', 'turkish', 'herbal'], compatibleWith: ['lamb', 'chicken'], priority: 3 },
  { name: 'rosemary', baseAmount: 2, type: 'herb', styles: ['premium', 'classic', ], compatibleWith: ['pork', 'beef', 'lamb', 'turkey'], priority: 3 },
  { name: 'dill', baseAmount: 2.5, type: 'herb', styles: ['classic', 'herbal'], compatibleWith: ['chicken', 'pork', 'turkey'], priority: 2 },
  { name: 'chili', baseAmount: 2, type: 'hot', styles: ['spicy', 'eastern', ], compatibleWith: ['chicken', 'pork', 'beef', 'lamb', 'turkey'], priority: 4 },
  { name: 'sumac', baseAmount: 3, type: 'acid', styles: ['caucasus', 'eastern', 'turkish'], compatibleWith: ['chicken', 'pork', 'beef', 'lamb'], priority: 4 },
  { name: 'thyme', baseAmount: 2, type: 'herb', styles: ['premium', 'classic', 'herbal'], compatibleWith: ['chicken', 'pork', 'beef', 'turkey'], priority: 3 },
  { name: 'oregano', baseAmount: 2, type: 'herb', styles: ['classic', 'turkish', 'herbal'], compatibleWith: ['chicken', 'pork', 'beef', 'turkey'], priority: 3 },
  { name: 'turmeric', baseAmount: 2, type: 'warm', styles: ['eastern', 'spicy'], compatibleWith: ['chicken', 'pork', 'turkey'], priority: 2 },
  { name: 'mustard_seed', baseAmount: 2.5, type: 'warm', styles: ['classic', 'premium',], compatibleWith: ['chicken', 'pork', 'beef'], priority: 2 },
  { name: 'curry', baseAmount: 3, type: 'warm', styles: ['eastern', 'spicy'], compatibleWith: ['chicken', 'pork', 'turkey'], priority: 2 },
  { name: 'lemon_zest', baseAmount: 4, type: 'acid', styles: ['premium', 'herbal', 'turkish'], compatibleWith: ['chicken', 'pork', 'turkey'], priority: 2 },
  { name: 'khmeli_suneli', baseAmount: 4, type: 'warm', styles: ['caucasus', 'eastern'], compatibleWith: ['chicken', 'pork', 'beef', 'lamb', 'turkey'], priority: 5 },
  { name: 'utskho_suneli', baseAmount: 3, type: 'warm', styles: ['caucasus', 'eastern'], compatibleWith: ['chicken', 'pork', 'beef', 'lamb', 'turkey'], priority: 5 },
]

export const COMPATIBILITY_TABLE: Record<string, Record<MeatType, number>> = {
  cumin: { chicken: 2, pork: 3, beef: 4, lamb: 5, turkey: 2 },
  coriander: { chicken: 4, pork: 4, beef: 4, lamb: 5, turkey: 4 },
  paprika: { chicken: 4, pork: 5, beef: 4, lamb: 2, turkey: 4 },
  smoked_paprika: { chicken: 3, pork: 5, beef: 4, lamb: 2, turkey: 3 },
  garlic: { chicken: 5, pork: 5, beef: 4, lamb: 4, turkey: 5 },
  basil: { chicken: 5, pork: 3, beef: 2, lamb: 2, turkey: 5 },
  mint: { chicken: 1, pork: 0, beef: 1, lamb: 5, turkey: 1 },
  rosemary: { chicken: 3, pork: 4, beef: 4, lamb: 4, turkey: 3 },
  dill: { chicken: 4, pork: 3, beef: 1, lamb: 0, turkey: 4 },
  chili: { chicken: 4, pork: 4, beef: 4, lamb: 4, turkey: 4 },
  sumac: { chicken: 4, pork: 3, beef: 4, lamb: 5, turkey: 3 },
  thyme: { chicken: 4, pork: 4, beef: 4, lamb: 3, turkey: 4 },
  oregano: { chicken: 4, pork: 4, beef: 3, lamb: 2, turkey: 4 },
  turmeric: { chicken: 4, pork: 3, beef: 2, lamb: 1, turkey: 4 },
  mustard_seed: { chicken: 3, pork: 4, beef: 4, lamb: 2, turkey: 3 },
  curry: { chicken: 4, pork: 2, beef: 1, lamb: 1, turkey: 4 },
  lemon_zest: { chicken: 4, pork: 3, beef: 2, lamb: 2, turkey: 4 },
  khmeli_suneli: { chicken: 4, pork: 4, beef: 4, lamb: 4, turkey: 4 },
  utskho_suneli: { chicken: 4, pork: 3, beef: 4, lamb: 5, turkey: 4 },

}

export const HARD_CONFLICTS: Array<[string, string]> = [
  ['curry', 'rosemary'],
  ['mint', 'smoked_paprika'],
  ['dill', 'lamb'],
  ['khmeli_suneli', 'utskho_suneli'],
]

export const HIGH_DOSE_CONFLICTS: Array<[string, string]> = [
  ['basil', 'cumin'],
]

/**
 * Все известные имена ингредиентов (база + специи + lemon_juice).
 * Используется как whitelist для i18n-ключей `recipe.spice.${name}`.
 */
export const ALL_INGREDIENT_NAMES = [
  'salt',
  'black_pepper',
  'onion',
  'lemon_juice',
  ...SPICE_DB.map((s) => s.name),
] as const
