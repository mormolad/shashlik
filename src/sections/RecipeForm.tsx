import { memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type {
  FatType,
  IntensityType,
  MarinadeInput,
  MeatType,
  StyleType,
} from '../lib/marinade/types'

// --- SVG Icons ---

const MeatIcon = memo(function MeatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 9.2 6.6 6.8l3 .5" />
      <path d="M15.5 9.2l1.9-2.4-3 .5" />
      <ellipse cx="12" cy="13" rx="6.2" ry="4.8" />
      <ellipse cx="12" cy="13.2" rx="3.7" ry="2.6" />
      <ellipse cx="10.7" cy="13.2" rx="0.7" ry="1" />
      <ellipse cx="13.3" cy="13.2" rx="0.7" ry="1" />
    </svg>
  )
})

const ChickenIcon = memo(function ChickenIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.8 8.4c1.9 1.9 2.1 5 .4 7.2-1.8 2.3-5 3-7.4 1.5-2.3-1.5-3.1-4.5-1.8-6.7 1.3-2.1 4-2.8 6.2-1.8" />
      <path d="M14.5 15.3l2.5 2.5" />
      <path d="M18.3 18.8a1.2 1.2 0 1 1-1.7-1.7 1.2 1.2 0 0 1 1.7 1.7z" />
      <path d="M20.1 17a1.2 1.2 0 1 1-1.7-1.7 1.2 1.2 0 0 1 1.7 1.7z" />
    </svg>
  )
})

const BeefIcon = memo(function BeefIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.2 9.8c-1.6-.2-2.8-1-3.6-2.4 1.7 0 3.1.5 4.3 1.6" />
      <path d="M16.8 9.8c1.6-.2 2.8-1 3.6-2.4-1.7 0-3.1.5-4.3 1.6" />
      <path d="M12 19.5c3.6 0 6.1-2.5 6.1-5.9 0-2.9-2.1-5.1-4.9-5.1h-2.4c-2.8 0-4.9 2.2-4.9 5.1 0 3.4 2.5 5.9 6.1 5.9z" />
      <path d="M10.2 13.8h3.6" />
      <path d="M9.8 16.1c.7.6 1.4.9 2.2.9s1.5-.3 2.2-.9" />
    </svg>
  )
})

const LambIcon = memo(function LambIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12c-2.2 0-4-1.8-4-4s1.8-4 4-4c2.1 0 3.8 1.7 3.8 3.8 0 1.8-1.4 3.2-3.2 3.2-1.2 0-2.2-1-2.2-2.2" />
      <path d="M15 12c2.2 0 4-1.8 4-4s-1.8-4-4-4c-2.1 0-3.8 1.7-3.8 3.8 0 1.8 1.4 3.2 3.2 3.2 1.2 0 2.2-1 2.2-2.2" />
      <circle cx="12" cy="15.5" r="2.5" />
    </svg>
  )
})

const TurkeyIcon = memo(function TurkeyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.2 15.2c0-3.6 2.2-6.2 5.6-6.2 2.3 0 4.1 1.4 4.8 3.5.7 2.1.1 4.5-1.9 6.1-1.9 1.5-4.7 1.8-6.8.5" />
      <path d="M7.8 15.4c-1.1-.3-2-.1-2.8.6.8 1 1.8 1.4 3 .9" />
      <path d="M10.7 9.8c-.9-.9-1.9-1.2-3.1-.8.1 1.2.8 2 2.1 2.4" />
      <path d="M13.8 8.8c.5-1 .5-2 0-3-1.2.4-1.8 1.2-1.9 2.5" />
    </svg>
  )
})

// --- Card Option Data ---

const meatOptions: { value: MeatType; Icon: React.FC }[] = [
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
]// --- SelectCard Component ---

interface SelectCardProps {
  selected: boolean
  onClick: () => void
  label: string
  hint: string
  Icon?: React.FC
  index: number
}

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

interface RecipeFormProps {
  selections: MarinadeInput
  onSelect: <K extends keyof MarinadeInput>(category: K, value: MarinadeInput[K]) => void
  onGenerate: () => void
}

const RecipeForm = memo(function RecipeForm({ selections, onSelect, onGenerate }: RecipeFormProps) {
  const { t } = useTranslation()

  return (
    <div className="recipe-form">
      <h1 className="form-title">{t('recipe.form.title')}</h1>
      <p className="form-subtitle">{t('recipe.form.subtitle')}</p>

      <div className="recipe-section">
        <div className="recipe-section-label">{t('recipe.form.sections.meat')}</div>
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

      {/* Generate Button */}
      <div className="form-actions">
        <motion.button
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
