import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_SELECTIONS } from './lib/marinade/defaults';
import { generateMarinadeRecipe } from './lib/marinade/generator';
import { GENERATION_DELAY_MS } from './lib/ui/timings';
import BackgroundVideo from './sections/BackgroundVideo';
import FireOverlay from './sections/FireOverlay';
import RecipeForm from './sections/RecipeForm';
import RecipeResult from './sections/RecipeResult';

import './styles/index.css';

import type { MarinadeInput, MarinadeRecipe } from './lib/marinade/types';
import type { AppState } from './types/app';

function App() {
  const { t } = useTranslation();
  const [selections, setSelections] = useState<MarinadeInput>(DEFAULT_SELECTIONS);
  const [appState, setAppState] = useState<AppState>('form');
  const [recipe, setRecipe] = useState<MarinadeRecipe | null>(null);

  const updateField = useCallback(
    <K extends keyof MarinadeInput>(category: K, value: MarinadeInput[K]) => {
      setSelections((prev) => ({ ...prev, [category]: value }));
    },
    [],
  );

  const onSelectMeat = useCallback(
    (value: MarinadeInput['meat']) => updateField('meat', value),
    [updateField],
  );
  const onSelectStyle = useCallback(
    (value: MarinadeInput['style']) => updateField('style', value),
    [updateField],
  );
  const onSelectIntensity = useCallback(
    (value: MarinadeInput['intensity']) => updateField('intensity', value),
    [updateField],
  );
  const onSelectFat = useCallback(
    (value: MarinadeInput['fat']) => updateField('fat', value),
    [updateField],
  );
  const onSelectSpiceLevel = useCallback(
    (value: number) => updateField('spiceLevel', value),
    [updateField],
  );

  const handleGenerate = useCallback(() => {
    const nextRecipe = generateMarinadeRecipe(selections);
    setRecipe(nextRecipe);
    setAppState('generating');
    setTimeout(() => {
      setAppState('result');
    }, GENERATION_DELAY_MS);
  }, [selections]);

  const handleReset = useCallback(() => {
    setSelections(DEFAULT_SELECTIONS);
    setRecipe(null);
    setAppState('form');
  }, []);

  const handleRandomize = useCallback(() => {
    const nextRecipe = generateMarinadeRecipe(selections);
    setRecipe(nextRecipe);
  }, [selections]);

  return (
    <div className="app-wrapper">
      <BackgroundVideo />

      <main className="content-container">
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
              <RecipeResult
                recipe={recipe}
                onReset={handleReset}
                onRandomize={handleRandomize}
                isGenerating={appState === 'generating'}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="site-footer">
          <div className="footer-signature">{t('footer.signature')}</div>
          <div className="footer-logo-centered">
            <img
              src="/PointPuls.svg"
              alt="PointPuls"
              className="footer-logo-img"
            />
          </div>
        </footer>
      </main>

      <FireOverlay visible={appState === 'generating'} />
    </div>
  );
}

export default App;
