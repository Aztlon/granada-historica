import { testImage } from '../test/placeResources.fixture'
import { placeResourcesRegistrySchema, placeResourcesSchema, placeImageSchema } from './placeResourcesSchema'
import { placeResources } from './placeResources'
import { historicalFeatureCollection, sourcesById } from './historicalData'

const empty = { entity_id: 'gate.bib-rambla', images: [], further_reading: [] }

describe('optional place resources', () => {
  it('keeps a single text-only Bab al-Ramla example with real canonical context sources', () => {
    expect(placeResources).toHaveLength(1)
    expect(placeResources[0].entity_id).toBe('gate.bib-rambla')
    expect(placeResources[0].images).toEqual([])
    expect(historicalFeatureCollection.features.some(({ id }) => id === placeResources[0].entity_id)).toBe(true)
    for (const id of placeResources[0].context!.source_refs) expect(sourcesById.has(id)).toBe(true)
    expect(placeResources[0].further_reading.find(({ kind }) => kind === 'wikipedia')?.links.en?.url)
      .toBe('https://en.wikipedia.org/wiki/Gate_of_Bibarrambla')
  })

  it('accepts text-only and localized-reading-only resources', () => {
    expect(placeResourcesSchema.safeParse(empty).success).toBe(true)
    expect(placeResourcesSchema.safeParse({ ...empty, further_reading: [{
      id: 'test', kind: 'other', links: { es: { title: 'Prueba', url: 'https://example.test' } },
    }] }).success).toBe(true)
  })

  it.each([
    { path: 'https://example.test/hotlinked.jpg' },
    { path: 'media/../secret.jpg' },
    { path: 'media/test/script.svg' },
    { bytes: 200_001 },
    { width: 1601 },
    { source_url: 'javascript:alert(1)' },
    { source_url: 'not a URL' },
    { source_url: 'https://user:password@example.test/image' },
    { author: '' },
    { represented_date: { es: 'Fecha', en: '' } },
    { alt: { es: 'Imagen', en: '' } },
    { rights: { ...testImage.rights, status: 'unknown' } },
    { review: { ...testImage.review, status: 'reviewed', reviewer: null } },
    { kind: 'interpretive_reconstruction' },
  ])('rejects unsafe, incomplete or unreviewed media: %j', (patch) => {
    expect(placeImageSchema.safeParse({ ...testImage, ...patch }).success).toBe(false)
  })

  it('enforces both per-place budget and unique registry entries', () => {
    const image = { ...testImage, bytes: 160_000 }
    expect(placeResourcesSchema.safeParse({ ...empty, images: [image, { ...image, id: 'second' }] }).success).toBe(false)
    expect(placeResourcesSchema.safeParse({ ...empty, images: [testImage, testImage] }).success).toBe(false)
    expect(placeResourcesRegistrySchema.safeParse({ schema_version: 1, places: [empty, empty] }).success).toBe(false)
  })

  it('requires accountable review and component evidence for interpretive reconstructions', () => {
    const reconstruction = {
      ...testImage, kind: 'interpretive_reconstruction',
      review: { ...testImage.review, status: 'reviewed', reviewer: 'Synthetic test reviewer' },
    }
    expect(placeImageSchema.safeParse(reconstruction).success).toBe(false)
    expect(placeImageSchema.safeParse({ ...reconstruction, components: [{
      label: testImage.title, confidence: 'artistic_inference', explanation: testImage.uncertainty,
      source_refs: ['source.alhambra-bib-rambla-gate'],
    }] }).success).toBe(true)
  })
})
