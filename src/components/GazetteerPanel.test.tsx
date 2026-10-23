import { render, screen } from '@testing-library/react'
import { GazetteerPanel } from './GazetteerPanel'
import { gazetteer } from '../data/historicalData'
import { gazetteerTrancheIds, localizeGazetteerEntry } from '../data/gazetteerTranslations'

const entry = (id: string) => gazetteer.find((candidate) => candidate.id === id)!

describe('GazetteerPanel', () => {
  it.each(gazetteerTrancheIds)('shows all evidence in English and canonical Spanish when switching %s', (id) => {
    const original = entry(id)
    const en = localizeGazetteerEntry(original, 'en')!
    const { rerender } = render(<GazetteerPanel entry={original} locale="en" />)
    expect(screen.getByRole('heading', { name: 'Name and survival' })).toBeVisible()
    for (const value of [en.name_attestation.note, en.name_attestation.date_note, en.survival.note, en.notes]) {
      expect(screen.getByText(value)).toBeVisible()
    }
    if (original.name_attestation.attested_name) expect(screen.getByText(original.name_attestation.attested_name)).toBeVisible()
    expect(screen.queryByText('Recinto')).toBeNull()
    rerender(<GazetteerPanel entry={original} locale="es" />)
    expect(screen.getByRole('heading', { name: 'Nombre y supervivencia' })).toBeVisible()
    for (const value of [original.name_attestation.note, original.name_attestation.date_note, original.survival.note, original.notes]) {
      expect(screen.getByText(value)).toBeVisible()
    }
    expect(screen.queryByText(en.name_attestation.note)).toBeNull()
  })

  it('retains the previous behavior for the other sixty entries', () => {
    const { rerender, container } = render(<GazetteerPanel entry={entry('gaz.gate.monaita')} locale="en" />)
    for (const original of gazetteer.filter((candidate) => !localizeGazetteerEntry(candidate, 'en'))) {
      rerender(<GazetteerPanel entry={original} locale="en" />)
      expect(container).toBeEmptyDOMElement()
      rerender(<GazetteerPanel entry={original} locale="es" />)
      expect(screen.getByText(original.name_attestation.note)).toBeVisible()
      expect(screen.getByText(original.survival.note)).toBeVisible()
      expect(screen.queryByText(original.name_attestation.date_note)).toBeNull()
      if (original.defensive_context) expect(screen.getByText(original.defensive_context.relationship_note)).toBeVisible()
    }
  })
})
