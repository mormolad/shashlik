import { motion } from 'framer-motion'
import { memo, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BeefIcon,
  ChickenIcon,
  LambIcon,
  MeatIcon,
  TurkeyIcon,
} from '../components/icons/MeatIcons'
import {
  FAT_VALUES,
  INTENSITY_VALUES,
  MEAT_VALUES,
  STYLE_VALUES,
} from '../lib/marinade/options'

import type { MeatType } from '../lib/marinade/types'
import type { RecipeFormProps, SelectCardProps } from '../types/forms'

const MEAT_ICONS: Record<MeatType, ComponentType> = {
  pork: MeatIcon,
  chicken: ChickenIcon,
  beef: BeefIcon,
  lamb: LambIcon,
  turkey: TurkeyIcon,
}

const SelectCard = memo(function SelectCard({
  selected,
  onClick,
  label,
  hint,
  Icon,
  index,
}: SelectCardProps) {
  return (
    <motion.button
      className={`select-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      aria-pressed={selected}
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

const RecipeForm = memo(function RecipeForm({
  selections,
  onSelectMeat,
  onSelectStyle,
  onSelectIntensity,
  onSelectFat,
  onSelectSpiceLevel,
  onGenerate,
}: RecipeFormProps) {
  const { t } = useTranslation()

  return (
    <div className="recipe-form">
      <h1 className="form-title">{t('recipe.form.title')}</h1>
      <p className="form-subtitle">{t('recipe.form.subtitle')}</p>

      <div className="recipe-section">
        <div className="section-label">{t('recipe.form.sections.meat')}</div>
        <div className="card-grid card-grid-4">
          {MEAT_VALUES.map((value, i) => (
            <SelectCard
              key={value}
              selected={selections.meat === value}
              onClick={() => onSelectMeat(value)}
              label={t(`recipe.form.options.meat.${value}`)}
              hint={t(`recipe.form.options.meat.${value}_hint`)}
              Icon={MEAT_ICONS[value]}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">{t('recipe.form.sections.fat')}</div>
        <div className="card-grid card-grid-3">
          {FAT_VALUES.map((value, i) => (
            <SelectCard
              key={value}
              selected={selections.fat === value}
              onClick={() => onSelectFat(value)}
              label={t(`recipe.form.options.fat.${value}`)}
              hint={t(`recipe.form.options.fat.${value}_hint`)}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">{t('recipe.form.sections.intensity')}</div>
        <div className="card-grid card-grid-3">
          {INTENSITY_VALUES.map((value, i) => (
            <SelectCard
              key={value}
              selected={selections.intensity === value}
              onClick={() => onSelectIntensity(value)}
              label={t(`recipe.form.options.intensity.${value}`)}
              hint={t(`recipe.form.options.intensity.${value}_hint`)}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">{t('recipe.form.sections.style')}</div>
        <div className="card-grid card-grid-4">
          {STYLE_VALUES.map((value, i) => (
            <SelectCard
              key={value}
              selected={selections.style === value}
              onClick={() => onSelectStyle(value)}
              label={t(`recipe.form.options.style.${value}`)}
              hint={t(`recipe.form.options.style.${value}_hint`)}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">{t('recipe.form.sections.spiceLevel')}</div>
        <div className="spice-slider-container">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={selections.spiceLevel}
            onChange={(e) => onSelectSpiceLevel(parseInt(e.target.value, 10))}
            className="spice-slider"
            aria-label={t('recipe.form.sections.spiceLevel')}
          />
          <div className="spice-labels">
            <span>{t('recipe.form.spice.mild')}</span>
            <span className="spice-value">{selections.spiceLevel}</span>
            <span>{t('recipe.form.spice.hot')}</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <motion.button
          className="generate-button"
          onClick={onGenerate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
        >
          {t('recipe.form.generate')}
        </motion.button>
      </div>
    </div>
  )
})

export default RecipeForm
