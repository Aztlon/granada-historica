import { readdir, readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const isInternal = process.argv.includes('--internal')
const outputDirectory = resolve(isInternal ? 'dist-internal' : 'dist')
const files = await listFiles(outputDirectory)
const javascript = files.filter((path) => path.endsWith('.js'))
const privateDataChunk = javascript.find((path) => path.includes('internalComparisonData-'))
const hasPrivateDataChunk = Boolean(privateDataChunk)
const combinedJavascript = (await Promise.all(javascript.map((path) => readFile(path, 'utf8')))).join('\n')
const privateDataMarkers = [
  'Palace of Charles V',
  'Containment within the Alhambra makes the insertion visible without erasing continuity of the Nasrid enclosure.',
]

if (isInternal) {
  if (!hasPrivateDataChunk) throw new Error('La compilación interna no contiene el fragmento de datos M10.4.')
  for (const marker of [...privateDataMarkers, 'Internal review · not for publication']) {
    if (!combinedJavascript.includes(marker)) {
      throw new Error(`La compilación interna M10.4 no contiene el marcador esperado: ${marker}`)
    }
  }
  const javascriptBytes = (await Promise.all(javascript.map(async (path) => (await stat(path)).size)))
    .reduce((sum, size) => sum + size, 0)
  if (javascriptBytes > 2_750_000) {
    throw new Error(`La compilación interna supera el presupuesto JavaScript de 2,75 MB: ${javascriptBytes} bytes.`)
  }
  const privateDataBytes = privateDataChunk ? (await stat(privateDataChunk)).size : 0
  if (privateDataBytes > 375_000) {
    throw new Error(`El fragmento privado c. 1550 supera el presupuesto de 375 KB: ${privateDataBytes} bytes.`)
  }
  console.log(`Compilación interna M10.5 verificada: ${javascript.length} archivos JS, ${javascriptBytes} bytes; fragmento privado ${privateDataBytes} bytes.`)
} else {
  if (hasPrivateDataChunk) throw new Error('La compilación pública contiene el fragmento privado M10.4.')
  for (const marker of privateDataMarkers) {
    if (combinedJavascript.includes(marker)) {
      throw new Error(`La compilación pública contiene datos internos M10.4: ${marker}`)
    }
  }
  console.log('Compilación pública verificada: no contiene el fragmento ni la narrativa privada c. 1550.')
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  }))).flat()
}
