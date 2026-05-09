import { motion, AnimatePresence } from 'framer-motion'
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_SELECTIONS } from '../lib/marinade/defaults'
import { generateMarinadeRecipe } from '../lib/marinade/generation/generator'
import { appendRecipeToHistory } from '../lib/storage/recipeHistory'
import { GENERATION_DELAY_MS } from '../lib/ui/timings'
import RecipeForm from '../sections/RecipeForm'

import type { MarinadeInput, MarinadeRecipe } from '../lib/marinade/types'

type AppState = 'form' | 'generating' | 'result'

const FireOverlay = lazy(() => import('../sections/FireOverlay'))
const RecipeResult = lazy(() => import('../sections/RecipeResult'))

export default function HomePage() {
  const [selections, setSelections] = useState<MarinadeInput>(DEFAULT_SELECTIONS)
  const [appState, setAppState] = useState<AppState>('form')
  const [recipe, setRecipe] = useState<MarinadeRecipe | null>(null)
  const generationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (generationTimerRef.current !== null) {
        clearTimeout(generationTimerRef.current)
        generationTimerRef.current = null
      }
    }
  }, [])

  const updateField = useCallback(
    <K extends keyof MarinadeInput>(category: K, value: MarinadeInput[K]) => {
      setSelections((prev) => ({ ...prev, [category]: value }))
    },
    [],
  )

  const onSelectMeat = useCallback(
    (value: MarinadeInput['meat']) => updateField('meat', value),
    [updateField],
  )
  const onSelectStyle = useCallback(
    (value: MarinadeInput['style']) => updateField('style', value),
    [updateField],
  )
  const onSelectIntensity = useCallback(
    (value: MarinadeInput['intensity']) => updateField('intensity', value),
    [updateField],
  )
  const onSelectFat = useCallback(
    (value: MarinadeInput['fat']) => updateField('fat', value),
    [updateField],
  )
  const onSelectSpiceLevel = useCallback(
    (value: number) => updateField('spiceLevel', value),
    [updateField],
  )

  const handleGenerate = useCallback(() => {
    const nextRecipe = generateMarinadeRecipe(selections)
    setRecipe(nextRecipe)
    setAppState('generating')
    if (generationTimerRef.current !== null) {
      clearTimeout(generationTimerRef.current)
    }
    generationTimerRef.current = setTimeout(() => {
      generationTimerRef.current = null
      if (!isMountedRef.current) return
      setAppState('result')
      appendRecipeToHistory(nextRecipe)
    }, GENERATION_DELAY_MS)
  }, [selections])

  const handleReset = useCallback(() => {
    setSelections(DEFAULT_SELECTIONS)
    setRecipe(null)
    setAppState('form')
  }, [])

  const handleRandomize = useCallback(() => {
    const nextRecipe = generateMarinadeRecipe(selections)
    setRecipe(nextRecipe)
    appendRecipeToHistory(nextRecipe)
  }, [selections])

  return (
    <>
      <AnimatePresence mode="wait">
        {appState === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeIn' }}
          >
            <RecipeForm
              selections={selections}
              onSelectMeat={onSelectMeat}
              onSelectStyle={onSelectStyle}
              onSelectIntensity={onSelectIntensity}
              onSelectFat={onSelectFat}
              onSelectSpiceLevel={onSelectSpiceLevel}
              onGenerate={handleGenerate}
            />
          </motion.div>
        )}

        {(appState === 'generating' || appState === 'result') && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<div className="lazy-route-placeholder" />}>
              <RecipeResult
                recipe={recipe}
                onReset={handleReset}
                onRandomize={handleRandomize}
                isGenerating={appState === 'generating'}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <FireOverlay visible={appState === 'generating'} />
      </Suspense>
    </>
  )
}
