import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AppProvider } from './context/AppContext'
import { PersonaProvider } from './context/PersonaContext'
import { PMProvider } from './context/PMContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PersonaProvider>
        <PMProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </PMProvider>
      </PersonaProvider>
    </BrowserRouter>
  </StrictMode>,
)
