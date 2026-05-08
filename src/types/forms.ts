import type { ComponentType } from 'react'

import type {
  FatType,
  IntensityType,
  MarinadeInput,
  MeatType,
  StyleType,
} from '../lib/marinade/types'

export interface RecipeFormProps {
  selections: MarinadeInput
  onSelectMeat: (value: MeatType) => void
  onSelectStyle: (value: StyleType) => void
  onSelectIntensity: (value: IntensityType) => void
  onSelectFat: (value: FatType) => void
  onSelectSpiceLevel: (value: number) => void
  onGenerate: () => void
}

export interface SelectCardProps {
  selected: boolean
  onClick: () => void
  label: string
  hint: string
  Icon?: ComponentType
  index: number
}
