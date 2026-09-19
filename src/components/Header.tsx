interface HeaderProps {
  onOpenInfo: () => void
}

function PomegranateMark() {
  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      viewBox="0 0 48 48"
      width="42"
      height="42"
    >
      <path
        d="M24 7c-5.3 0-9.5 3.9-9.5 8.7 0 2.1.8 4 2.1 5.5-4 1.8-6.9 5.7-6.9 10.3C9.7 38.6 16.1 42 24 42s14.3-3.4 14.3-10.5c0-4.6-2.9-8.5-6.9-10.3a8.1 8.1 0 0 0 2.1-5.5C33.5 10.9 29.3 7 24 7Z"
        fill="currentColor"
      />
      <path
        d="M18 13.8c2.8-.2 4.8.9 6 3.1 1.2-2.2 3.2-3.3 6-3.1-1.3 2.9-3.2 4.5-6 4.5s-4.7-1.6-6-4.5Z"
        fill="var(--gold)"
      />
      <g fill="var(--paper)">
        <circle cx="19" cy="29" r="1.4" />
        <circle cx="24" cy="26" r="1.4" />
        <circle cx="29" cy="29" r="1.4" />
        <circle cx="22" cy="34" r="1.4" />
        <circle cx="27" cy="34" r="1.4" />
      </g>
    </svg>
  )
}

export function Header({ onOpenInfo }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="brand-lockup" aria-label="Granada Histórica">
        <PomegranateMark />
        <div>
          <p className="brand-kicker">An atlas of the city beneath the city</p>
          <h1>Granada Histórica</h1>
        </div>
      </div>

      <div className="header-actions">
        <label className="search-shell">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
            <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
          </svg>
          <span className="sr-only">Search historical Granada</span>
          <input
            type="search"
            placeholder="Search arrives in M5"
            disabled
            aria-describedby="search-status"
          />
          <span id="search-status" className="sr-only">
            Search is not available in this milestone.
          </span>
        </label>

        <button className="text-button" type="button" onClick={onOpenInfo}>
          About this map
        </button>
      </div>
    </header>
  )
}
