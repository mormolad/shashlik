import { useTranslation } from 'react-i18next'
import { NavLink, Route, Routes } from 'react-router'

import AboutPage from './pages/AboutPage'
import HomePage from './pages/HomePage'
import RecipesPage from './pages/RecipesPage'
import BackgroundVideo from './sections/BackgroundVideo'

import './styles/index.css'

function App() {
  const { t } = useTranslation()

  return (
    <div className="app-wrapper">
      <BackgroundVideo />

      <main className="content-container">
        <nav className="site-nav" aria-label={t('nav.label')}>
          <NavLink to="/" end className="site-nav-link">
            {t('nav.home')}
          </NavLink>
          <NavLink to="/recipes" className="site-nav-link">
            {t('nav.recipes')}
          </NavLink>
          <NavLink to="/about" className="site-nav-link">
            {t('nav.about')}
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>

        <footer className="site-footer">
          <div className="footer-signature">{t('footer.signature')}</div>
          <div className="footer-logo-centered">
            <img
              src="/PointPuls.svg"
              alt="PointPuls"
              className="footer-logo-img"
              width={140}
              height={34}
              loading="lazy"
              decoding="async"
            />
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
