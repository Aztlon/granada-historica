import { useEffect, useRef, type ReactNode } from 'react'
import {
  SUBTYPE_LABELS,
} from '../data/categories'
import { gazetteerSummary } from '../data/historicalData'
import type {
  ComparisonPeriod,
  InternalPeriodDetail,
  PeriodUnavailableSelection,
} from '../data/internalComparisonTypes'
import type { LocalizedEntityPresentation } from '../data/entityPresentation'
import type { GazetteerEntry, HistoricalFeature, HistoricalSource } from '../data/schema'
import type { Messages } from '../i18n/messages'

interface FeatureDrawerProps {
  isOpen: boolean
  feature: HistoricalFeature | null
  gazetteerEntry: GazetteerEntry | null
  sourcesById: ReadonlyMap<string, HistoricalSource>
  onClose: () => void
  isLanguageFallback: boolean
  presentation?: LocalizedEntityPresentation | null
  periodDetail?: InternalPeriodDetail | null
  unavailableSelection?: PeriodUnavailableSelection | null
  onSelectPeriod?: (period: ComparisonPeriod) => void
  currentPeriod?: ComparisonPeriod
  text: Messages
}

export function FeatureDrawer({
  isOpen,
  feature,
  gazetteerEntry,
  sourcesById,
  onClose,
  isLanguageFallback,
  presentation = null,
  periodDetail = null,
  unavailableSelection = null,
  onSelectPeriod,
  currentPeriod = 'c1492',
  text,
}: FeatureDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    returnFocusRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !drawerRef.current) return
      const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable.at(-1) ?? first
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      returnFocusRef.current?.focus()
    }
  }, [isOpen, onClose])

  return (
    <>
      <button
        className={`drawer-backdrop ${isOpen ? 'drawer-backdrop--visible' : ''}`}
        type="button"
        aria-label={text.dismissPanel}
        aria-hidden={!isOpen}
        disabled={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        className={`feature-drawer ${isOpen ? 'feature-drawer--open' : ''}`}
        role="dialog"
        aria-modal={isOpen}
        aria-labelledby="drawer-title"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="drawer-handle" aria-hidden="true" />
        <div className="drawer-header">
          <div>
            <p className="panel-kicker">
              {periodDetail
                ? text.categoryLabels[periodDetail.feature.properties.category]
                : feature
                  ? text.categoryLabels[feature.properties.category]
                  : unavailableSelection
                    ? (text.locale === 'en' ? 'Period comparison' : 'Comparación de periodos')
                    : text.aboutProject}
            </p>
            <h2 id="drawer-title">
              {feature?.properties.name ?? unavailableSelection?.name ?? text.projectTitle}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            className="icon-button"
            type="button"
            aria-label={text.closePanel}
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {feature && onSelectPeriod && (
          <div className="drawer-period-switch" role="group" aria-label={text.locale === 'en' ? 'Compare historical period' : 'Comparar periodo histórico'}>
            <span>{text.locale === 'en' ? `Viewing ${currentPeriod === 'c1492' ? 'c. 1492' : 'c. 1550'}` : `Vista ${currentPeriod === 'c1492' ? 'c. 1492' : 'c. 1550'}`}</span>
            <button
              type="button"
              onClick={() => onSelectPeriod(currentPeriod === 'c1492' ? 'c1550' : 'c1492')}
            >
              {text.locale === 'en'
                ? `Compare in ${currentPeriod === 'c1492' ? 'c. 1550' : 'c. 1492'}`
                : `Comparar en ${currentPeriod === 'c1492' ? 'c. 1550' : 'c. 1492'}`}
            </button>
          </div>
        )}

        {periodDetail ? (
          <PeriodFeatureDetails detail={periodDetail} sourcesById={sourcesById} text={text} />
        ) : unavailableSelection && onSelectPeriod ? (
          <UnavailablePeriodDetails
            selection={unavailableSelection}
            onSelectPeriod={onSelectPeriod}
            text={text}
          />
        ) : feature ? (
          <FeatureDetails
            feature={feature}
            gazetteerEntry={gazetteerEntry}
            sourcesById={sourcesById}
            isLanguageFallback={isLanguageFallback}
            presentation={presentation}
            text={text}
          />
        ) : (
          <ProjectIntroduction text={text} />
        )}
      </aside>
    </>
  )
}

