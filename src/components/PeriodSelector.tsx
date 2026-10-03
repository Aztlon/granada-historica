import type { ComparisonPeriod } from '../data/internalComparisonTypes'
import type { Locale } from '../data/pilotSchema'

interface PeriodSelectorProps {
  locale: Locale
  period: ComparisonPeriod
  isC1550Ready: boolean
  onChange: (period: ComparisonPeriod) => void
}

export function PeriodSelector({
  locale,
  period,
  isC1550Ready,
  onChange,
}: PeriodSelectorProps) {
  const en = locale === 'en'
  return (
    <div className="period-selector" data-testid="internal-period-selector">
      <div className="period-selector__status">
        <span aria-hidden="true" />
        {en ? 'Internal review · not for publication' : 'Revisión interna · no publicar'}
      </div>
      <fieldset>
        <legend>{en ? 'Historical period' : 'Periodo histórico'}</legend>
        <label>
          <input
            type="radio"
            name="historical-period"
            value="c1492"
            checked={period === 'c1492'}
            onChange={() => onChange('c1492')}
          />
          <span>c. 1492</span>
        </label>
        <label>
          <input
            type="radio"
            name="historical-period"
            value="c1550"
            checked={period === 'c1550'}
            disabled={!isC1550Ready}
            onChange={() => onChange('c1550')}
          />
          <span>{isC1550Ready ? 'c. 1550' : (en ? 'Loading c. 1550…' : 'Cargando c. 1550…')}</span>
        </label>
      </fieldset>
      <p>
        {en
          ? 'Two documented snapshots; no year-by-year timeline.'
          : 'Dos cortes documentados; no es una cronología año por año.'}
      </p>
    </div>
  )
}
