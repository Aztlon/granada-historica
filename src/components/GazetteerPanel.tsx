import type { Locale } from '../i18n/types'
import type { GazetteerEntry } from '../data/schema'
import { localizeGazetteerEntry } from '../data/gazetteerTranslations'

export function GazetteerPanel({ entry, locale }: { entry: GazetteerEntry; locale: Locale }) {
  const localized = localizeGazetteerEntry(entry, locale)
  if (!localized) return null
  const en = locale === 'en'
  // Only the selected tranche gains the additional existing name/date/notes
  // evidence in both locales. Other Spanish panels retain their previous fields.
  const complete = localizeGazetteerEntry(entry, 'en') !== null
  return (
    <section className="gazetteer-panel" aria-labelledby="gazetteer-title">
      <p className="panel-kicker">{en ? 'Historical gazetteer' : 'Nomenclátor histórico'}</p>
      <h3 id="gazetteer-title">{en ? 'Name and survival' : 'Nombre y supervivencia'}</h3>
      <dl className="confidence-list">
        <div>
          <dt>{en ? 'Attestation' : 'Atestación'}</dt>
          <dd>
            <strong>{(en ? ENGLISH_NAME_LABELS : NAME_ATTESTATION_LABELS)[localized.name_attestation.status]}</strong>
            {complete && <>
              {localized.name_attestation.attested_name && <span>{localized.name_attestation.attested_name}</span>}
              <span>{localized.name_attestation.date_note}</span>
            </>}
            <span>{localized.name_attestation.note}</span>
          </dd>
        </div>
        <div>
          <dt>{en ? 'Survival' : 'Supervivencia'}</dt>
          <dd>
            <strong>{(en ? ENGLISH_SURVIVAL_LABELS : SURVIVAL_LABELS)[localized.survival.status]}</strong>
            <span>{localized.survival.note}</span>
          </dd>
        </div>
        {localized.defensive_context && <div>
          <dt>Recinto</dt>
          <dd>
            <strong>{DEFENSIVE_ROLE_LABELS[localized.defensive_context.role]}</strong>
            <span>{localized.defensive_context.relationship_note}</span>
          </dd>
        </div>}
      </dl>
      {complete && <p className="evidence-note">{localized.notes}</p>}
    </section>
  )
}

const ENGLISH_NAME_LABELS: Record<GazetteerEntry['name_attestation']['status'], string> = {
  contemporary_documentary: 'Contemporary documentation',
  near_contemporary: 'Near-contemporary documentation',
  later_documentary: 'Later documentation',
  modern_conventional: 'Conventional modern name',
  reconstructed: 'Reconstructed analytical name',
  uncertain: 'Uncertain attestation',
}
const ENGLISH_SURVIVAL_LABELS: Record<GazetteerEntry['survival']['status'], string> = {
  surviving: 'Surviving', partial: 'Partly surviving', lost: 'Lost', buried: 'Buried or covered',
  landscape_continuity: 'Continuity of landscape or urban fabric', unknown: 'Not assessed', not_applicable: 'Not applicable',
}
const NAME_ATTESTATION_LABELS: Record<GazetteerEntry['name_attestation']['status'], string> = {
  contemporary_documentary: 'Documentación coetánea',
  near_contemporary: 'Documentación próxima en el tiempo',
  later_documentary: 'Documentación posterior',
  modern_conventional: 'Denominación moderna convencional',
  reconstructed: 'Nombre analítico reconstruido',
  uncertain: 'Atestación incierta',
}

const SURVIVAL_LABELS: Record<GazetteerEntry['survival']['status'], string> = {
  surviving: 'Conservado',
  partial: 'Conservación parcial',
  lost: 'Desaparecido',
  buried: 'Enterrado o cubierto',
  landscape_continuity: 'Continuidad del paisaje o la trama',
  unknown: 'Sin evaluar',
  not_applicable: 'No aplicable',
}

const DEFENSIVE_ROLE_LABELS: Record<NonNullable<GazetteerEntry['defensive_context']>['role'], string> = {
  outer_enclosure: 'Cerca exterior',
  inner_enclosure: 'Cerca interior',
  palatine_enclosure: 'Recinto palatino',
  unknown: 'Relación defensiva incierta',
}

