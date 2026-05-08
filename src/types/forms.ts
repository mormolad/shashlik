import type { MarinadeInput } from '../lib/marinade/types'
import type { ComponentType } from 'react'


export interface RecipeFormProps {
  selections: MarinadeInput
  onSelect: <K extends keyof MarinadeInput>(category: K, value: MarinadeInput[K]) => void
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
