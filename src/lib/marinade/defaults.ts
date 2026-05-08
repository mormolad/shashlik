import type { MarinadeInput } from './types'

/** Стартовое состояние формы. Один источник правды для App + тестов. */
export const DEFAULT_SELECTIONS: MarinadeInput = {
  meat: 'pork',
  style: 'classic',
  intensity: 'medium',
  fat: 'normal',
  spiceLevel: 5,
  cutType: 'cube',
  alcoholPairing: 'none',
  marinadeTime: 'standard',
}
