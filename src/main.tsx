import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'maplibre-gl/dist/maplibre-gl.css'
import { initializeCloudflareAnalytics } from './analytics/cloudflare'
import { App } from './app/App'
import './styles/global.css'

initializeCloudflareAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
