import { useEffect, useRef, type ReactNode } from 'react'
import {
  SUBTYPE_LABELS,
} from '../data/categories'
import { gazetteerSummary } from '../data/historicalData'
import type { GazetteerEntry, HistoricalFeature, HistoricalSource } from '../data/schema'
import type { Messages } from '../i18n/messages'

interface FeatureDrawerProps {
  isOpen: boolean
  feature: HistoricalFeature | null
  gazetteerEntry: GazetteerEntry | null
  sourcesById: ReadonlyMap<string, HistoricalSource>
  onClose: () => void
  isLanguageFallback: boolean
  text: Messages
}

export function FeatureDrawer({
  isOpen,
  feature,
  gazetteerEntry,
  sourcesById,
  onClose,
  isLanguageFallback,
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
              {feature ? text.categoryLabels[feature.properties.category] : text.aboutProject}
            </p>
            <h2 id="drawer-title">
              {feature ? feature.properties.name : text.projectTitle}
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

        {feature ? (
          <FeatureDetails
            feature={feature}
            gazetteerEntry={gazetteerEntry}
            sourcesById={sourcesById}
            isLanguageFallback={isLanguageFallback}
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
  text,
}: {
  feature: HistoricalFeature
  gazetteerEntry: GazetteerEntry | null
  sourcesById: ReadonlyMap<string, HistoricalSource>
  isLanguageFallback: boolean
  text: Messages
}) {
  const { properties } = feature

  return (
    <div className="drawer-content feature-details">
      <div className="feature-meta">
        <span>{subtypeLabel(properties.subtype, text.locale)}</span>
        <span>{text.confidenceLabels[properties.confidence.location]}</span>
      </div>

      {isLanguageFallback && <p className="language-fallback" role="note">{text.fallback}</p>}

      {properties.modern_name && properties.modern_name !== properties.name && (
        <p className="modern-name">{text.todayPrefix}: {properties.modern_name}</p>
      )}

      <p className="drawer-lede">{properties.summary}</p>

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

      <section className="sources-section" aria-labelledby="sources-title">
        <p className="panel-kicker">{text.bibliography}</p>
        <h3 id="sources-title">{text.sources}</h3>
        <ol>
          {properties.citations.map((citation) => {
            const source = sourcesById.get(citation.source_id)
            if (!source) return null
            return (
              <li key={`${citation.source_id}-${citation.locator}`}>
                <p>
                  <strong>{source.author}.</strong>{' '}
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      title={text.openSource}
                    >
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
    </div>
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
}

function subtypeLabel(subtype: string, locale: Messages['locale']) {
  return locale === 'en'
    ? ENGLISH_SUBTYPE_LABELS[subtype] ?? subtype
    : SUBTYPE_LABELS[subtype] ?? subtype
}
