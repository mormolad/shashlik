export type MeatType = 'chicken' | 'pork' | 'beef' | 'lamb' | 'turkey'
export type StyleType =
  | 'classic'
  | 'caucasus'
  | 'turkish'
  | 'eastern'
  | 'spicy'
  | 'premium'
  | 'herbal'
  | 'express'
export type IntensityType = 'light' | 'medium' | 'strong'
export type FatType = 'lean' | 'normal' | 'fatty'

export type MarinadeTimePreference = 'quick' | 'standard' | 'long'
export type CutType = 'cube' | 'steak' | 'ribs'
export type AlcoholPairing = 'none' | 'wine' | 'beer' | 'vodka'

export type SpiceType = 'base' | 'warm' | 'fresh' | 'hot' | 'smoky' | 'acid' | 'herb'

export interface MarinadeInput {
  meat: MeatType
  style: StyleType
  intensity: IntensityType
  fat: FatType
  marinadeTime: MarinadeTimePreference
  cutType: CutType
  alcoholPairing: AlcoholPairing
  spiceLevel: number
}

export interface SpiceDefinition {
  name: string
  baseAmount: number
  type: SpiceType
  styles: StyleType[]
  compatibleWith: MeatType[]
  priority: number
}

export interface MarinadeIngredient {
  name: string
  amount: string
  amountGrams: number
}

export interface MarinadeMeta {
  marinadeTimeText: string
  cutNote: string
  alcoholNote: string
  spiceLevel: number
  styleLabel: string
}

export interface MarinadeRecipe {
  meat: MeatType
  style: StyleType
  intensity: IntensityType
  fat: FatType
  ingredients: MarinadeIngredient[]
  steps: string[]
  meta: MarinadeMeta
}
