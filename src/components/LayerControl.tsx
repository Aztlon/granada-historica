import { useEffect, useRef, type CSSProperties } from 'react'
import { CATEGORY_CONFIG } from '../data/categories'
import type { Confidence, FeatureCategory } from '../data/schema'
import type { Messages } from '../i18n/messages'

interface LayerControlProps {
  isOpen: boolean
  historicalVisible: boolean
  historicalOpacity: number
  modernVisible: boolean
  modernStrength: number
  visibleCategories: ReadonlySet<FeatureCategory>
  categoryCounts: Record<FeatureCategory, number>
  onToggle: () => void
  onClose: () => void
  onToggleHistorical: () => void
  onToggleModern: () => void
  onChangeModernStrength: (strength: number) => void
  onChangeHistoricalOpacity: (opacity: number) => void
  onToggleCategory: (category: FeatureCategory) => void
  onShowAllCategories: () => void
  onHideAllCategories: () => void
  text: Messages
}

const confidenceOrder: Confidence[] = [
  'secure',
  'probable',
  'approximate',
  'disputed',
]

export function LayerControl({
  isOpen,
  historicalVisible,
  historicalOpacity,
  modernVisible,
  modernStrength,
  visibleCategories,
  categoryCounts,
  onToggle,
  onClose,
  onToggleHistorical,
  onToggleModern,
  onChangeModernStrength,
  onChangeHistoricalOpacity,
  onToggleCategory,
  onShowAllCategories,
  onHideAllCategories,
  text,
}: LayerControlProps) {
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const toggleButton = toggleRef.current
    closeRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      toggleButton?.focus()
    }
  }, [isOpen])

  return (
    <div className="layer-control">
      <button
        ref={toggleRef}
        className="map-control-button"
        type="button"
        aria-expanded={isOpen}
        aria-controls="layer-panel"
        onClick={onToggle}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
          <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />
        </svg>
        <span>{text.layers}</span>
      </button>

      {isOpen && (
        <section id="layer-panel" className="layer-panel" aria-labelledby="layers-title">
          <div className="layer-panel__heading">
            <div>
              <p className="panel-kicker">{text.mapView}</p>
              <h2 id="layers-title">{text.layers}</h2>
            </div>
            <button
              ref={closeRef}
              className="icon-button"
              type="button"
              aria-label={text.closeLayers}
              onClick={onClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <label className="layer-row">
            <span>
              <strong>{text.modernContext}</strong>
              <small>{text.osmReference}</small>
            </span>
            <input
              type="checkbox"
              checked={modernVisible}
              aria-label={text.modernContext}
              onChange={onToggleModern}
            />
          </label>

          <label className={`opacity-control ${!modernVisible ? 'opacity-control--disabled' : ''}`}>
            <span>
              <strong>{text.modernStrength}</strong>
              <output>{Math.round(modernStrength * 100)}%</output>
            </span>
            <input
              type="range"
              min="0.25"
              max="1"
              step="0.05"
              value={modernStrength}
              disabled={!modernVisible}
              aria-label={text.modernStrength}
              onChange={(event) => onChangeModernStrength(Number(event.target.value))}
            />
          </label>

          <label className="layer-row">
            <span>
              <strong>{text.historicalOverlay}</strong>
              <small>{historicalVisible ? text.visible : text.hidden}</small>
            </span>
            <input
              type="checkbox"
              checked={historicalVisible}
              aria-label={text.historicalOverlay}
              onChange={onToggleHistorical}
            />
          </label>

          <label className={`opacity-control ${!historicalVisible ? 'opacity-control--disabled' : ''}`}>
            <span>
              <strong>{text.historicalOpacity}</strong>
              <output>{Math.round(historicalOpacity * 100)}%</output>
            </span>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={historicalOpacity}
              disabled={!historicalVisible}
              aria-label={text.historicalOpacityInput}
              onChange={(event) => onChangeHistoricalOpacity(Number(event.target.value))}
            />
          </label>

          <fieldset className="category-filters" disabled={!historicalVisible}>
            <legend className="sr-only">{text.categories}</legend>
            <div className="category-filters__heading">
              <span>{text.categories}</span>
              <span>
                <button type="button" onClick={onShowAllCategories}>{text.all}</button>
                <button type="button" onClick={onHideAllCategories}>{text.none}</button>
              </span>
            </div>
            {(Object.entries(CATEGORY_CONFIG) as [
              FeatureCategory,
              (typeof CATEGORY_CONFIG)[FeatureCategory],
            ][]).map(([category, config]) => {
              const count = categoryCounts[category]
              return (
                <label
                  key={category}
                  className={`category-row ${count === 0 ? 'category-row--empty' : ''}`}
                >
                  <span
                    className="category-swatch"
                    style={{ '--category-color': config.color } as CSSProperties}
                    aria-hidden="true"
                  />
                  <span className="category-row__label">{text.categoryLabels[category]}</span>
                  <span className="category-count" aria-label={text.elements(count)}>
                    {count}
                  </span>
                  <input
                    type="checkbox"
                    checked={visibleCategories.has(category)}
                    disabled={count === 0}
                    aria-label={text.categoryLabels[category]}
                    onChange={() => onToggleCategory(category)}
                  />
                </label>
              )
            })}
          </fieldset>

          <div className="confidence-legend">
            <p>{text.locationConfidence}</p>
            <div className="confidence-legend__items">
              {confidenceOrder.map((confidence) => (
                <span key={confidence}>
                  <i className={`confidence-mark confidence-mark--${confidence}`} />
                  {text.confidenceLabels[confidence]}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
