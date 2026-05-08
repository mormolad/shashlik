# Ревью проекта shashlik

Чек-лист код-ревью проекта **shashlik** (Vite + React 19 + TypeScript). Проходить сверху вниз, отмечать выполненное `- [x]`. Каждый блок удобно закрывать отдельным коммитом или PR.

---

## 1. Архитектура и структура

- [ ] Лишний слой роутинга: `BrowserRouter` в [src/main.tsx](src/main.tsx) подключён, но нет ни одного `<Routes>`. [src/pages/Home.tsx](src/pages/Home.tsx) просто реэкспортирует `App`.
- [ ] Решить:  ввести реальные страницы (`/`, `/about`, `/recipes`).
- [ ] Папка [src/components/ui/](src/components/ui/) убрать
- [ ] [components.json](components.json) убрать

## 2. Доменная логика (`src/lib/marinade`)

- [x] `StyleType.quick` переименован в `'express'` — конфликт с `MarinadeTimePreference.quick` устранён.
- [x] `MarinadeInput.nationalStyle` удалён.
- [x] Магические числа вынесены в [src/lib/marinade/rules.ts](src/lib/marinade/rules.ts): `RANDOM_VARIANCE`, `LEMON_JUICE_BASE_GRAMS`, `LEMON_JUICE_VARIANCE`, `STYLE_SPICE_COUNT`, `HIGH_DOSE_THRESHOLD_GRAMS`, `MIN_SPICE_AMOUNT_GRAMS`, `SPICE_LEVEL_OFFSET`, `SPICE_LEVEL_DIVISOR`.
- [x] Seed-fallback в `generateMarinadeRecipe` сменён с `Date.now()` на `Math.floor(Math.random() * 0x7fffffff)` — лучше дисперсия при быстрых повторных вызовах.
- [x] Дублирующее правило «`dill` + `lamb`» убрано из `hasHardConflict` — оно уже описано в `HARD_CONFLICTS`.
- [x] `MarinadeMeta.userRating` удалён.
- [ ] Текст шагов рецепта (`steps`) и нот (`cutNote`/`alcoholNote`) пока остаётся захардкоженным RU — будет вынесен в i18n в коммите 9.

## 3. UI/UX слой (`src/sections`, `src/App.tsx`)

- [ ] Магическое число `setTimeout(1500)` в [src/App.tsx](src/App.tsx) для имитации генерации — вынести в константу 
- [ ] `handleRandomize` в [src/App.tsx](src/App.tsx) вызывает `generateMarinadeRecipe(selections)` без нового seed — результат может совпадать. разница между кликами всё равно будет. 
- [ ] `RecipeForm` принимает `onSelect` как универсальный generic-колбэк — это нарушает SRP: компонент знает обо всём `MarinadeInput`. Альтернатива: отдельные `onSelectMeat`, `onSelectStyle`.
- [ ] `RecipeForm` содержит и логику опций (`meatOptions`, `styleOptions`), и презентацию — вынести опции в `lib/marinade/options.ts`.
- [ ] `FireOverlay` рендерит видео даже когда `visible=false` (через `AnimatePresence`) — оптимизировать через `mountOnEnter`.
- [ ] Background-видео в [src/sections/BackgroundVideo.tsx](src/sections/BackgroundVideo.tsx) с `preload="auto"` грузит большой файл сразу — поставить `preload="metadata"` и/или ленивую загрузку.

## 4. Стили (`src/styles/`, дизайн-токены)

- [x] Монолитный `src/App.css` (572 строки) разнесён на `src/styles/`: [layout.css](src/styles/layout.css), [overlays.css](src/styles/overlays.css), [form.css](src/styles/form.css), [recipe.css](src/styles/recipe.css), [footer.css](src/styles/footer.css), [responsive.css](src/styles/responsive.css). Барель — [src/styles/index.css](src/styles/index.css).
- [x] Дублей `.footer-logo-img` в финальной версии нет.
- [x] Tailwind полностью удалён в коммите 6.
- [x] Добавлен промежуточный брейкпойнт `@media (max-width: 1024px)` (планшет): уменьшается max-width контейнера, шрифт заголовка и `card-grid-4` переключается на 3 колонки.

## 5. Типы TypeScript

