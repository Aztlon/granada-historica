import { useId, useState } from 'react'
import type { Locale } from '../i18n/types'
import type { PlaceImage, PlaceResources as Resources } from '../data/placeResourcesSchema'
import type { HistoricalSource } from '../data/schema'

const kindLabels = {
  historical_depiction: { es: 'Representación histórica', en: 'Historical depiction' },
  present_day_photograph: { es: 'Fotografía contemporánea', en: 'Present-day photograph' },
  interpretive_reconstruction: { es: 'Reconstrucción interpretativa', en: 'Interpretive reconstruction' },
}
const confidenceLabels = {
  secure: { es: 'Segura', en: 'Secure' },
  probable: { es: 'Probable', en: 'Probable' },
  approximate: { es: 'Aproximada', en: 'Approximate' },
  artistic_inference: { es: 'Inferencia artística', en: 'Artistic inference' },
}

export function PlaceResources({ resources, locale, sourcesById }: {
  resources?: Resources
  locale: Locale
  sourcesById: ReadonlyMap<string, HistoricalSource>
}) {
  const headingId = useId()
  const en = locale === 'en'
  if (!resources) return null
  // Omit absent locale links rather than guessing article titles or silently switching language.
  const readings = resources.further_reading.flatMap((reading) => {
    const link = reading.links[locale]
    return link ? [{ ...link, id: reading.id, kind: reading.kind }] : []
  })
  if (!resources.context && !resources.images.length && !readings.length) return null

  return (
    <section className="place-resources" aria-labelledby={headingId}>
      <h3 id={headingId}>{resources.images.length
        ? (en ? 'Images and further reading' : 'Imágenes y lecturas complementarias')
        : (en ? 'Further reading' : 'Lecturas complementarias')}</h3>
      {resources.context && <div className="place-resources__context">
        <p>{resources.context.note[locale]}</p>
        <ul>
          {resources.context.source_refs.map((id) => {
            const source = sourcesById.get(id)
            return source?.url ? <li key={id}>
              <a href={source.url}>{en ? 'Context source' : 'Fuente del contexto'}: {source.title}</a>
            </li> : null
          })}
        </ul>
      </div>}
      {resources.images.map((asset) => <ResourceImage key={`${asset.id}:${asset.path}`} asset={asset} locale={locale} sourcesById={sourcesById} />)}
      {readings.length > 0 && <>
        <p className="place-resources__reading-note">{en
          ? 'These optional readings complement the historical record; they do not replace its cited evidence.'
          : 'Estas lecturas opcionales complementan la ficha histórica; no sustituyen sus pruebas citadas.'}</p>
        <ul className="place-resources__links">
          {readings.map((link) => <li key={link.id}>
            <a href={link.url} lang={locale}>{link.title}</a>
            {link.kind === 'wikipedia' && <small>{en ? 'Encyclopedia · further reading' : 'Enciclopedia · lectura complementaria'}</small>}
          </li>)}
        </ul>
      </>}
    </section>
  )
}

function ResourceImage({ asset, locale, sourcesById }: {
  asset: PlaceImage
  locale: Locale
  sourcesById: ReadonlyMap<string, HistoricalSource>
}) {
  const [failed, setFailed] = useState(false)
  const en = locale === 'en'
  return (
    <figure className="place-resources__figure">
      <p className="place-resources__kind"><strong>{kindLabels[asset.kind][locale]}</strong> · {asset.represented_date[locale]}</p>
      {failed
        ? <p className="place-resources__unavailable" role="status">{en ? 'Image unavailable.' : 'Imagen no disponible.'} {asset.alt[locale]}</p>
        : <img src={`${import.meta.env.BASE_URL}${asset.path}`} alt={asset.alt[locale]}
            width={asset.width} height={asset.height} loading="lazy" decoding="async"
            onError={() => setFailed(true)} />}
      <figcaption>
        <strong>{asset.title[locale]}</strong>
        <p>{asset.caption[locale]}</p>
        <p>{asset.location_note[locale]}</p>
        <p className="place-resources__uncertainty">{asset.uncertainty[locale]}</p>
        <p>{asset.review.status === 'reviewed'
          ? `${en ? 'Reviewed by' : 'Revisado por'}: ${asset.review.reviewer}.`
          : (en ? 'Historical review pending.' : 'Revisión histórica pendiente.')} {asset.review.note[locale]}</p>
        {asset.components.length > 0 && <ul className="place-resources__components">
          {asset.components.map((component, index) => <li key={index}>
            <strong>{component.label[locale]} — {confidenceLabels[component.confidence][locale]}</strong>
            <p>{component.explanation[locale]}</p>
            <ul>{component.source_refs.map((id) => {
              const source = sourcesById.get(id)
              return source ? <li key={id}>{source.url
                ? <a href={source.url}>{source.title}</a>
                : source.title}</li> : null
            })}</ul>
          </li>)}
        </ul>}
        <p>{en ? 'Author' : 'Autor'}: {asset.author}. {asset.rights.attribution}</p>
        <p><a href={asset.source_url}>{en ? 'Image source' : 'Fuente de la imagen'}</a>{' · '}
          <a href={asset.rights.url}>{asset.rights.label}</a>{' · '}
          <a href={asset.rights.evidence_url}>{en ? 'Reuse record' : 'Registro de reutilización'}</a></p>
        <p>{asset.rights.changes[locale]}</p>
      </figcaption>
    </figure>
  )
}
