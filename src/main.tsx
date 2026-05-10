import { Analytics } from '@vercel/analytics/react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { BrowserRouter } from 'react-router'

import App from './App.tsx'
import i18n from './i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <I18nextProvider i18n={i18n}>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </I18nextProvider>,
)
