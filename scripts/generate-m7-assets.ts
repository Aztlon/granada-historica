import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import routeJson from '../data/pilot-route.json'
import { pilotRouteSchema, type PlaceStop } from '../src/data/pilotSchema'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const route = pilotRouteSchema.parse(routeJson)
const publicOrigin = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '')
  ?? 'https://aztlon.github.io/granada-historica'
const pilotDirectory = resolve(root, 'public/pilot')
const outputDirectory = resolve(pilotDirectory, 'qr')
const cardsDirectory = resolve(pilotDirectory, 'cards')

await Promise.all([
  mkdir(outputDirectory, { recursive: true }),
  mkdir(cardsDirectory, { recursive: true }),
  mkdir(resolve(pilotDirectory, 'review'), { recursive: true }),
])

await removeUnexpectedFiles(outputDirectory, new Set(route.stops.map((stop) => `${stop.slug}.svg`)), '.svg')
await removeUnexpectedFiles(cardsDirectory, new Set(route.stops.map((stop) => `${stop.slug}.html`)), '.html')

for (const stop of route.stops) {
  const url = placeUrl(stop)
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: { dark: '#18241fff', light: '#ffffffff' },
  })
  await writeFile(resolve(outputDirectory, `${stop.slug}.svg`), svg, 'utf8')
  await writeFile(resolve(cardsDirectory, `${stop.slug}.html`), cardHtml(stop), 'utf8')
}

await Promise.all([
  writeFile(resolve(pilotDirectory, 'test-sheet.html'), testSheetHtml(), 'utf8'),
  writeFile(resolve(pilotDirectory, 'field-checklist.html'), fieldChecklistHtml(), 'utf8'),
  writeFile(resolve(pilotDirectory, 'review/index.html'), reviewHubHtml(), 'utf8'),
])

console.log(`Recursos M7 generados: ${route.stops.length} QR, ${route.stops.length} tarjetas y 3 documentos (${publicOrigin}).`)

function placeUrl(stop: PlaceStop) {
  return `${publicOrigin}/place/${stop.slug}/`
}

async function removeUnexpectedFiles(directory: string, expected: Set<string>, extension: string) {
  for (const file of await readdir(directory)) {
    if (file.endsWith(extension) && !expected.has(file)) await unlink(resolve(directory, file))
  }
}

function documentShell(title: string, body: string, styles: string) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex,nofollow" />
    <meta name="theme-color" content="#162822" />
    <title>${escapeHtml(title)}</title>
    <style>${styles}</style>
  </head>
  <body>${body}</body>
