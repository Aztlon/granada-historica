import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlaceResources } from './PlaceResources'
import { placeResources } from '../data/placeResources'
import { sourcesById } from '../data/historicalData'
import { testImage } from '../test/placeResources.fixture'
import type { PlaceResources as Resources } from '../data/placeResourcesSchema'

const illustrated: Resources = { entity_id: 'gate.bib-rambla', images: [testImage], further_reading: [] }

describe('PlaceResources', () => {
  it('adds no UI for absent resources or an empty locale', () => {
    const { container, rerender } = render(<PlaceResources locale="en" sourcesById={sourcesById} />)
    expect(container).toBeEmptyDOMElement()
    rerender(<PlaceResources locale="en" sourcesById={sourcesById} resources={{
      entity_id: 'gate.elvira', images: [], further_reading: [{ id: 'es-only', kind: 'other', links: {
        es: { title: 'Solo español', url: 'https://example.test' },
      } }],
    }} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the unillustrated example and switches verified locale links without invented URLs', () => {
    const { rerender } = render(<PlaceResources locale="en" resources={placeResources[0]} sourcesById={sourcesById} />)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByText(/No visual reconstruction of 1492/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'Gate of Bibarrambla — Wikipedia' })).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Gate_of_Bibarrambla')
    expect(screen.getByText(/do not replace its cited evidence/)).toBeVisible()
    rerender(<PlaceResources locale="es" resources={placeResources[0]} sourcesById={sourcesById} />)
    expect(screen.getByRole('link', { name: 'Puerta de Bib-Rambla — Wikipedia' })).toHaveAttribute('href', 'https://es.wikipedia.org/wiki/Puerta_de_Bib-Rambla')
    expect(screen.getByText(/El arco reconstruido en el bosque/)).toBeVisible()
  })

  it('uses lazy local images with accessible text and persistent provenance after a load error', () => {
    render(<PlaceResources locale="en" resources={illustrated} sourcesById={sourcesById} />)
    const image = screen.getByRole('img', { name: 'Test arch.' })
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('decoding', 'async')
    expect(image.getAttribute('src')).toMatch(/\/media\/test\/fixture.jpg$/)
    expect(image).toHaveAttribute('width', '600')
    expect(screen.getByText('Historical depiction')).toBeVisible()
    expect(screen.getByText(/Historical review pending/)).toBeVisible()
    fireEvent.error(image)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Image unavailable. Test arch.')
    expect(screen.getByText('Later depiction (fixture).')).toBeVisible()
    expect(screen.getByText('Does not represent 1492 (fixture).')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Test license' })).toBeVisible()
    expect(screen.getByText(/Test fixture credit/)).toBeVisible()
  })

  it('keeps links in keyboard order with no new window or custom keyboard controls', async () => {
    const user = userEvent.setup()
    render(<PlaceResources locale="en" resources={illustrated} sourcesById={sourcesById} />)
    for (const link of screen.getAllByRole('link')) {
      await user.tab()
      expect(link).toHaveFocus()
      expect(link).not.toHaveAttribute('target', '_blank')
    }
  })

  it('labels photographs separately and exposes reconstruction component confidence in text', () => {
    const { rerender } = render(<PlaceResources locale="en" resources={{ ...illustrated, images: [{ ...testImage, kind: 'present_day_photograph' }] }} sourcesById={sourcesById} />)
    expect(screen.getByText('Present-day photograph')).toBeVisible()
    rerender(<PlaceResources locale="en" resources={{ ...illustrated, images: [{
      ...testImage, kind: 'interpretive_reconstruction',
      review: { ...testImage.review, status: 'reviewed', reviewer: 'Synthetic test reviewer' },
      components: [{ label: { en: 'Roof', es: 'Cubierta' }, confidence: 'artistic_inference',
        explanation: testImage.uncertainty, source_refs: ['source.alhambra-bib-rambla-gate'] }],
    }] }} sourcesById={sourcesById} />)
    expect(screen.getByText('Interpretive reconstruction')).toBeVisible()
    expect(screen.getByText('Roof — Artistic inference')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Puerta de Bibarrambla' })).toBeVisible()
  })
})
