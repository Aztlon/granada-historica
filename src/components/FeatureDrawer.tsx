import { useEffect, useRef } from 'react'

interface FeatureDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function FeatureDrawer({ isOpen, onClose }: FeatureDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, onClose])

  return (
    <>
      <button
        className={`drawer-backdrop ${isOpen ? 'drawer-backdrop--visible' : ''}`}
        type="button"
        aria-label="Descartar el panel informativo"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={`feature-drawer ${isOpen ? 'feature-drawer--open' : ''}`}
        aria-labelledby="drawer-title"
        aria-hidden={!isOpen}
      >
        <div className="drawer-handle" aria-hidden="true" />
        <div className="drawer-header">
          <div>
            <p className="panel-kicker">Sobre el proyecto</p>
            <h2 id="drawer-title">Una ciudad reconstruida con rigor</h2>
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

        <div className="drawer-content">
          <p className="drawer-lede">
            Granada Histórica te permitirá comparar la ciudad actual con una
            reconstrucción documentada de la Granada de los últimos años del
            reino nazarí.
          </p>

          <div className="principle-card">
            <span className="principle-card__number">01</span>
            <div>
              <h3>Las fuentes, siempre a la vista</h3>
              <p>
                Cada elemento publicado explicará qué fuentes respaldan su
                ubicación, fecha e interpretación.
              </p>
            </div>
          </div>

          <div className="principle-card">
            <span className="principle-card__number">02</span>
            <div>
              <h3>La incertidumbre forma parte del mapa</h3>
              <p>
                Las reconstrucciones seguras, probables, aproximadas o
                controvertidas nunca se mostrarán como si tuviesen el mismo grado
                de certeza.
              </p>
            </div>
          </div>

          <div className="milestone-note">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>M1 · Base cartográfica</strong>
              <p>
                Ahora estás viendo el mapa actual de referencia. Las capas
                históricas revisadas y las fichas detalladas llegarán en M2.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
