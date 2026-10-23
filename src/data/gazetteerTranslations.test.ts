import canonical from '../../data/gazetteer.json'
import registry from '../../data/translations/gazetteer-en.json'
import { gazetteer } from './historicalData'
import { englishGazetteerTranslations, gazetteerTrancheIds, gazetteerTranslationsSchema, gazetteerTranslationSchema, localizeGazetteerEntry } from './gazetteerTranslations'

const entries = new Map(gazetteer.map((entry) => [entry.id, entry]))

describe('gazetteer English tranche', () => {
  it('covers exactly ten of seventy entries without defensive context', () => {
    expect(gazetteer).toHaveLength(70)
    const parsed = gazetteerTranslationsSchema.parse(registry)
    expect(Object.keys(parsed.entries).sort()).toEqual([...gazetteerTrancheIds].sort())
    expect(gazetteer.filter((entry) => !localizeGazetteerEntry(entry, 'en'))).toHaveLength(60)
  })

  it.each(gazetteerTrancheIds)('fully translates %s without changing names, codes, references or canonical Spanish', (id) => {
    const entry = entries.get(id)!
    const before = structuredClone(entry)
    const translation = gazetteerTranslationSchema.parse(englishGazetteerTranslations[id])
    const english = localizeGazetteerEntry(entry, 'en')!
    expect(entry.feature_id).toBe(id.slice(4))
    expect(entry.defensive_context).toBeUndefined()
    expect(english.name_attestation.note).toBe(translation.attestation_note)
    expect(english.name_attestation.date_note).toBe(translation.date_note)
    expect(english.survival.note).toBe(translation.survival_note)
    expect(english.notes).toBe(translation.notes)
    expect({ ...english, name_attestation: { ...english.name_attestation,
      date_note: entry.name_attestation.date_note, note: entry.name_attestation.note },
      survival: { ...english.survival, note: entry.survival.note }, notes: entry.notes }).toEqual(before)
    expect(english.source_refs).toEqual(entry.source_refs)
    expect(english.name_attestation.source_refs).toEqual(entry.name_attestation.source_refs)
    expect(localizeGazetteerEntry(entry, 'es')).toBe(entry)
    expect(entry).toEqual(before)
    expect(entry).toEqual(canonical.find((candidate) => candidate.id === id))
  })

  it.each(['date_note', 'attestation_note', 'survival_note', 'notes'])('hides incomplete English panels missing %s', (field) => {
    const entry = entries.get('gaz.water.banuelo')!
    const partial = { ...registry.entries['gaz.water.banuelo'], [field]: undefined }
    expect(localizeGazetteerEntry(entry, 'en', { [entry.id]: partial })).toBeNull()
    expect(localizeGazetteerEntry(entry, 'es', { [entry.id]: partial })).toBe(entry)
    expect(gazetteerTranslationsSchema.safeParse({ entries: { ...registry.entries, [entry.id]: partial } }).success).toBe(false)
  })

  it('does not invent defensive-context translations or silently add coverage', () => {
    const entry = entries.get('gaz.water.banuelo')!
    expect(localizeGazetteerEntry({ ...entry, defensive_context: {
      phase: 'test', role: 'unknown', in_use_c1492: 'approximate', relationship_note: 'Prueba',
    } }, 'en')).toBeNull()
    expect(gazetteerTranslationsSchema.safeParse({ entries: { ...registry.entries, 'gaz.extra': registry.entries['gaz.water.banuelo'] } }).success).toBe(false)
  })

  it('preserves explicit qualifications in the complete English evidence', () => {
    expect(registry.entries['gaz.royal.generalife'].attestation_note).toContain('variants')
    expect(registry.entries['gaz.water.banuelo'].date_note).toContain('debated chronology')
    expect(registry.entries['gaz.urban.albaicin'].attestation_note).toContain('several nuclei and suburbs')
    expect(registry.entries['gaz.urban.lower-medina'].attestation_note).toContain('analytical')
    expect(registry.entries['gaz.urban.lower-medina'].notes).toContain('does not claim that they all formed a single neighbourhood')
  })
})
