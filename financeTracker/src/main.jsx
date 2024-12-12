import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {SaasProvider} from '@saas-ui/react'
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
