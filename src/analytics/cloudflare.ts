const BEACON_URL = 'https://static.cloudflareinsights.com/beacon.min.js'
const BEACON_ID = 'cloudflare-web-analytics'

/**
 * Enables privacy-first, aggregate analytics only when a site token is supplied.
 * Removing this file and its single call in main.tsx removes the integration.
 */
export function initializeCloudflareAnalytics() {
  const token = import.meta.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN?.trim()

  if (!token || typeof document === 'undefined' || document.getElementById(BEACON_ID)) return

  const beacon = document.createElement('script')
  beacon.id = BEACON_ID
  beacon.type = 'module'
  beacon.src = BEACON_URL
  beacon.dataset.cfBeacon = JSON.stringify({ token })
  beacon.defer = true
  document.body.append(beacon)
}
