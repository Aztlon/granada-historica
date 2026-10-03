import researchAuditJson from '../../data/research/c1550/geometry-audit.json'
import researchPointsRaw from '../../data/research/c1550/points.geojson?raw'
import reviewJson from '../../data/research/c1550/m10.3-review.json'
import { describe, expect, it } from 'vitest'
import {
  c1550VerticalSliceReviewSchema,
  M10_3_FEATURE_IDS,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
} from './temporalSchema'

const review = c1550VerticalSliceReviewSchema.parse(reviewJson)
const points = periodFeatureCollectionSchema.parse(JSON.parse(researchPointsRaw))
const pointById = new Map(points.features.map((feature) => [feature.id, feature]))
const auditById = new Map(
  periodGeometryAuditSchema.parse(researchAuditJson).map((entry) => [entry.feature_id, entry]),
)

describe('corte vertical privado M10.3', () => {
  it('contiene exactamente las ocho entidades de los dos conjuntos', () => {
    expect(review.feature_ids).toEqual(M10_3_FEATURE_IDS)
    expect(review.items).toHaveLength(8)
    expect(review.items.filter((item) => item.cluster === 'cathedral_precinct')).toHaveLength(6)
    expect(review.items.filter((item) => item.cluster === 'imperial_access')).toHaveLength(2)
    expect(review.public_application_import).toBe(false)
  })

  it('ofrece contenido completo y afirmaciones citadas en español e inglés', () => {
    for (const item of review.items) {
      for (const locale of ['es', 'en'] as const) {
        const content = item.content[locale]
        expect(content.name.length, `${item.feature_id}:${locale}:name`).toBeGreaterThan(0)
        expect(content.function.length, `${item.feature_id}:${locale}:function`).toBeGreaterThan(0)
        expect(content.summary.length, `${item.feature_id}:${locale}:summary`).toBeGreaterThan(20)
        expect(content.evidence_note.length, `${item.feature_id}:${locale}:evidence`).toBeGreaterThan(20)
        expect(content.change_note.length, `${item.feature_id}:${locale}:change`).toBeGreaterThan(20)
      }
      expect(item.claims.length, item.feature_id).toBeGreaterThanOrEqual(2)
      expect(item.claims.every((claim) => claim.citations.length > 0), item.feature_id).toBe(true)
      expect(pointById.get(item.feature_id)?.properties.name).toBe(item.content.es.name)
    }
  })

  it('corrige la sustitución instantánea de la Mezquita Mayor', () => {
    const mosque = pointById.get('religious.medina-great-mosque')
    const cathedral = review.items.find((item) => item.feature_id === 'religious.cathedral-granada')

    expect(mosque?.properties.presence).toBe('present')
    expect(mosque?.properties.change_from_previous).toBe('converted')
    expect(mosque?.properties.physical_state).toBe('complete')
    expect(cathedral?.relationships).toContainEqual(expect.objectContaining({
      relation: 'replaces_function_of',
      target_id: 'religious.medina-great-mosque',
    }))
  })

  it('mantiene las geometrías auditadas y privadas hasta una aprobación responsable', () => {
    expect(review.status).toBe('ready_for_specialist_review')
    expect(review.signoffs.map((signoff) => signoff.discipline).sort()).toEqual([
      'architectural',
      'geometry',
      'historical',
      'translation',
    ])
    expect(review.signoffs.every((signoff) => signoff.status === 'pending')).toBe(true)

    for (const item of review.items) {
      expect(item.readiness).toBe('ready_for_specialist_review')
      expect(item.geometry_review.audit_status).toBe('in_review')
      expect(pointById.get(item.feature_id)?.properties.publication_status).toBe('research')
      expect(pointById.get(item.feature_id)?.geometry.type).toBe('Point')
      expect(auditById.get(item.feature_id)?.status).toBe('in_review')
    }
  })

  it('rechaza una promoción reviewed sin las cuatro aprobaciones identificadas', () => {
    const premature = JSON.parse(JSON.stringify(reviewJson)) as Record<string, unknown>
    premature.status = 'reviewed'
    expect(() => c1550VerticalSliceReviewSchema.parse(premature)).toThrow()
  })
})
