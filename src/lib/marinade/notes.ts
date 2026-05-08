import type { AlcoholPairing, CutType } from './types'

const CUT_NOTE_KEYS: Record<CutType, string> = {
  steak: 'recipe.notes.cut.steak',
  ribs: 'recipe.notes.cut.ribs',
  cube: 'recipe.notes.cut.cube',
}

const ALCOHOL_NOTE_KEYS: Record<AlcoholPairing, string> = {
  wine: 'recipe.notes.alcohol.wine',
  beer: 'recipe.notes.alcohol.beer',
  vodka: 'recipe.notes.alcohol.vodka',
  none: 'recipe.notes.alcohol.none',
}

export function getCutNoteKey(cutType: CutType): string {
  return CUT_NOTE_KEYS[cutType]
}

export function getAlcoholNoteKey(pairing: AlcoholPairing): string {
  return ALCOHOL_NOTE_KEYS[pairing]
}