</html>
`
}

function cardHtml(stop: PlaceStop) {
  const url = placeUrl(stop)
  return documentShell(
    `${stop.order} · ${stop.title.es} · Granada Histórica`,
    `<main>
      <p class="brand">Granada Histórica</p>
      <p class="number">${stop.order} / ${route.stops.length}</p>
      <h1>${escapeHtml(stop.title.es)}</h1>
      <p class="english">${escapeHtml(stop.title.en)}</p>
      <img src="../qr/${stop.slug}.svg" alt="QR: ${escapeHtml(stop.title.es)} / ${escapeHtml(stop.title.en)}" />
      <p class="action">Escanea para descubrir qué había aquí hacia 1492.<br /><span>Scan to discover what stood here around 1492.</span></p>
      <code>${escapeHtml(url)}</code>
      <p class="notice">Tarjeta temporal de prueba · Temporary test card</p>
    </main>`,
    `
      @page { size: A6 portrait; margin: 8mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #18241f; background: #fffdf8; font-family: Arial, sans-serif; }
      main { display: flex; min-height: 132mm; padding: 9mm; border: 2px solid #18362d; flex-direction: column; text-align: center; }
      .brand { margin: 0 0 8mm; color: #18362d; font-size: 14px; font-weight: 700; letter-spacing: .04em; }
      .number { margin: 0; color: #99603e; font-size: 13px; font-weight: 700; }
      h1 { margin: 2mm 0 1mm; font-family: Georgia, serif; font-size: 25px; line-height: 1.08; }
      .english { margin: 0 0 4mm; color: #4d5b55; font-size: 16px; }
      img { width: 46mm; height: 46mm; margin: 2mm auto 4mm; }
      .action { margin: 0; font-size: 13px; line-height: 1.45; }
      .action span { color: #4d5b55; }
      code { margin-top: 4mm; overflow-wrap: anywhere; font-size: 11px; }
      .notice { margin: auto 0 0; color: #776f61; font-size: 9px; }
      @media screen { body { display: grid; min-height: 100vh; padding: 20px; place-items: center; } main { width: 105mm; } }
    `,
  )
}

function testSheetHtml() {
  const cards = route.stops.map((stop) => `<li>
        <strong>${stop.order} · ${escapeHtml(stop.title.es)} <span>${escapeHtml(stop.title.en)}</span></strong>
        <img src="qr/${stop.slug}.svg" alt="QR de ${escapeHtml(stop.title.es)} / ${escapeHtml(stop.title.en)}" />
        <code>${escapeHtml(placeUrl(stop))}</code>
      </li>`).join('\n      ')
  return documentShell(
    'Granada Histórica · QR piloto M7',
    `<main>
      <h1>Granada Histórica · piloto M7</h1>
      <p>Tarjetas temporales para pruebas controladas. No constituyen señalización municipal permanente.<br />Temporary cards for controlled testing. They are not permanent municipal signs.</p>
      <ol>${cards}</ol>
    </main>`,
    `
      body { max-width: 900px; margin: 0 auto; padding: 24px; color: #18241f; font: 16px system-ui, sans-serif; }
      h1 { margin-bottom: 4px; } p { line-height: 1.45; }
      ol { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; padding: 0; list-style: none; }
      li { break-inside: avoid; padding: 18px; border: 1px solid #bbb; }
      strong span { display: block; margin-top: 3px; color: #46544e; font-weight: 500; }
      img { display: block; width: 42mm; height: 42mm; margin: 12px auto; }
      code { display: block; overflow-wrap: anywhere; font-size: 11px; }
      @media print { body { padding: 0; } li { min-height: 82mm; } }
      @media (max-width: 620px) { ol { grid-template-columns: 1fr; } }
    `,
  )
}

function fieldChecklistHtml() {
  const stopSections = route.stops.map((stop) => `<section>
        <h2>${stop.order}. ${escapeHtml(stop.title.es)} <span>${escapeHtml(stop.title.en)}</span></h2>
        <p>${escapeHtml(stop.arrival_cue.es)}<br /><em>${escapeHtml(stop.arrival_cue.en)}</em></p>
        ${checklist([
          'El anclaje coincide con el punto interpretable / Anchor matches the interpretable viewpoint',
          'La aproximación peatonal es segura y accesible / Pedestrian approach is safe and accessible',
          'El código se escanea con iOS / QR scans on iOS',
          'El código se escanea con Android / QR scans on Android',
          'La URL impresa es legible / Printed fallback URL is legible',
          'La ficha distingue lugar histórico y restos actuales / Page distinguishes historical site and current fabric',
        ])}
        <label class="notes">Observaciones / Notes<textarea rows="3"></textarea></label>
      </section>`).join('\n')
  return documentShell(
    'Granada Histórica · lista de comprobación M7',
    `<main>
      <h1>Comprobación de campo · Field checklist</h1>
      <p><strong>Ruta:</strong> ${escapeHtml(route.title.es)} · ${escapeHtml(route.title.en)}</p>
      <p>Fecha / Date: ____________________ &nbsp; Personas / Reviewers: ____________________</p>
      <aside>No registrar coordenadas ni datos personales de participantes. Do not record participant coordinates or personal data.</aside>
      ${stopSections}
      <section>
        <h2>Revisión general / Overall review</h2>
        ${checklist([
          'La secuencia completa resulta clara / Full sequence is clear',
          'El tramo Madraza–Sagrario está libre de obstáculos / Madraza–Sagrario leg is unobstructed',
          'Los textos funcionan con letra grande / Text works at large text size',
          'Recorrido probado con lector de pantalla / Screen-reader walkthrough completed',
          'No quedan hallazgos críticos / No critical findings remain',
        ])}
        <label class="notes">Decisión y correcciones / Decision and corrections<textarea rows="5"></textarea></label>
      </section>
    </main>`,
    `
      @page { size: A4; margin: 13mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #18241f; font: 13px/1.4 Arial, sans-serif; }
      main { max-width: 900px; margin: auto; padding: 24px; }
      h1 { margin-bottom: 4px; font-family: Georgia, serif; font-size: 28px; }
      h2 { margin: 0 0 5px; font-size: 17px; } h2 span { color: #56635d; font-weight: 500; }
      aside { margin: 18px 0; padding: 10px; background: #f3e6ba; border-left: 4px solid #c49a43; }
      section { break-inside: avoid; margin: 0 0 16px; padding: 14px; border: 1px solid #bdc5c0; }
      section > p { margin: 0 0 8px; }
      ul { display: grid; gap: 5px; margin: 8px 0 12px; padding: 0; list-style: none; }
      li { display: flex; gap: 8px; align-items: flex-start; } input { width: 16px; height: 16px; flex: 0 0 auto; }
      .notes { display: block; font-weight: 700; } textarea { display: block; width: 100%; margin-top: 5px; resize: vertical; }
      @media print { main { padding: 0; } textarea { resize: none; } }
    `,
  )
}

function reviewHubHtml() {
  const stops = route.stops.map((stop) => `<li><span>${stop.order}</span><div><strong>${escapeHtml(stop.title.es)}</strong><small>${escapeHtml(stop.title.en)}</small><a href="../../place/${stop.slug}/">Abrir parada / Open stop</a> · <a href="../cards/${stop.slug}.html">Tarjeta / Card</a></div></li>`).join('\n')
  return documentShell(
    'Granada Histórica · revisión del piloto M7',
    `<main>
      <header><p class="eyebrow">Granada Histórica · M7</p><h1>Revisión del piloto<br /><span>Pilot review</span></h1><p class="status">PREVIEW · pendiente de validación / field validation pending</p></header>
      <section class="intro"><p>${escapeHtml(route.description.es)}</p><p lang="en">${escapeHtml(route.description.en)}</p><a class="primary" href="../../route/${route.slug}/">Abrir la ruta / Open route</a></section>
      <section><h2>Paradas / Stops</h2><ol class="stops">${stops}</ol></section>
      <section><h2>Materiales de prueba / Test materials</h2><div class="links"><a href="../test-sheet.html">Hoja con los cinco QR<br /><span>Five-QR test sheet</span></a><a href="../field-checklist.html">Lista de comprobación<br /><span>Field checklist</span></a></div></section>
      <section><h2>Documentación / Documentation</h2><p><a href="https://github.com/Aztlon/granada-historica/blob/main/docs/M7-PILOT.md">Protocolo y activación M7 / M7 protocol and activation</a><br /><a href="https://github.com/Aztlon/granada-historica/blob/main/docs/SPEC.md">Especificación y metodología histórica / Product and historical methodology</a><br /><a href="https://github.com/Aztlon/granada-historica">Código y datos abiertos / Open code and data</a></p></section>
      <section class="grid"><div><h2>Qué está listo / Ready</h2>${list(['Rutas estables y fichas bilingües / Stable routes and bilingual records','Códigos QR sin seguimiento / Tracking-free QR codes','Ubicación puntual y privada / One-shot private location','Pruebas automatizadas de rutas, privacidad y accesibilidad / Automated route, privacy and accessibility tests'])}</div><div><h2>Qué no se afirma / Not yet claimed</h2>${list(['Anclajes físicos definitivos / Final physical anchors','Itinerario peatonal validado / Validated walking directions','Permiso para señalización / Signage permission','Aprobación histórica, inglesa o institucional final / Final historical, English or institutional approval'])}</div></section>
      <section><h2>Privacidad / Privacy</h2><p>La ubicación solo se solicita tras una explicación, se usa una vez y permanece en memoria. No se incorpora a URL, almacenamiento ni analítica. Las teselas visibles proceden del proveedor cartográfico externo.</p><p lang="en">Location is requested only after an explanation, used once and kept in memory. It is not added to URLs, storage or analytics. Visible map tiles still come from the external map provider.</p></section>
      <section><h2>Decisión de activación / Activation decision</h2><p>La ruta seguirá oculta de la navegación y marcada <code>noindex</code> hasta completar la revisión editorial, el trabajo de campo, las pruebas de accesibilidad y el acuerdo de mantenimiento.</p><p lang="en">The route remains hidden from navigation and marked <code>noindex</code> until editorial review, fieldwork, accessibility testing and maintenance ownership are complete.</p></section>
    </main>`,
    `
      :root { color: #18241f; background: #eef1ec; font: 16px/1.55 Arial, sans-serif; }
      * { box-sizing: border-box; } body { margin: 0; } main { max-width: 980px; margin: auto; padding: 42px 24px 80px; }
      header { padding: 36px; color: #fffdf8; background: #18362d; border-radius: 18px; }
      .eyebrow { margin: 0; color: #e0bd65; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
      h1 { margin: 8px 0 14px; font: 700 44px/1.02 Georgia, serif; } h1 span { color: #d5ddd8; font-size: .7em; }
      .status { display: inline-block; margin: 0; padding: 6px 10px; color: #4e3b12; background: #f3e6ba; border-radius: 999px; font-size: 12px; font-weight: 700; }
      section { margin-top: 22px; padding: 28px; background: #fffdf8; border: 1px solid #d6dcd7; border-radius: 14px; }
      h2 { margin: 0 0 15px; font: 700 24px Georgia, serif; } p { max-width: 72ch; }
      a { color: #824d30; text-underline-offset: 3px; } .primary { display: inline-block; padding: 11px 15px; color: white; background: #18362d; border-radius: 8px; font-weight: 700; text-decoration: none; }
      .stops { display: grid; gap: 10px; padding: 0; list-style: none; } .stops li { display: flex; gap: 13px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #d6dcd7; }
      .stops li > span { display: grid; width: 30px; height: 30px; color: white; background: #18362d; border-radius: 50%; place-items: center; }
      .stops strong, .stops small { display: block; } .stops small { margin-bottom: 4px; color: #66716c; }
      .links, .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; } .links a { padding: 18px; background: #edf1ed; border-radius: 10px; font-weight: 700; } .links span { color: #56635d; font-weight: 500; }
      .grid { padding: 0; background: transparent; border: 0; } .grid > div { padding: 28px; background: #fffdf8; border: 1px solid #d6dcd7; border-radius: 14px; }
      ul { padding-left: 20px; } li { margin: 5px 0; }
      @media (max-width: 650px) { main { padding: 18px 14px 50px; } header, section, .grid > div { padding: 21px; } h1 { font-size: 34px; } .grid, .links { grid-template-columns: 1fr; } }
    `,
  )
}

function checklist(items: string[]) {
  return `<ul>${items.map((item) => `<li><input type="checkbox" aria-label="${escapeHtml(item)}" /> <span>${escapeHtml(item)}</span></li>`).join('')}</ul>`
}

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character)
}
