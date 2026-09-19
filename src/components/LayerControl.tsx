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

          <div className="layer-row layer-row--disabled" aria-disabled="true">
            <span>
              <strong>Superposición histórica</strong>
              <small>Los datos revisados empiezan en M2</small>
            </span>
            <span className="coming-soon">Próximamente</span>
          </div>

          <div className="layer-placeholder" role="note">
            Las murallas, puertas, cursos de agua, barrios y lugares aparecerán
            aquí únicamente cuando sus fuentes y geometrías hayan sido revisadas.
          </div>
        </section>
      )}
    </div>
  )
}
