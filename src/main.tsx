import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { ThemeProvider } from '@kryv/teal'
import '@kryv/teal/styles.css'
import '@kryv/teal/base.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'
import '@fontsource/plus-jakarta-sans/latin-800.css'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import './styles.css'
import { App } from './App'
import { content, tools } from './content-source'
import { AppStateProvider } from './state'

// HashRouter: the build is a single file meant to open from disk, where
// there is no server to rewrite deep links to index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider storageKey="offsec-cheatsheets:theme">
      <AppStateProvider>
        <HashRouter>
          <App content={content} tools={tools} />
        </HashRouter>
      </AppStateProvider>
    </ThemeProvider>
  </StrictMode>,
)
