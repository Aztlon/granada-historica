import type { HistoricalFeature } from './schema'

type Position = [number, number]
type Parts = Position[][]
const scale = [88_800, 111_000] as const
const distance = (a: Position, b: Position) => Math.hypot(
  (a[0] - b[0]) * scale[0], (a[1] - b[1]) * scale[1],
)
const cross = (a: Position, b: Position) => a[0] * b[1] - a[1] * b[0]
const subtract = (a: Position, b: Position): Position => [a[0] - b[0], a[1] - b[1]]

export function lineParts(feature: HistoricalFeature | undefined): Parts {
  if (feature?.geometry.type === 'LineString') return [feature.geometry.coordinates]
  if (feature?.geometry.type === 'MultiLineString') return feature.geometry.coordinates
  return []
}

export function distanceToLines(point: Position, parts: Parts) {
  let best = Infinity
  for (const part of parts) for (let i = 1; i < part.length; i++) {
    const a: Position = [(part[i - 1][0] - point[0]) * scale[0], (part[i - 1][1] - point[1]) * scale[1]]
    const b: Position = [(part[i][0] - point[0]) * scale[0], (part[i][1] - point[1]) * scale[1]]
    const delta = subtract(b, a)
    const length = delta[0] ** 2 + delta[1] ** 2
    const t = length ? Math.max(0, Math.min(1, -(a[0] * delta[0] + a[1] * delta[1]) / length)) : 0
    best = Math.min(best, Math.hypot(a[0] + t * delta[0], a[1] + t * delta[1]))
  }
  return best
}

/** Unique point crossings; shared vertices count once, disjoint collinear segments never intersect. */
export function lineIntersections(first: Parts, second: Parts): Position[] {
  const hits: Position[] = []
  const add = (p: Position) => { if (!hits.some((q) => distance(p, q) < 0.1)) hits.push(p) }
  for (const a of first) for (const b of second) {
    for (let i = 1; i < a.length; i++) for (let j = 1; j < b.length; j++) {
      const r = subtract(a[i], a[i - 1])
      const s = subtract(b[j], b[j - 1])
      const offset = subtract(b[j - 1], a[i - 1])
      const denominator = cross(r, s)
      if (Math.abs(denominator) < 1e-16) {
        for (const p of [a[i - 1], a[i], b[j - 1], b[j]]) {
          if (distanceToLines(p, [[a[i - 1], a[i]]]) < 0.01
            && distanceToLines(p, [[b[j - 1], b[j]]]) < 0.01) add(p)
        }
      } else {
        const t = cross(offset, s) / denominator
        const u = cross(offset, r) / denominator
        if (t >= -1e-10 && t <= 1 + 1e-10 && u >= -1e-10 && u <= 1 + 1e-10) {
          add([a[i - 1][0] + t * r[0], a[i - 1][1] + t * r[1]])
        }
      }
    }
  }
  return hits
}

function inside(p: Position, ring: Position[]) {
  if (distanceToLines(p, [ring]) < 0.2) return false
  let result = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j]
    if ((a[1] > p[1]) !== (b[1] > p[1])
      && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result
  }
  return result
}