- [ ] `React.FC` в `meatOptions` ([src/sections/RecipeForm.tsx](src/sections/RecipeForm.tsx) стр. 21) — устаревший паттерн, лучше `() => JSX.Element`.
- [ ] Типы пропсов ([src/types/forms.ts](src/types/forms.ts), [src/types/results.ts](src/types/results.ts), [src/types/overlays.ts](src/types/overlays.ts)) разнесены отдельно — ок, но проверить, что не дублируют доменные типы из `lib/marinade/types.ts`.
- [ ] `defaultSelections` в [src/App.tsx](src/App.tsx) с захардкоженными литералами — продублировать как `DEFAULT_SELECTIONS` из доменного слоя.

## 6. Зависимости (`package.json`)

- [x] Удалить неиспользуемые пакеты: `@hookform/resolvers`, `react-hook-form`, `react-day-picker`, `date-fns`, `recharts`, `sonner`, `vaul`, `next-themes`, `embla-carousel-react`, `cmdk`, `input-otp`, `react-resizable-panels`, `zod`, `lucide-react`, все `@radix-ui/*` (`components/ui` пуст), а также Tailwind-стек (`tailwindcss`, `tailwindcss-animate`, `tw-animate-css`, `tailwind-merge`, `class-variance-authority`, `clsx`, `autoprefixer`, `postcss`).
- [x] `kimi-plugin-inspect-react` в [vite.config.ts](vite.config.ts) обёрнут в `mode === 'development'`.
- [x] Удалены файлы [tailwind.config.js](tailwind.config.js), [postcss.config.js](postcss.config.js), [components.json](components.json), [src/lib/utils.ts](src/lib/utils.ts) (использовал `clsx` + `tailwind-merge`), пустая [src/components/ui/](src/components/ui/).
- [x] Удалены директивы `@tailwind` из [src/index.css](src/index.css).
- [x] После чистки прогнан `npm install` (194 пакета удалено), bundle CSS уменьшен с 14.99 КБ до 9.21 КБ.

## 7. Производительность

- [ ] Bundle размер: текущий `index.js` = 440 КБ (gzip 140 КБ). После чистки зависимостей цель — < 80 КБ gzip.
- [ ] Видео-ассеты: в `public/` физически нет `videos/*.mp4`, но они грузятся в [src/sections/BackgroundVideo.tsx](src/sections/BackgroundVideo.tsx), [src/sections/FireOverlay.tsx](src/sections/FireOverlay.tsx), [src/sections/RecipeResult.tsx](src/sections/RecipeResult.tsx) — отсутствуют ассеты или забыли закоммитить.
- [ ] Использовать `loading="lazy"` для `<img>` в футере, если он не в первом экране.
- [ ] Анимации framer-motion: для `SelectCard` `delay: index * 0.04` × 7 стилей даёт цепочку 280 мс при первом рендере — допустимо, но проверить ощущение.

## 8. Доступность (a11y)

- [ ] Кнопки-карточки `<motion.button>` без `aria-pressed` для состояния «выбрано».
- [ ] Нет `<label>` или `aria-label` для слайдера остроты ([src/sections/RecipeForm.tsx](src/sections/RecipeForm.tsx)).
- [ ] Видео-фон без `aria-hidden="true"` — скрин-ридеры могут пытаться его озвучить.
- [ ] Контраст `--ash-text-soft` на `--carbon` — проверить через axe.
- [ ] `<img>` логотипа без явных `width/height` — CLS-риск.

## 9. Интернационализация (i18n)

- [ ] [src/i18n.ts](src/i18n.ts) подключён через `LanguageDetector`, но в коде остались **захардкоженные** строки: «ИНГРЕДИЕНТЫ», «ПРИГОТОВЛЕНИЕ», «Острота», «маринад» в [src/sections/RecipeResult.tsx](src/sections/RecipeResult.tsx); «Разработано с любовью к шашлыкам и под патронажем» в [src/App.tsx](src/App.tsx).
- [ ] Шаги рецепта и ноты (`cutNote`, `alcoholNote`) собираются как строки RU прямо в генераторе — вынести ключи в локали.
- [ ] Имена специй из `SPICE_LABELS_RU` ([src/lib/marinade/spice-db.ts](src/lib/marinade/spice-db.ts)) — оставить ключи и переводить через i18n, чтобы добавить EN.
- [ ] Файл [src/locales/en/translation.json](src/locales/en/translation.json) проверить на полноту относительно `ru/translation.json`.

## 10. Безопасность

