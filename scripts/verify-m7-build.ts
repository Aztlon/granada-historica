import { access, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import routeJson from '../data/pilot-route.json'
import { pilotRouteSchema } from '../src/data/pilotSchema'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const route = pilotRouteSchema.parse(routeJson)
const publicOrigin = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '')
  ?? 'https://aztlon.github.io/granada-historica'

const htmlPaths = [
  resolve(dist, 'index.html'),
  resolve(dist, '404.html'),
  resolve(dist, 'route', route.slug, 'index.html'),
  ...route.stops.map((stop) => resolve(dist, 'place', stop.slug, 'index.html')),
]
await Promise.all(htmlPaths.map((path) => access(path)))

if (route.status === 'preview') {
  const previewPaths = htmlPaths.slice(1)
  for (const path of previewPaths) {
    const html = await readFile(path, 'utf8')
    if (!html.includes('<meta name="robots" content="noindex,nofollow">')) {
      throw new Error(`Falta noindex en la entrada de previsualización: ${path}`)
    }
  }
}

for (const stop of route.stops) {
  const url = `${publicOrigin}/place/${stop.slug}/`
  const expected = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: { dark: '#18241fff', light: '#ffffffff' },
  })
  const actual = await readFile(resolve(root, 'public', 'pilot', 'qr', `${stop.slug}.svg`), 'utf8')
  if (actual !== expected) throw new Error(`El QR de ${stop.slug} no codifica su URL canónica exacta.`)
}

console.log(`Compilación M7 verificada: ${htmlPaths.length} entradas HTML y ${route.stops.length} QR exactos.`)
