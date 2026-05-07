import type { MarinadeRecipe } from '../lib/marinade/types'

export interface RecipeResultProps {
    recipe: MarinadeRecipe | null
    onReset: () => void
    onRandomize: () => void
    isGenerating: boolean
}
