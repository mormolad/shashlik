import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo from './sections/BackgroundVideo';
import RecipeForm from './sections/RecipeForm';
import RecipeResult from './sections/RecipeResult';
import FireOverlay from './sections/FireOverlay';
import './App.css';
import { generateMarinadeRecipe } from './lib/marinade/generator';
import type { MarinadeInput, MarinadeRecipe } from './lib/marinade/types';
import type { AppState } from './types/app';

const defaultSelections: MarinadeInput = {
  meat: 'pork',
  style: 'classic',
  intensity: 'medium',
  fat: 'normal',
  spiceLevel: 5,
  cutType: 'cube',
  alcoholPairing: 'none',
  marinadeTime: 'standard',
  nationalStyle: 'turkish',
};

function App() {
  const [selections, setSelections] =
    useState<MarinadeInput>(defaultSelections);
  const [appState, setAppState] = useState<AppState>('form');
  const [recipe, setRecipe] = useState<MarinadeRecipe | null>(null);

  const handleSelect = useCallback(
    <K extends keyof MarinadeInput>(category: K, value: MarinadeInput[K]) => {
      setSelections((prev) => ({ ...prev, [category]: value }));
    },
    [],
  );

  const handleGenerate = useCallback(() => {
    const nextRecipe = generateMarinadeRecipe(selections);
    setRecipe(nextRecipe);
    setAppState('generating');
    setTimeout(() => {
      setAppState('result');
    }, 1500);
  }, [selections]);

  const handleReset = useCallback(() => {
    setSelections(defaultSelections);
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
                onSelect={handleSelect}
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
          <div className="footer-signature">
            Разработано с любовью к шашлыкам и под патронажем
          </div>
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
