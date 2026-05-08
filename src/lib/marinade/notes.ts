import type { AlcoholPairing, CutType } from './types'

const CUT_NOTES: Record<CutType, string> = {
  steak: 'Для стейков держите маринад мягче и без избытка кислоты.',
  ribs: 'Для ребер можно увеличить время маринования на 1-2 часа.',
  cube: 'Для кубиков 4-5 см соблюдайте равномерное покрытие маринадом.',
}

const ALCOHOL_NOTES: Record<AlcoholPairing, string> = {
  wine: 'Под вино: добавьте щепотку тимьяна и сумаха.',
  beer: 'Под пиво: усилите копченые ноты паприкой.',
  vodka: 'Под крепкий алкоголь: держите баланс соли и остроты.',
  none: 'Универсальный профиль без алкогольного акцента.',
}

export function getCutNote(cutType: CutType): string {
  return CUT_NOTES[cutType]
}

export function getAlcoholNote(pairing: AlcoholPairing): string {
  return ALCOHOL_NOTES[pairing]
}
