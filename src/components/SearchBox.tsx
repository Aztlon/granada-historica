import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { CATEGORY_CONFIG } from '../data/categories'
import { searchHistoricalFeatures } from '../data/search'
import type { HistoricalFeature } from '../data/schema'

interface SearchBoxProps {
  features: readonly HistoricalFeature[]
  onSelectFeature: (featureId: string) => void
}

export function SearchBox({ features, onSelectFeature }: SearchBoxProps) {
  const inputId = useId()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const results = useMemo(
    () => searchHistoricalFeatures(features, query),
    [features, query],
  )
  const showResults = isOpen && query.trim().length > 0

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [])

  const openMobileSearch = () => {
    setIsMobileOpen(true)
    setIsOpen(true)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const closeSearch = () => {
    setIsOpen(false)
    setIsMobileOpen(false)
  }

  const selectResult = (featureId: string) => {
    const feature = features.find((candidate) => candidate.id === featureId)
    if (feature) setQuery(feature.properties.name)
    closeSearch()
    onSelectFeature(featureId)
  }

  return (
    <div
      ref={rootRef}
      className={`search-region ${isMobileOpen ? 'search-region--mobile-open' : ''}`}
    >
      <button
        className="mobile-search-button"
        type="button"
        aria-label="Buscar en la Granada histórica"
        aria-expanded={isMobileOpen}
        aria-controls={`${inputId}-shell`}
        onClick={openMobileSearch}
      >
        <SearchIcon />
      </button>

      <div id={`${inputId}-shell`} className="search-popover">
        <label className="search-shell" htmlFor={inputId}>
          <SearchIcon />
          <span className="sr-only">Buscar en la Granada histórica</span>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            role="combobox"
            autoComplete="off"
            placeholder="Buscar lugares, nombres o calles"
            value={query}
            aria-autocomplete="list"
            aria-expanded={showResults}
            aria-controls={listboxId}
            aria-activedescendant={
              showResults && results[activeIndex]
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
              setIsOpen(true)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && results.length > 0) {
                event.preventDefault()
                setIsOpen(true)
                setActiveIndex((current) => (current + 1) % results.length)
              } else if (event.key === 'ArrowUp' && results.length > 0) {
                event.preventDefault()
                setIsOpen(true)
                setActiveIndex((current) => (current - 1 + results.length) % results.length)
              } else if (event.key === 'Enter' && showResults && results[activeIndex]) {
                event.preventDefault()
                selectResult(results[activeIndex].feature.id)
              } else if (event.key === 'Escape') {
                closeSearch()
              }
            }}
          />
        </label>

        {showResults && (
          <div className="search-results" role="listbox" id={listboxId} aria-label="Resultados de búsqueda">
            {results.length > 0 ? (
              results.map(({ feature, matchedOn }, index) => (
                <button
                  key={feature.id}
                  id={`${listboxId}-option-${index}`}
                  className={`search-result ${index === activeIndex ? 'search-result--active' : ''}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => selectResult(feature.id)}
                >
                  <span className="search-result__main">
                    <strong>{feature.properties.name}</strong>
                    <small>{CATEGORY_CONFIG[feature.properties.category].label}</small>
                  </span>
                  {matchedOn && <span className="search-result__match">Coincide: {matchedOn}</span>}
                </button>
              ))
            ) : (
              <p className="search-empty" role="status">
                No hay coincidencias. Prueba un nombre histórico, una calle o un lugar actual.
              </p>
            )}
          </div>
        )}

        <span className="sr-only" role="status" aria-live="polite">
          {query.trim() ? `${results.length} resultados encontrados` : ''}
        </span>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
  )
}