function ProjectIntroduction({ text }: { text: Messages }) {
  const en = text.locale === 'en'
  return (
    <div className="drawer-content">
      <p className="drawer-lede">
        {en
          ? 'Granada Histórica compares the present-day city with a documented reconstruction of Granada in the final years of the Nasrid kingdom.'
          : 'Granada Histórica te permite comparar la ciudad actual con una reconstrucción documentada de la Granada de los últimos años del reino nazarí.'}
      </p>

      <div className="principle-card">
        <span className="principle-card__number">01</span>
        <div>
          <h3>{en ? 'Sources remain visible' : 'Las fuentes, siempre a la vista'}</h3>
          <p>
            {en ? 'Every published feature explains the sources supporting its location, date and interpretation.' : 'Cada elemento publicado explica qué fuentes respaldan su ubicación, fecha e interpretación.'}
          </p>
        </div>
      </div>

      <div className="principle-card">
        <span className="principle-card__number">02</span>
        <div>
          <h3>{en ? 'Uncertainty is part of the map' : 'La incertidumbre forma parte del mapa'}</h3>
          <p>
            {en ? 'Secure, probable, approximate and disputed reconstructions are never presented as if they had equal certainty.' : 'Las reconstrucciones seguras, probables, aproximadas o controvertidas nunca se muestran como si tuviesen el mismo grado de certeza.'}
          </p>
        </div>
      </div>

      <div className="milestone-note">
        <span className="status-dot" aria-hidden="true" />
        <div>
          <strong>{en ? 'M6 · Inventory and territorial context' : 'M6 · Inventario y contexto territorial'}</strong>
          <p>
            {en
              ? `The gazetteer contains ${gazetteerSummary.total} entities: ${gazetteerSummary.mapped} mapped and ${gazetteerSummary.unresolved} pending, disputed, rejected or still unlocated.`
              : `El nomenclátor reúne ${gazetteerSummary.total} entidades: ${gazetteerSummary.mapped} cartografiadas y ${gazetteerSummary.unresolved} pendientes, discutidas, rechazadas o aún sin localizar.`}
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureDetails({
  feature,
  gazetteerEntry,
  sourcesById,
  isLanguageFallback,
  presentation,
  text,
}: {
  feature: HistoricalFeature
  gazetteerEntry: GazetteerEntry | null
  sourcesById: ReadonlyMap<string, HistoricalSource>
  isLanguageFallback: boolean
  presentation: LocalizedEntityPresentation | null
  text: Messages
}) {
  const { properties } = feature

  return (
    <div className="drawer-content feature-details">
      <div className="feature-meta">
        <span>{subtypeLabel(properties.subtype, text.locale)}</span>
        <span>{text.confidenceLabels[properties.confidence.location]}</span>
      </div>

      {(isLanguageFallback || presentation?.isLanguageFallback) && (
        <p className="language-fallback" role="note">{text.fallback}</p>
      )}

      {properties.modern_name && properties.modern_name !== properties.name && (
        <p className="modern-name">{text.todayPrefix}: {properties.modern_name}</p>
      )}

      <p className="drawer-lede">{presentation?.generalDescription ?? properties.summary}</p>

      <DetailSection title={text.whatHere}>
        <p>{properties.context_1492}</p>
      </DetailSection>
      <DetailSection title={text.whatAfter}>
        <p>{properties.after_1492}</p>
      </DetailSection>
      <DetailSection title={text.whatToday}>
        <p>{properties.today}</p>
      </DetailSection>

      {gazetteerEntry && text.locale === 'es' && (
        <section className="gazetteer-panel" aria-labelledby="gazetteer-title">
          <p className="panel-kicker">Nomenclátor histórico</p>
          <h3 id="gazetteer-title">Nombre y supervivencia</h3>
          <dl className="confidence-list">
            <div>
              <dt>Atestación</dt>
              <dd>
                <strong>{NAME_ATTESTATION_LABELS[gazetteerEntry.name_attestation.status]}</strong>
                <span>{gazetteerEntry.name_attestation.note}</span>
              </dd>
            </div>
            <div>
              <dt>Supervivencia</dt>
              <dd>
                <strong>{SURVIVAL_LABELS[gazetteerEntry.survival.status]}</strong>
                <span>{gazetteerEntry.survival.note}</span>
              </dd>
            </div>
            {gazetteerEntry.defensive_context && (
              <div>
                <dt>Recinto</dt>
                <dd>
                  <strong>{DEFENSIVE_ROLE_LABELS[gazetteerEntry.defensive_context.role]}</strong>
                  <span>{gazetteerEntry.defensive_context.relationship_note}</span>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="evidence-panel" aria-labelledby="evidence-title">
        <p className="panel-kicker">{text.evidenceKicker}</p>
        <h3 id="evidence-title">{text.evidenceTitle}</h3>
        <dl className="confidence-list">
          <div>
            <dt>{text.location}</dt>
            <dd>
              <strong>{text.confidenceLabels[properties.confidence.location]}</strong>
              <span>{text.confidenceDescriptions[properties.confidence.location]}</span>
            </dd>
          </div>
          <div>
            <dt>{text.date1492}</dt>
            <dd>
              <strong>{text.confidenceLabels[properties.confidence.time]}</strong>
              <span>{text.confidenceDescriptions[properties.confidence.time]}</span>
            </dd>
          </div>
          <div>
            <dt>{text.evidence}</dt>
            <dd>{properties.evidence_basis.map((item) => text.evidenceLabels[item]).join(' · ')}</dd>
          </div>
          <div>
            <dt>{text.geometry}</dt>
            <dd>{text.geometryLabels[properties.geometry_method]}</dd>
          </div>
        </dl>
        <p className="evidence-note">{properties.evidence_note}</p>
      </section>

      <SourceList citations={properties.citations} sourcesById={sourcesById} text={text} />
    </div>
  )
}

function PeriodFeatureDetails({
  detail,
  sourcesById,
  text,
}: {
  detail: InternalPeriodDetail
  sourcesById: ReadonlyMap<string, HistoricalSource>
  text: Messages
}) {
  const { feature, review, localizedFeature } = detail
  const properties = feature.properties
  const content = review.content[text.locale]
  const en = text.locale === 'en'
  const pending = detail.signoffs.filter((signoff) => signoff.status !== 'approved').length

  return (
    <div className="drawer-content feature-details period-feature-details">
      <div className="feature-meta" aria-label={en ? 'Historical state' : 'Estado histórico'}>
        <span>{subtypeLabel(properties.subtype, text.locale)}</span>
        <span>{changeLabel(properties.change_from_previous, text.locale)}</span>
        <span>{physicalStateLabel(properties.physical_state, text.locale)}</span>
      </div>

      <div className="internal-review-note internal-review-note--compact" role="note">
        <strong>{en ? 'Research state — not approved for publication' : 'Estado de investigación — no aprobado para publicación'}</strong>
      </div>

      {detail.localizedPresentation.isLanguageFallback && (
        <p className="language-fallback" role="note">{text.fallback}</p>
      )}

      <p className="drawer-lede">{detail.localizedPresentation.generalDescription}</p>

      <DetailSection title={en ? 'What was here around 1550?' : '¿Qué había aquí hacia 1550?'}>
        <p>{content.summary}</p>
      </DetailSection>

      <DetailSection title={en ? 'What function did it serve around 1550?' : '¿Qué función cumplía hacia 1550?'}>
        <p>{content.function}</p>
      </DetailSection>
      <DetailSection title={en ? 'Change from the 1492 state' : 'Cambio respecto al estado de 1492'}>
        <p>{content.change_note}</p>
      </DetailSection>
      <DetailSection title={en ? 'Cartographic decision' : 'Decisión cartográfica'}>
        <p>{review.geometry_review.decision[text.locale]}</p>
        <p className="ambiguity-note">{review.geometry_review.overlap_resolution[text.locale]}</p>
      </DetailSection>

      <DetailSection title={en ? 'Relationships around 1550' : 'Relaciones hacia 1550'}>
        <ul className="relationship-list">
          {review.relationships.map((relationship) => (
            <li key={`${relationship.relation}:${relationship.target_id}`}>
              <strong>{relationshipLabel(relationship.relation, text.locale)}</strong>
              <p>{relationship.note[text.locale]}</p>
            </li>
          ))}
        </ul>
      </DetailSection>

      <section className="evidence-panel" aria-labelledby="period-evidence-title">
        <p className="panel-kicker">{text.evidenceKicker}</p>
        <h3 id="period-evidence-title">{text.evidenceTitle}</h3>
        <dl className="confidence-list">
          <div>
            <dt>{en ? 'Research review' : 'Revisión de investigación'}</dt>
            <dd>
              <strong>{en ? `${pending} of ${detail.signoffs.length} sign-offs pending` : `${pending} de ${detail.signoffs.length} aprobaciones pendientes`}</strong>
              <span>{en ? `Internal ${detail.milestone} candidate; not approved for publication.` : `Candidato interno ${detail.milestone}; no aprobado para publicación.`}</span>
            </dd>
          </div>
          <div>
            <dt>{en ? 'Evidence window' : 'Ventana documental'}</dt>
            <dd>{en ? '1540–1560 for the c. 1550 snapshot' : '1540–1560 para el corte c. 1550'}</dd>
          </div>
          <div>
            <dt>{text.location}</dt>
            <dd>
              <strong>{text.confidenceLabels[properties.spatial_confidence]}</strong>
              <span>{text.confidenceDescriptions[properties.spatial_confidence]}</span>
            </dd>
          </div>
          <div>
            <dt>{en ? 'Date around 1550' : 'Fecha hacia 1550'}</dt>
            <dd>
              <strong>{text.confidenceLabels[properties.temporal_confidence]}</strong>
              <span>{text.confidenceDescriptions[properties.temporal_confidence]}</span>
            </dd>
          </div>
          <div>
            <dt>{text.evidence}</dt>
            <dd>{properties.evidence_basis.map((item) => text.evidenceLabels[item]).join(' · ')}</dd>
          </div>
          <div>
            <dt>{text.geometry}</dt>
            <dd>{text.geometryLabels[properties.geometry_method]}</dd>
          </div>
        </dl>
        <p className="evidence-note">{content.evidence_note}</p>
      </section>

      <SourceList
        citations={localizedFeature.properties.citations}
        sourcesById={sourcesById}
        text={text}
        id="period-sources-title"
      />
    </div>
  )
}

function UnavailablePeriodDetails({
  selection,
  onSelectPeriod,
  text,
}: {
  selection: PeriodUnavailableSelection
  onSelectPeriod: (period: ComparisonPeriod) => void
  text: Messages
}) {
  const en = text.locale === 'en'
  const isOutsideSlice = selection.reason === 'outside_review_slice'
  return (
    <div className="drawer-content unavailable-period">
      <div className="internal-review-note" role="note">
        <strong>
          {isOutsideSlice
            ? (en ? 'Not represented in this review slice' : 'No representado en este corte de revisión')
            : (en ? 'Not yet present around 1492' : 'Aún no presente hacia 1492')}
        </strong>
        <span>
          {isOutsideSlice
            ? (en
                ? 'The c. 1550 view contains only the 39 mapped M10.5 candidate entities. An omitted entity must not be interpreted as historically absent.'
                : 'La vista de c. 1550 contiene solo las 39 entidades cartografiadas del candidato M10.5. Una entidad omitida no debe interpretarse como históricamente ausente.')
            : (en
                ? 'This entity is classified as newly built after 1492 in the c. 1550 review record. The selected period has not changed.'
                : 'La ficha de revisión de c. 1550 clasifica esta entidad como construida después de 1492. El periodo seleccionado no ha cambiado.')}
        </span>
      </div>
      <p className="drawer-lede">
        {en
          ? `You are still viewing ${selection.currentPeriod === 'c1492' ? 'c. 1492' : 'c. 1550'}.`
          : `Sigues viendo ${selection.currentPeriod === 'c1492' ? 'c. 1492' : 'c. 1550'}.`}
      </p>
      <button
        className="period-switch-button"
        type="button"
        onClick={() => onSelectPeriod(selection.alternativePeriod)}
      >
        {en ? `View in ${selection.alternativePeriod === 'c1492' ? 'c. 1492' : 'c. 1550'}` : `Ver en ${selection.alternativePeriod === 'c1492' ? 'c. 1492' : 'c. 1550'}`}
      </button>
    </div>
  )
}

function SourceList({
  citations,
  sourcesById,
  text,
  id = 'sources-title',
}: {
  citations: HistoricalFeature['properties']['citations']
  sourcesById: ReadonlyMap<string, HistoricalSource>
  text: Messages
  id?: string
}) {
  return (
    <section className="sources-section" aria-labelledby={id}>
      <p className="panel-kicker">{text.bibliography}</p>
      <h3 id={id}>{text.sources}</h3>
      <ol>
        {citations.map((citation, index) => {
          const source = sourcesById.get(citation.source_id)
          if (!source) return null
          return (
            <li key={`${citation.source_id}-${citation.locator}-${index}`}>
              <p>
                <strong>{source.author}.</strong>{' '}
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer" title={text.openSource}>
                    <cite>{source.title}</cite>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ) : (
                  <cite>{source.title}</cite>
                )}.{' '}
                <span className="citation-publication">
                  {source.publisher}{source.year ? `, ${source.year}` : ''}.
                </span>
              </p>
              <span>{text.locator}: {citation.locator}</span>
              <small>{text.supports}: {citation.supports}</small>
              {source.identifier && <small>{text.identifier}: {source.identifier}</small>}
            </li>
          )
        })}
      </ol>
    </section>
  )
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

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

const ENGLISH_SUBTYPE_LABELS: Record<string, string> = {
  madrasa: 'Madrasa', river: 'River', irrigation_channel: 'Historic irrigation channel',
  lost_bridge: 'Lost bridge', palatine_city: 'Palatine city', palatine_estate: 'Palatine estate',
  urban_sector: 'Urban sector', late_nasrid_extent: 'Approximate urban extent', defensive_wall: 'Wall or enclosure',
  historical_route: 'Historic route', city_gate: 'City gate', lost_city_gate: 'Lost city gate',
  palatine_gate: 'Palatine gate', congregational_mosque: 'Congregational mosque', river_gate_bridge: 'River gate-bridge',
  silk_market: 'Silk market', funduq: 'Funduq and merchant lodging', hospital: 'Hospital', hammam: 'Public bath',
  historical_quarter: 'Historic quarter or suburb', cemetery: 'Cemetery',
  converted_congregational_mosque: 'Converted congregational mosque', cathedral: 'Cathedral',
  royal_chapel: 'Royal chapel', merchants_exchange: 'Merchants’ exchange',
  university_college: 'University and college', imperial_palace: 'Imperial palace',
  imperial_gate: 'Imperial gate',
  high_court: 'High court', royal_hospital: 'Royal hospital',
  monumental_fountain: 'Monumental fountain', parish_church: 'Parish church',
  palatine_enclosure: 'Palatine enclosure', royal_complex: 'Royal complex',
  mint: 'Mint',
}

function subtypeLabel(subtype: string, locale: Messages['locale']) {
  return locale === 'en'
    ? ENGLISH_SUBTYPE_LABELS[subtype] ?? subtype
    : SUBTYPE_LABELS[subtype] ?? subtype
}

const CHANGE_LABELS: Record<Messages['locale'], Record<InternalPeriodDetail['feature']['properties']['change_from_previous'], string>> = {
  es: {
    not_applicable: 'Sin comparación', retained: 'Retenido', altered: 'Alterado', converted: 'Convertido',
    replaced: 'Sustituido', demolished: 'Demolido', newly_built: 'Nueva construcción', unknown: 'Cambio incierto',
  },
  en: {
    not_applicable: 'No comparison', retained: 'Retained', altered: 'Altered', converted: 'Converted',
    replaced: 'Replaced', demolished: 'Demolished', newly_built: 'Newly built', unknown: 'Uncertain change',
  },
}

const PHYSICAL_STATE_LABELS: Record<Messages['locale'], Record<InternalPeriodDetail['feature']['properties']['physical_state'], string>> = {
  es: {
    planned: 'Proyectado', under_construction: 'En construcción', partially_in_use: 'En uso parcial',
    complete: 'Completo', ruinous: 'Ruinoso', demolished: 'Demolido', unknown: 'Estado incierto',
  },
  en: {
    planned: 'Planned', under_construction: 'Under construction', partially_in_use: 'Partly in use',
    complete: 'Complete', ruinous: 'Ruinous', demolished: 'Demolished', unknown: 'Uncertain state',
  },
}

type PeriodRelationship = InternalPeriodDetail['review']['relationships'][number]['relation']

const RELATIONSHIP_LABELS: Record<Messages['locale'], Record<PeriodRelationship, string>> = {
  es: {
    adjacent_to: 'Adyacente a', attached_to: 'Adosado a', contained_by: 'Contenido por', near: 'Próximo a',
    overlaps: 'Se solapa con', part_of_program_with: 'Comparte programa con', replaces_function_of: 'Sustituye la función de',
    retains: 'Conserva', routes_toward: 'Conduce hacia', shares_site_with: 'Comparte solar con', transformed_from: 'Transformado desde',
  },
  en: {
    adjacent_to: 'Adjacent to', attached_to: 'Attached to', contained_by: 'Contained by', near: 'Near',
    overlaps: 'Overlaps', part_of_program_with: 'Part of a programme with', replaces_function_of: 'Replaces the function of',
    retains: 'Retains', routes_toward: 'Routes toward', shares_site_with: 'Shares a site with', transformed_from: 'Transformed from',
  },
}

function relationshipLabel(relation: PeriodRelationship, locale: Messages['locale']) {
  return RELATIONSHIP_LABELS[locale][relation]
}

function changeLabel(
  change: InternalPeriodDetail['feature']['properties']['change_from_previous'],
  locale: Messages['locale'],
) {
  return CHANGE_LABELS[locale][change]
}

function physicalStateLabel(
  state: InternalPeriodDetail['feature']['properties']['physical_state'],
  locale: Messages['locale'],
) {
  return PHYSICAL_STATE_LABELS[locale][state]
}
