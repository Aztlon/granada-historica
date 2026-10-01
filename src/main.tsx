import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/newsreader/500.css'
import '@fontsource/newsreader/600.css'
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
