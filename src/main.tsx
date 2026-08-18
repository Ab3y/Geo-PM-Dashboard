import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AppProvider } from './context/AppContext'
import { PersonaProvider } from './context/PersonaContext'
import { PMProvider } from './context/PMContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <PersonaProvider>
        <PMProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </PMProvider>
      </PersonaProvider>
    </HashRouter>
  </StrictMode>,
)
