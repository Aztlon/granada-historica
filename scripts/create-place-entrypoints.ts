import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import routeJson from '../data/pilot-route.json'
import { pilotRouteSchema } from '../src/data/pilotSchema'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const source = resolve(dist, 'index.html')
const route = pilotRouteSchema.parse(routeJson)
const sourceHtml = await readFile(source, 'utf8')
const publicOrigin = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '')
  ?? 'https://aztlon.github.io/granada-historica'
const publicBasePath = new URL(`${publicOrigin}/`).pathname
const previewRobots = route.status === 'preview' ? 'noindex,nofollow' : undefined

const rootHtml = withMetadata(sourceHtml, {
  title: 'Granada Histórica',
  description: 'Explora una reconstrucción documentada de la Granada de hacia 1492, con sus grados de certeza siempre visibles.',
  canonicalUrl: `${publicOrigin}/`,
})
await writeFile(source, rootHtml, 'utf8')

const routeDirectory = resolve(dist, 'route', route.slug)
await mkdir(routeDirectory, { recursive: true })
await writeFile(resolve(routeDirectory, 'index.html'), withMetadata(sourceHtml, {
  title: `${route.title.es} · Granada Histórica`,
  description: route.description.es,
  canonicalUrl: `${publicOrigin}/route/${route.slug}/`,
  robots: previewRobots,
}), 'utf8')

for (const stop of route.stops) {
  const directory = resolve(dist, 'place', stop.slug)
  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, 'index.html'), withMetadata(sourceHtml, {
    title: `${stop.title.es} · Granada Histórica`,
    description: stop.introduction.es,
    canonicalUrl: `${publicOrigin}/place/${stop.slug}/`,
    robots: previewRobots,
  }), 'utf8')
}

await writeFile(resolve(dist, '404.html'), withRobots(sourceHtml, 'noindex,nofollow'), 'utf8')
console.log(`Entradas M7 generadas con metadatos: ${route.stops.length + 1}; 404.html preparado.`)

function withMetadata(html: string, metadata: {
  title: string
  description: string
  canonicalUrl: string
  robots?: string
}) {
  const title = escapeHtml(metadata.title)
  const description = escapeHtml(metadata.description)
  const canonicalUrl = escapeHtml(metadata.canonicalUrl)
  let result = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace('href="./granada-mark.svg"', `href="${publicBasePath}granada-mark.svg"`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`,
    )
  const tags = [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Granada Histórica" />`,
    `<meta property="og:locale" content="es_ES" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ]
  if (metadata.robots) tags.push(`<meta name="robots" content="${metadata.robots}" />`)
  result = result.replace('</head>', `  ${tags.join('\n    ')}\n  </head>`)
  return result
}

function withRobots(html: string, content: string) {
  return html.replace('</head>', `  <meta name="robots" content="${content}" />\n  </head>`)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character)
}
