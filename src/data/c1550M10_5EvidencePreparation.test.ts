import { describe, expect, it } from 'vitest'
import candidateJson from '../../data/research/c1550/m10.5-candidate.json'
import evidenceJson from '../../data/research/c1550/m10.5-evidence-preparation.json'
import manifestJson from '../../data/research/c1550/manifest.json'
import sourcesJson from '../../data/sources.json'
import { sourceRegistrySchema } from './schema'
import {
  c1550M10_5CandidateSchema,
  c1550M10_5EvidencePreparationSchema,
  c1550ResearchPackageManifestSchema,
  M10_5_EVIDENCE_WORKSTREAM_IDS,
  M10_5_PUBLIC_SPACE_FEATURE_IDS,
} from './temporalSchema'

const evidence = c1550M10_5EvidencePreparationSchema.parse(evidenceJson)
const candidate = c1550M10_5CandidateSchema.parse(candidateJson)
const manifest = c1550ResearchPackageManifestSchema.parse(manifestJson)
const sources = sourceRegistrySchema.parse(sourcesJson)

function collectForbiddenSpatialKeys(value: unknown, path = '$'): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectForbiddenSpatialKeys(entry, `${path}[${index}]`))
  }
  if (!value || typeof value !== 'object') return []

  return Object.entries(value).flatMap(([key, entry]) => {
    const currentPath = `${path}.${key}`
    const ownMatch = ['geometry', 'coordinates', 'bbox'].includes(key) ? [currentPath] : []
    return [...ownMatch, ...collectForbiddenSpatialKeys(entry, currentPath)]
  })
}

describe('M10.5 deferred-polygon evidence preparation', () => {
  it('covers each deferred analytical layer once and remains non-public', () => {
    expect(evidence.workstreams.map(({ workstream_id }) => workstream_id)).toEqual(
      expect.arrayContaining([...M10_5_EVIDENCE_WORKSTREAM_IDS]),
    )
    expect(new Set(evidence.workstreams.map(({ analytical_layer_id }) => analytical_layer_id)).size)
      .toBe(candidate.analytical_layers.length)
    expect(evidence.public_application_import).toBe(false)
    expect(evidence.geometry_created).toBe(false)
    expect(manifest.evidence_preparation_path)
      .toBe('data/research/c1550/m10.5-evidence-preparation.json')
  })

  it('links every deferred layer to the matching not-ready workstream', () => {
    const workstreamById = new Map(
      evidence.workstreams.map((workstream) => [workstream.workstream_id, workstream]),
    )

    for (const layer of candidate.analytical_layers) {
      const workstream = workstreamById.get(layer.evidence_preparation_ref)
      expect(workstream?.analytical_layer_id).toBe(layer.layer_id)
      expect(workstream?.readiness_gate.ready).toBe(false)
      expect(workstream?.readiness_gate.blockers.length).toBeGreaterThan(0)
    }
  })

  it('inventories all three public spaces without deriving an envelope', () => {
    const workstream = evidence.workstreams.find(
      ({ workstream_id }) => workstream_id === 'evidence.public-spaces',
    )
    expect(workstream?.public_space_subjects?.map(({ feature_id }) => feature_id)).toEqual(
      M10_5_PUBLIC_SPACE_FEATURE_IDS,
    )
    expect(workstream?.public_space_subjects?.every(
      ({ derivability, missing_inputs }) => derivability === 'not_derivable' && missing_inputs.length > 0,
    )).toBe(true)
  })

  it('defines a provenance-first population corpus and blocks identity inference', () => {
    const workstream = evidence.workstreams.find(
      ({ workstream_id }) => workstream_id === 'evidence.population-corpus',
    )
    const fieldIds = workstream?.corpus_model?.fields.map(({ field_id }) => field_id) ?? []
    expect(fieldIds).toEqual(expect.arrayContaining([
      'source_id',
      'archival_locator',
      'record_date',
      'historical_category',
      'place_literal',
      'spatial_confidence',
      'exclusion_reason',
    ]))
    expect(workstream?.corpus_model?.identity_rule).toMatch(/no autorizan inferencias/i)
    expect(workstream?.non_goals.join(' ')).toMatch(/No producir polígonos moriscos o cristianos/i)
  })

  it('resolves every registered evidence source and contains no spatial payload', () => {
    const sourceIds = new Set(sources.map(({ id }) => id))
    const referencedSourceIds = evidence.workstreams.flatMap(({ inputs }) =>
      inputs.flatMap(({ source_refs }) => source_refs),
    )
    expect(referencedSourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true)
    expect(collectForbiddenSpatialKeys(evidence)).toEqual([])
  })
})
