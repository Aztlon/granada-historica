import type { CSSProperties } from 'react'
import { CATEGORY_CONFIG, CONFIDENCE_LABELS } from '../data/categories'
import type { Confidence, FeatureCategory } from '../data/schema'

interface LayerControlProps {
  isOpen: boolean
  historicalVisible: boolean
  visibleCategories: ReadonlySet<FeatureCategory>
  categoryCounts: Record<FeatureCategory, number>
  onToggle: () => void
  onClose: () => void
  onToggleHistorical: () => void
  onToggleCategory: (category: FeatureCategory) => void
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
  visibleCategories,
  categoryCounts,
  onToggle,
  onClose,
  onToggleHistorical,
  onToggleCategory,
}: LayerControlProps) {
  return (
    <div className="layer-control">
      <button
        className="map-control-button"
        type="button"
        aria-expanded={isOpen}
        aria-controls="layer-panel"
        onClick={onToggle}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
          <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />
        </svg>
        <span>Capas</span>
      </button>

      {isOpen && (
        <section id="layer-panel" className="layer-panel" aria-labelledby="layers-title">
          <div className="layer-panel__heading">
            <div>
              <p className="panel-kicker">Vista del mapa</p>
              <h2 id="layers-title">Capas</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Cerrar el panel de capas"
              onClick={onClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <label className="layer-row">
            <span>
              <strong>Contexto actual</strong>
              <small>Referencia de OpenStreetMap</small>
            </span>
            <input
              type="checkbox"
              defaultChecked
              disabled
              aria-label="Contexto actual"
            />
          </label>

          <label className="layer-row">
            <span>
              <strong>Superposición histórica</strong>
              <small>{historicalVisible ? 'Visible' : 'Oculta'}</small>
            </span>
            <input
              type="checkbox"
              checked={historicalVisible}
              aria-label="Superposición histórica"
              onChange={onToggleHistorical}
            />
          </label>

          <fieldset className="category-filters" disabled={!historicalVisible}>
            <legend>Categorías</legend>
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
                  <span className="category-row__label">{config.shortLabel}</span>
                  <span className="category-count" aria-label={`${count} elementos`}>
                    {count}
                  </span>
                  <input
                    type="checkbox"
                    checked={visibleCategories.has(category)}
                    disabled={count === 0}
                    aria-label={config.label}
                    onChange={() => onToggleCategory(category)}
                  />
                </label>
              )
            })}
          </fieldset>

          <div className="confidence-legend">
            <p>Certeza de localización</p>
            <div className="confidence-legend__items">
              {confidenceOrder.map((confidence) => (
                <span key={confidence}>
                  <i className={`confidence-mark confidence-mark--${confidence}`} />
                  {CONFIDENCE_LABELS[confidence]}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
