import type { StyleProfile, StyleType } from '../types'

const CLASSIC_STEPS = [
  'recipe.steps.mixDry',
  'recipe.steps.combine',
  'recipe.steps.recommendedTime',
  'recipe.steps.dryBeforeGrill',
] as const

function styledSteps(style: StyleType): readonly string[] {
  if (style === 'classic') return CLASSIC_STEPS
  return [
    `recipe.steps.style.${style}.marinade`,
    `recipe.steps.style.${style}.layer`,
    'recipe.steps.recommendedTime',
    'recipe.steps.dryBeforeGrill',
  ] as const
}

function grillKeys(style: StyleType): readonly [string, string] {
  return [`recipe.grill.${style}.tip1`, `recipe.grill.${style}.tip2`]
}

/**
 * Профиль стиля v2: множитель доз, шаблон добора, якоря, шаги и советы по жарке (i18n-ключи).
 */
export const STYLE_PROFILES: Record<StyleType, StyleProfile> = {
  classic: {
    styleMultiplier: 1,
    marinadeTemplate: { extraPickRange: [2, 4] },
    anchors: [],
    stepKeys: CLASSIC_STEPS,
    grillTipKeys: ['recipe.grill.classic.tip1', 'recipe.grill.classic.tip2'],
  },
  caucasus: {
    styleMultiplier: 1.08,
    marinadeTemplate: { extraPickRange: [3, 5], requiredRoles: ['acid'] },
    anchors: [
      { id: 'khmeli_suneli', preference: 0.55 },
      { id: 'coriander', preference: 0.45 },
    ],
    stepKeys: styledSteps('caucasus'),
    grillTipKeys: grillKeys('caucasus'),
  },
  turkish: {
    styleMultiplier: 1.1,
    marinadeTemplate: { extraPickRange: [2, 4], requiredRoles: ['acid'] },
    anchors: [
      { id: 'sumac', preference: 0.85 },
      { id: 'mint', preference: 0.4 },
    ],
    stepKeys: styledSteps('turkish'),
    grillTipKeys: grillKeys('turkish'),
  },
  eastern: {
    styleMultiplier: 1.12,
    marinadeTemplate: { extraPickRange: [3, 5], requiredRoles: ['heat'] },
    anchors: [
      { id: 'turmeric', preference: 0.35 },
      { id: 'sumac', preference: 0.5 },
    ],
    stepKeys: styledSteps('eastern'),
    grillTipKeys: grillKeys('eastern'),
  },
  spicy: {
    styleMultiplier: 1.15,
    marinadeTemplate: { extraPickRange: [2, 5], requiredRoles: ['heat'] },
    anchors: [
      { id: 'chili', preference: 0.65 },
      { id: 'paprika', preference: 0.45 },
    ],
    stepKeys: styledSteps('spicy'),
    grillTipKeys: grillKeys('spicy'),
  },
  premium: {
    styleMultiplier: 1.05,
    marinadeTemplate: { extraPickRange: [2, 4] },
    anchors: [
      { id: 'rosemary', preference: 0.45 },
      { id: 'lemon_zest', preference: 0.5 },
    ],
    stepKeys: styledSteps('premium'),
    grillTipKeys: grillKeys('premium'),
  },
  herbal: {
    styleMultiplier: 1.06,
    marinadeTemplate: { extraPickRange: [3, 5], requiredRoles: ['herbal'] },
    anchors: [
      { id: 'thyme', preference: 0.45 },
      { id: 'dill', preference: 0.35 },
    ],
    stepKeys: styledSteps('herbal'),
    grillTipKeys: grillKeys('herbal'),
  },
  express: {
    styleMultiplier: 1.12,
    marinadeTemplate: { extraPickRange: [2, 3] },
    anchors: [
      { id: 'garlic', preference: 0.7 },
      { id: 'paprika', preference: 0.4 },
    ],
    stepKeys: styledSteps('express'),
    grillTipKeys: grillKeys('express'),
  },
}

export function getStyleProfile(style: StyleType): StyleProfile {
  return STYLE_PROFILES[style]
}
