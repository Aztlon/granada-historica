import { useEffect, useRef, type ReactNode } from 'react'
import {
  CATEGORY_CONFIG,
  CONFIDENCE_DESCRIPTIONS,
  CONFIDENCE_LABELS,
  EVIDENCE_LABELS,
  GEOMETRY_METHOD_LABELS,
  SUBTYPE_LABELS,
} from '../data/categories'
import type { HistoricalFeature, HistoricalSource } from '../data/schema'

interface FeatureDrawerProps {
  isOpen: boolean
  feature: HistoricalFeature | null
  sourcesById: ReadonlyMap<string, HistoricalSource>
  onClose: () => void
}

export function FeatureDrawer({
  isOpen,
  feature,
  sourcesById,
  onClose,
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
        aria-label="Descartar el panel informativo"
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
              {feature ? CATEGORY_CONFIG[feature.properties.category].label : 'Sobre el proyecto'}
            </p>
            <h2 id="drawer-title">
              {feature ? feature.properties.name : 'Una ciudad reconstruida con rigor'}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            className="icon-button"
            type="button"
            aria-label="Cerrar el panel informativo"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {feature ? (
          <FeatureDetails feature={feature} sourcesById={sourcesById} />
        ) : (
          <ProjectIntroduction />
        )}
      </aside>
    </>
  )
}

function ProjectIntroduction() {
  return (
    <div className="drawer-content">
      <p className="drawer-lede">
        Granada Histórica te permite comparar la ciudad actual con una
        reconstrucción documentada de la Granada de los últimos años del reino
        nazarí.
      </p>

      <div className="principle-card">
        <span className="principle-card__number">01</span>
        <div>
          <h3>Las fuentes, siempre a la vista</h3>
          <p>
            Cada elemento publicado explica qué fuentes respaldan su ubicación,
            fecha e interpretación.
          </p>
        </div>
      </div>

      <div className="principle-card">
        <span className="principle-card__number">02</span>
        <div>
          <h3>La incertidumbre forma parte del mapa</h3>
          <p>
            Las reconstrucciones seguras, probables, aproximadas o controvertidas
            nunca se muestran como si tuviesen el mismo grado de certeza.
          </p>
        </div>
      </div>

      <div className="milestone-note">
        <span className="status-dot" aria-hidden="true" />
        <div>
          <strong>M5 · Explorar y comparar</strong>
          <p>
            El prototipo reúne 44 elementos revisados y permite buscarlos por
            nombres históricos, actuales y referencias urbanas modernas.
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureDetails({
  feature,
  sourcesById,
}: {
  feature: HistoricalFeature
  sourcesById: ReadonlyMap<string, HistoricalSource>
}) {
  const { properties } = feature

  return (
    <div className="drawer-content feature-details">
      <div className="feature-meta">
        <span>{SUBTYPE_LABELS[properties.subtype] ?? properties.subtype}</span>
        <span>{CONFIDENCE_LABELS[properties.confidence.location]}</span>
      </div>

      {properties.modern_name && properties.modern_name !== properties.name && (
        <p className="modern-name">Hoy: {properties.modern_name}</p>
      )}

      <p className="drawer-lede">{properties.summary}</p>

      <DetailSection title="¿Qué había aquí hacia 1492?">
        <p>{properties.context_1492}</p>
      </DetailSection>
      <DetailSection title="¿Qué ocurrió después?">
        <p>{properties.after_1492}</p>
      </DetailSection>
      <DetailSection title="¿Qué hay hoy?">
        <p>{properties.today}</p>
      </DetailSection>

      <section className="evidence-panel" aria-labelledby="evidence-title">
        <p className="panel-kicker">Transparencia histórica</p>
        <h3 id="evidence-title">¿Cómo lo sabemos?</h3>
        <dl className="confidence-list">
          <div>
            <dt>Ubicación</dt>
            <dd>
              <strong>{CONFIDENCE_LABELS[properties.confidence.location]}</strong>
              <span>{CONFIDENCE_DESCRIPTIONS[properties.confidence.location]}</span>
            </dd>
          </div>
          <div>
            <dt>Fecha hacia 1492</dt>
            <dd>
              <strong>{CONFIDENCE_LABELS[properties.confidence.time]}</strong>
              <span>{CONFIDENCE_DESCRIPTIONS[properties.confidence.time]}</span>
            </dd>
          </div>
          <div>
            <dt>Pruebas</dt>
            <dd>{properties.evidence_basis.map((item) => EVIDENCE_LABELS[item]).join(' · ')}</dd>
          </div>
          <div>
            <dt>Geometría</dt>
            <dd>{GEOMETRY_METHOD_LABELS[properties.geometry_method]}</dd>
          </div>
        </dl>
        <p className="evidence-note">{properties.evidence_note}</p>
      </section>

      <section className="sources-section" aria-labelledby="sources-title">
        <p className="panel-kicker">Bibliografía</p>
        <h3 id="sources-title">Fuentes</h3>
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
                      title="Abrir fuente en una pestaña nueva"
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
                <span>Localizador: {citation.locator}</span>
                <small>Respalda: {citation.supports}</small>
                {source.identifier && <small>Identificador: {source.identifier}</small>}
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}
