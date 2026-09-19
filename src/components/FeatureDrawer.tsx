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
        aria-label="Dismiss information panel"
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
            <p className="panel-kicker">About the project</p>
            <h2 id="drawer-title">A city, carefully reconstructed</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="icon-button"
            type="button"
            aria-label="Close information panel"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="drawer-content">
          <p className="drawer-lede">
            Granada Histórica will let you compare the modern city with a
            sourced reconstruction of Granada near the end of Nasrid rule.
          </p>

          <div className="principle-card">
            <span className="principle-card__number">01</span>
            <div>
              <h3>Evidence stays visible</h3>
              <p>
                Every published feature will explain what supports its location,
                date, and interpretation.
              </p>
            </div>
          </div>

          <div className="principle-card">
            <span className="principle-card__number">02</span>
            <div>
              <h3>Uncertainty is part of the map</h3>
              <p>
                Secure, probable, approximate, and disputed reconstructions will
                never be styled as though they mean the same thing.
              </p>
            </div>
          </div>

          <div className="milestone-note">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>M1 · Map shell</strong>
              <p>
                You are viewing the modern reference map. Reviewed historical
                layers and feature details begin with M2.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