- [x] Файл `.env` содержит `FIGMA_API_KEY` — **ключ нужно отозвать в Figma** (он был засвечен в первом push'е). Создан [.env.example](.env.example) как образец. `.env` уже игнорируется через [.gitignore](.gitignore).
- [x] История проверена `git log -p` по `*.json/*.md/*.ts/*.tsx` на токены — посторонних секретов не найдено.
- [x] Добавлен [.github/dependabot.yml](.github/dependabot.yml) (npm weekly, github-actions monthly).
- [x] `npm audit --omit=dev` — **0 vulnerabilities** на момент ревью.

## 11. Качество кода (SOLID/KISS/DRY)

- [x] **SRP**: `generator.ts` разнесён по обязанностям — теперь это оркестратор, остальное вынесено:
  - [src/lib/marinade/selectSpices.ts](src/lib/marinade/selectSpices.ts) — `selectStyleSpices`, `filterConflicts`.
  - [src/lib/marinade/calcAmounts.ts](src/lib/marinade/calcAmounts.ts) — `calcSpiceAmount` + хелперы.
  - [src/lib/marinade/notes.ts](src/lib/marinade/notes.ts) — `getCutNote`, `getAlcoholNote`.
- [x] **DRY**: `getCutNote` и `getAlcoholNote` обобщены через словари (`CUT_NOTES`, `ALCOHOL_NOTES`) в [notes.ts](src/lib/marinade/notes.ts).
- [x] **KISS**: `filterConflicts` упрощена — собирает `Set` из имён к удалению одним проходом, без мутаций промежуточного массива.
- [x] [.cursor/rules/design.mdc](.cursor/rules/design.mdc) переписан под актуальную архитектуру (без Tailwind/Radix/`components/ui`, описана структура `styles/`, `sections/`, `lib/marinade/`).

## 12. Билд и инфраструктура

- [x] Скрипты в `package.json`: добавлены `typecheck`, `format`, `format:check`, `test`.
- [x] ESLint-конфиг расширен: `eslint-plugin-jsx-a11y`, `eslint-plugin-import` (с `import/order`), `no-console: warn`.
- [x] Добавлен Prettier (`.prettierrc.json`, `.prettierignore`).
- [x] Добавлен CI workflow [.github/workflows/ci.yml](.github/workflows/ci.yml): Node 20, `npm ci`, `lint`, `typecheck`, `build`.
- [x] [.gitignore](.gitignore): проверено, `dist/`, `.env`, `.cursor/` присутствуют.
- [x] `vite.config.ts` `base: './'` оставлен — норм для статики.
- [x] Удалён мёртвый хук `src/hooks/use-mobile.ts` (нигде не использовался + lint-ошибка `react-hooks/set-state-in-effect`).

## 13. Тестирование

- [ ] Тестов **0**. Минимум: добавить vitest и покрыть ядро `lib/marinade`:
  - [ ] `generator.test.ts`: при одинаковом seed одинаковый рецепт.
  - [ ] `generator.test.ts`: для каждого мяса присутствуют обязательные специи (`REQUIRED_SPICES_BY_MEAT`).
  - [ ] `generator.test.ts`: жёсткие конфликты (`HARD_CONFLICTS`) никогда не появляются вместе.
  - [ ] `generator.test.ts`: при `spiceLevel=0` черного перца нет в результате.
  - [ ] `math.test.ts`: `roundToHalf`, `weightedPick`, `randomBetween` — граничные случаи.
- [ ] Опционально: `@testing-library/react` для smoke-теста `RecipeForm`.

---

## Карта зон ревью

```mermaid
flowchart LR
  Domain[lib/marinade] --> Generator[generator.ts]
  Domain --> Rules[rules.ts]
  Domain --> SpiceDB[spice-db.ts]
  UI[sections] --> Form[RecipeForm.tsx]
  UI --> Result[RecipeResult.tsx]
  UI --> Overlays[FireOverlay/BackgroundVideo]
  AppTsx[App.tsx] --> UI
  AppTsx --> Domain
  AppTsx --> i18n[i18n.ts]
  Build[Build/Infra] --> Vite[vite.config.ts]
  Build --> ESLint[eslint.config.js]
  Build --> TS[tsconfig.app.json]
  Quality[Качество] --> Domain
  Quality --> UI
  A11y[A11y/i18n] --> UI
  Perf[Perf] --> UI
  Perf --> Build
  Sec[Security] --> Build
```

---

## Порядок прохождения

1. **Быстрые победы** (низкий риск, большой эффект): категории 6, 10, 12.
2. **Стабилизация ядра**: категории 2, 5, 11, 13.
3. **UI и UX**: категории 3, 4, 7, 8, 9.
4. **Финал**: категория 1 (роутинг и общая структура).
