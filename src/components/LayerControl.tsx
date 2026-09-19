interface LayerControlProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export function LayerControl({ isOpen, onToggle, onClose }: LayerControlProps) {
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
        <span>Layers</span>
      </button>

      {isOpen && (
        <section id="layer-panel" className="layer-panel" aria-labelledby="layers-title">
          <div className="layer-panel__heading">
            <div>
              <p className="panel-kicker">Map view</p>
              <h2 id="layers-title">Layers</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Close layers"
              onClick={onClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <label className="layer-row">
            <span>
              <strong>Modern context</strong>
              <small>OpenStreetMap reference</small>
            </span>
            <input
              type="checkbox"
              defaultChecked
              disabled
              aria-label="Modern context"
            />
          </label>

          <div className="layer-row layer-row--disabled" aria-disabled="true">
            <span>
              <strong>Historical overlay</strong>
              <small>Reviewed data begins in M2</small>
            </span>
            <span className="coming-soon">Soon</span>
          </div>

          <div className="layer-placeholder" role="note">
            Walls, gates, waterways, districts, and sites will appear here only
            after their evidence and geometry are reviewed.
          </div>
        </section>
      )}
    </div>
  )
}
