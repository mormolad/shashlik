import { motion } from 'framer-motion'
import { memo, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'

import {
  MeatIcon,
  ChickenIcon,
  BeefIcon,
  LambIcon,
  TurkeyIcon,
} from '../components/icons/MeatIcons'

import type {
  FatType,
  IntensityType,
  MeatType,
  StyleType,
} from '../lib/marinade/types'
import type { RecipeFormProps, SelectCardProps } from '../types/forms'

// --- Card Option Data ---

const meatOptions: { value: MeatType; Icon: ComponentType }[] = [
  { value: 'pork', Icon: MeatIcon },
  { value: 'chicken', Icon: ChickenIcon },
  { value: 'beef', Icon: BeefIcon },
  { value: 'lamb', Icon: LambIcon },
  { value: 'turkey', Icon: TurkeyIcon },
]

const styleOptions: { value: StyleType }[] = [
  { value: 'classic' },
  { value: 'caucasus' },
  { value: 'turkish' },
  { value: 'eastern' },
  { value: 'spicy' },
  { value: 'premium' },
  { value: 'herbal' },
  { value: 'express' },
]

const intensityOptions: { value: IntensityType }[] = [
  { value: 'light' },
  { value: 'medium' },
  { value: 'strong' },
]

const fatOptions: { value: FatType }[] = [
  { value: 'lean' },
  { value: 'normal' },
  { value: 'fatty' },
]

// --- SelectCard Component ---

const SelectCard = memo(function SelectCard({ selected, onClick, label, hint, Icon, index }: SelectCardProps) {
  return (
    <motion.button
      className={`select-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      whileTap={{ scale: 0.97 }}
      type="button"
    >
      {Icon && (
        <div className="select-card-icon">
          <Icon />
        </div>
      )}
      <div className="select-card-label">{label}</div>
      <div className="select-card-hint">{hint}</div>
    </motion.button>
  )
})

// --- RecipeForm Component ---

const RecipeForm = memo(function RecipeForm({ selections, onSelect, onGenerate }: RecipeFormProps) {
  const { t } = useTranslation()


  return (
    <div className="recipe-form">
      <h1 className="form-title">{t('recipe.form.title')}</h1>
      <p className="form-subtitle">{t('recipe.form.subtitle')}</p>

      <div className="recipe-section">
        <div className="section-label">{t('recipe.form.sections.meat')}</div>
        <div className="card-grid card-grid-4">
          {meatOptions.map((opt, i) => (
            <SelectCard
              key={opt.value}
              selected={selections.meat === opt.value}
              onClick={() => onSelect('meat', opt.value)}
              label={t(`recipe.form.options.meat.${opt.value}`)}
              hint={t(`recipe.form.options.meat.${opt.value}_hint`)}
              Icon={opt.Icon}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Fat Row */}
      <div className="form-section">
        <div className="section-label">{t('recipe.form.sections.fat')}</div>
        <div className="card-grid card-grid-3">
          {fatOptions.map((opt, i) => (
            <SelectCard
              key={opt.value}
              selected={selections.fat === opt.value}
              onClick={() => onSelect('fat', opt.value)}
              label={t(`recipe.form.options.fat.${opt.value}`)}
              hint={t(`recipe.form.options.fat.${opt.value}_hint`)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Intensity Row */}
      <div className="form-section">
        <div className="section-label">{t('recipe.form.sections.intensity')}</div>
        <div className="card-grid card-grid-3">
          {intensityOptions.map((opt, i) => (
            <SelectCard
              key={opt.value}
              selected={selections.intensity === opt.value}
              onClick={() => onSelect('intensity', opt.value)}
              label={t(`recipe.form.options.intensity.${opt.value}`)}
              hint={t(`recipe.form.options.intensity.${opt.value}_hint`)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Style Row */}
      <div className="form-section">
        <div className="section-label">{t('recipe.form.sections.style')}</div>
        <div className="card-grid card-grid-4">
          {styleOptions.map((opt, i) => (
            <SelectCard
              key={opt.value}
              selected={selections.style === opt.value}
              onClick={() => onSelect('style', opt.value)}
              label={t(`recipe.form.options.style.${opt.value}`)}
              hint={t(`recipe.form.options.style.${opt.value}_hint`)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Spice Level (Острота) */}
      <div className="form-section">
        <div className="section-label">{t('recipe.form.sections.spiceLevel')}</div>
        <div className="spice-slider-container">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={selections.spiceLevel}
            onChange={(e) => onSelect('spiceLevel', parseInt(e.target.value, 10))}
            className="spice-slider"
          />
          <div className="spice-labels">
            <span>{t('recipe.form.spice.mild')}</span>
            <span className="spice-value">{selections.spiceLevel}</span>
            <span>{t('recipe.form.spice.hot')}</span>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="form-actions">        <motion.button
        className="generate-button"
        onClick={onGenerate}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('recipe.form.generate')}
      </motion.button>
      </div>
    </div>
  )
})

export default RecipeForm
