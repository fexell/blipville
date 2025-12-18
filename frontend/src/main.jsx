
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { CookiesProvider } from 'react-cookie'

import { UserIdContext } from './auth/contexts/Auth.context.js'

import App from './App.jsx'

import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </BrowserRouter>
)
