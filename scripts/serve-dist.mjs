import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const dist = resolve('dist')
const base = '/granada-historica/'
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname)
  if (!pathname.startsWith(base)) {
    response.writeHead(302, { Location: base })
    response.end()
    return
  }
  const relative = pathname.slice(base.length)
  let candidate = resolve(dist, relative || 'index.html')
  if (!candidate.startsWith(`${dist}${sep}`) && candidate !== dist) {
    response.writeHead(400)
    response.end('Bad request')
    return
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate = resolve(candidate, 'index.html')
  if (!existsSync(candidate)) candidate = resolve(dist, '404.html')

  response.writeHead(candidate.endsWith('404.html') ? 404 : 200, {
    'Content-Type': mimeTypes[extname(candidate)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  })
  createReadStream(candidate).pipe(response)
})

server.listen(4173, '127.0.0.1', () => {
  console.log(`M7 test server listening at http://127.0.0.1:4173${base}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.closeAllConnections()
    process.exit(0)
  })
}
