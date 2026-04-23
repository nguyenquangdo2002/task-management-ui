import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="581296081697-0sk5btgap1sumlk8do2ed2vr25tcpfrv.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)