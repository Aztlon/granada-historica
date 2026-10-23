import { z } from 'zod'
import registry from '../../data/translations/gazetteer-en.json'
import type { GazetteerEntry } from './schema'
import type { Locale } from '../i18n/types'

export const gazetteerTrancheIds = [
  'gaz.royal.alhambra', 'gaz.royal.generalife', 'gaz.gate.elvira',
  'gaz.gate.alhambra-arms', 'gaz.gate.alhambra-justice', 'gaz.commerce.corral-carbon',
  'gaz.civic.maristan', 'gaz.water.banuelo', 'gaz.urban.albaicin', 'gaz.urban.lower-medina',
] as const

export const gazetteerTranslationSchema = z.object({
  date_note: z.string().trim().min(1),
  attestation_note: z.string().trim().min(1),
  survival_note: z.string().trim().min(1),
  notes: z.string().trim().min(1),
}).strict()

export const gazetteerTranslationsSchema = z.object({
  entries: z.record(z.enum(gazetteerTrancheIds), gazetteerTranslationSchema),
}).strict()

export const englishGazetteerTranslations: Readonly<Record<string, unknown>> = registry.entries

// Never assemble a partially translated panel. Unsupported entries retain the
// previous English behavior (no panel); Spanish always returns the original.
export function localizeGazetteerEntry(
  entry: GazetteerEntry,
  locale: Locale,
  translations: Readonly<Record<string, unknown>> = englishGazetteerTranslations,
): GazetteerEntry | null {
  if (locale === 'es') return entry
  if (entry.defensive_context) return null
  const result = gazetteerTranslationSchema.safeParse(translations[entry.id])
  if (!result.success) return null
  const translation = result.data
  return {
    ...entry,
    name_attestation: { ...entry.name_attestation, date_note: translation.date_note, note: translation.attestation_note },
    survival: { ...entry.survival, note: translation.survival_note },
    notes: translation.notes,
  }
}
