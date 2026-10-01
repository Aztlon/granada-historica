import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import routeJson from '../data/pilot-route.json'
import { pilotRouteSchema } from '../src/data/pilotSchema'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const route = pilotRouteSchema.parse(routeJson)
const publicOrigin = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '')
  ?? 'https://aztlon.github.io/granada-historica'
const outputDirectory = resolve(root, 'public/pilot/qr')

await mkdir(outputDirectory, { recursive: true })
const expectedFiles = new Set(route.stops.map((stop) => `${stop.slug}.svg`))
for (const file of await readdir(outputDirectory)) {
  if (file.endsWith('.svg') && !expectedFiles.has(file)) {
    await unlink(resolve(outputDirectory, file))
  }
}
for (const stop of route.stops) {
  const url = `${publicOrigin}/place/${stop.slug}/`
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: { dark: '#18241fff', light: '#ffffffff' },
  })
  await writeFile(resolve(outputDirectory, `${stop.slug}.svg`), svg, 'utf8')
}

console.log(`QR M7 generados: ${route.stops.length} (${publicOrigin}).`)
