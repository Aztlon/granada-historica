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
const previewHtml = route.status === 'preview'
  ? withRobots(sourceHtml, 'noindex,nofollow')
  : sourceHtml
const entryDirectories = [
  resolve(dist, 'route', route.slug),
  ...route.stops.map((stop) => resolve(dist, 'place', stop.slug)),
]

for (const directory of entryDirectories) {
  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, 'index.html'), previewHtml, 'utf8')
}
await writeFile(resolve(dist, '404.html'), withRobots(sourceHtml, 'noindex,nofollow'), 'utf8')
console.log(`Entradas M7 generadas: ${entryDirectories.length}; 404.html preparado.`)

function withRobots(html: string, content: string) {
  return html.replace('</head>', `  <meta name="robots" content="${content}">\n</head>`)
}