export function auditSpatialRelationships(features: HistoricalFeature[]): string[] {
  const byId = new Map(features.map((f) => [f.id, f]))
  const errors: string[] = []
  const lines = (id: string) => lineParts(byId.get(id))
  const position = (id: string): Position => {
    const f = byId.get(id)
    if (f?.geometry.type === 'Point') return f.geometry.coordinates
    errors.push(`${id}: falta el punto de control.`)
    return [0, 0]
  }
  const ring = (id: string): Position[] => {
    const f = byId.get(id)
    return f?.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : []
  }
  const require = (condition: boolean, message: string) => { if (!condition) errors.push(message) }
  const darro = lines('water.darro'), genil = lines('water.genil')
  const confluence = darro[0]?.at(-1) ?? [0, 0]
  const mosque = position('religious.medina-great-mosque')
  const axares = lines('water.acequia-axares')
  require(distance(axares[0]?.at(-1) ?? [0, 0], mosque) < 25,
    'Axares debe alcanzar el ámbito de la Mezquita Mayor.')
  require(lineIntersections(axares, darro).length === 0, 'Axares no debe cruzar el Darro en este recorte.')
  for (const id of ['water.acequia-aynadamar', 'water.acequia-romayla']) {
    require(distanceToLines(mosque, lines(id)) > 100, `${id}: enlace no respaldado al Sagrario.`)
  }
  require(lineIntersections(lines('water.acequia-romayla'), darro).length === 0,
    'Romayla: el tramo urbano representado debe permanecer en la margen izquierda.')
  const aynadamar = byId.get('water.acequia-aynadamar')
  require(aynadamar?.geometry.type === 'MultiLineString'
    && lines('water.acequia-aynadamar').flat().some((p) => inside(p, ring('quarter.alcazaba-qadima'))),
  'Aynadamar debe conservar su distribución dentro de la Alcazaba.')
  require(lineIntersections(lines('water.acequia-gorda'), genil).length === 0,
    'Gorda no debe cruzar el Genil en este recorte.')
  require(lineIntersections(lines('water.acequia-gorda'), darro).length === 1,
    'Gorda debe salvar el Darro antes de la confluencia.')
  let tarramontaX = -180
  for (const name of ['tarramonta', 'arabuleila']) {
    const parts = lines(`water.acequia-${name}`)
    const hits = lineIntersections(parts, genil)
    require(hits.length === 1 && hits[0][0] > confluence[0] + 0.003,
      `${name}: se requiere un único cruce del Genil al este de la confluencia.`)
    if (name === 'tarramonta') tarramontaX = hits[0]?.[0] ?? -180
    else require((hits[0]?.[0] ?? -180) > tarramontaX, 'Arabuleila debe cruzar aguas arriba de Tarramonta.')
    const last = parts[0]?.at(-1) ?? [0, 0]
    require(hits.length > 0 && last[0] < hits[0][0] && last[1] < hits[0][1],
      `${name}: falta la continuidad suroccidental tras el cruce.`)
    require(distanceToLines(parts[0]?.[0] ?? [0, 0], lines('water.acequia-gorda')) < 1,
      `${name}: derivación desconectada de Gorda.`)
  }
  for (const id of ['bridge.cadi', 'bridge.carbon']) {
    require(lineIntersections(lines(id), darro).length === 1, `${id}: el vano debe atravesar el Darro.`)
  }
  require(distanceToLines([-3.598396,37.1751453], lines('bridge.carbon')) < 10,
    'Carbón: el puente debe coincidir con su calle, junto al Corral.')
  for (const p of [[-3.58555,37.17803],[-3.5854219,37.1750104]] as Position[]) {
    require(distanceToLines(p, lines('water.acequia-real-alhambra')) < 25,
      'La Acequia Real debe pasar por el Generalife y el acueducto de la Torre del Agua.')
  }
  for (const id of ['gate.alfajjarin', 'gate.mawrur']) {
    require(distanceToLines(position(id), lines('walls.mauror-realejo-inner')) < 15,
      `La cerca interior debe alcanzar ${id}.`)
  }
  for (const name of ['alcazaba-qadima', 'axares']) {
    require(JSON.stringify(ring(`quarter.${name}`)) === JSON.stringify(lines(`walls.${name}-inner`)[0]),
      `El recinto y la cerca de ${name} deben expresar la misma hipótesis.`)
  }
  for (const [a, b] of [['alcazaba-qadima','axares'],['alcazaba-qadima','albayyazin'],
    ['axares','albayyazin'],['alfajjarin','loma']]) {
    const first = ring(`quarter.${a}`), second = ring(`quarter.${b}`)
    let shared = 0
    for (let i = 1; i < first.length; i++) {
      const mid: Position = [(first[i][0] + first[i - 1][0]) / 2, (first[i][1] + first[i - 1][1]) / 2]
      if ([first[i - 1],mid,first[i]].every((p) => distanceToLines(p,[second]) < 0.2)) {
        shared += distance(first[i - 1],first[i])
      }
    }
    require(shared > 100, `${a}/${b}: falta un límite común continuo.`)
    require(!first.some((p) => inside(p,second)) && !second.some((p) => inside(p,first)),
      `${a}/${b}: solape entre recintos del mismo nivel.`)
  }
  return errors
}
