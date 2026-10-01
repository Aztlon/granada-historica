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
const publicBasePath = new URL(`${publicOrigin}/`).pathname

const htmlPaths = [
  resolve(dist, 'index.html'),
  resolve(dist, '404.html'),
  resolve(dist, 'route', route.slug, 'index.html'),
  ...route.stops.map((stop) => resolve(dist, 'place', stop.slug, 'index.html')),
]
await Promise.all(htmlPaths.map((path) => access(path)))

const pilotMaterialPaths = [
  resolve(dist, 'pilot', 'test-sheet.html'),
  resolve(dist, 'pilot', 'field-checklist.html'),
  resolve(dist, 'pilot', 'review', 'index.html'),
  ...route.stops.map((stop) => resolve(dist, 'pilot', 'cards', `${stop.slug}.html`)),
]
await Promise.all(pilotMaterialPaths.map((path) => access(path)))

const rootHtml = await readFile(resolve(dist, 'index.html'), 'utf8')
if (!rootHtml.includes(`<link rel="canonical" href="${publicOrigin}/" />`)) {
  throw new Error('La página principal no contiene su URL canónica de producción.')
}

if (route.status === 'preview') {
  const previewPaths = htmlPaths.slice(1)
  for (const path of previewPaths) {
    const html = await readFile(path, 'utf8')
    if (!html.includes('name="robots" content="noindex,nofollow"')) {
      throw new Error(`Falta noindex en la entrada de previsualización: ${path}`)
    }
  }
}

const routeHtml = await readFile(resolve(dist, 'route', route.slug, 'index.html'), 'utf8')
if (!routeHtml.includes(`<meta property="og:title" content="${route.title.es} · Granada Histórica" />`)) {
  throw new Error('La entrada de la ruta no contiene sus metadatos sociales específicos.')
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

  const placeHtml = await readFile(resolve(dist, 'place', stop.slug, 'index.html'), 'utf8')
  if (!placeHtml.includes(`<link rel="canonical" href="${url}" />`)) {
    throw new Error(`La entrada de ${stop.slug} no contiene su URL canónica exacta.`)
  }
  if (!placeHtml.includes(`href="${publicBasePath}granada-mark.svg"`)) {
    throw new Error(`La entrada de ${stop.slug} no resuelve correctamente el icono del sitio.`)
  }
}

console.log(`Compilación M7 verificada: ${htmlPaths.length} entradas, ${pilotMaterialPaths.length} materiales y ${route.stops.length} QR exactos.`)
