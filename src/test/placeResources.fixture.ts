import type { PlaceImage } from '../data/placeResourcesSchema'

// Synthetic metadata for component/schema tests only. No image is shipped or claimed as real.
export const testImage: PlaceImage = {
  id: 'test-image',
  kind: 'historical_depiction',
  path: 'media/test/fixture.jpg',
  width: 600,
  height: 400,
  bytes: 1200,
  sha256: '0'.repeat(64),
  title: { es: 'Imagen de prueba', en: 'Test image' },
  author: 'Test fixture author',
  represented_date: { es: 'Siglo XIX (prueba)', en: 'Nineteenth century (fixture)' },
  source_url: 'https://example.test/image',
  rights: {
    status: 'verified', label: 'Test license', url: 'https://example.test/license',
    evidence_url: 'https://example.test/rights', attribution: 'Test fixture credit',
    changes: { es: 'Sin cambios (prueba).', en: 'Unchanged (fixture).' },
  },
  caption: { es: 'Representación posterior (prueba).', en: 'Later depiction (fixture).' },
  alt: { es: 'Arco de prueba.', en: 'Test arch.' },
  location_note: { es: 'Lugar original (prueba).', en: 'Original site (fixture).' },
  uncertainty: { es: 'No representa 1492 (prueba).', en: 'Does not represent 1492 (fixture).' },
  review: { status: 'pending', reviewer: null, note: { es: 'Revisión de prueba.', en: 'Test review note.' } },
  components: [],
}
