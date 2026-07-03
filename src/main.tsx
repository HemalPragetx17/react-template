import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { syncDefaultRadiusCssVariable } from './components/ui/shared/radius'
import './index.css'
import App from './App.tsx'

syncDefaultRadiusCssVariable()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
