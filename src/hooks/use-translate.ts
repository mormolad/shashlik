import { useTranslation } from 'react-i18next';

/**
 * Хук для получения локализованных строк по ключу.
 * Использует текущую локаль, определенную в i18n.ts (через LanguageDetector).
 */
export const useTranslate = () => {
  const { t, i18n } = useTranslation();

  return {
    /**
     * Возвращает строку перевода по ключу.
     * @param key - путь к строке в json файле (например, 'recipe.form.title')
     */
    t: (key: string) => t(key),
    /** Текущий активный язык */
    language: i18n.language,
  };
};
