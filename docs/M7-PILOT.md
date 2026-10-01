# M7 place-based public access pilot

## Status and route

The pilot is implemented in `preview` status. Its durable paths work, but the
route is deliberately absent from the main navigation and marked `noindex`
until the editorial and field gates below pass.

The approved order is:

1. Puerta de Bibarrambla / Bab al-Ramla
2. Zacatín
3. Alcaicería
4. Madraza Yusufiyya
5. Mezquita Mayor de la medina / Sagrario–Catedral

The Zacatín and Alcaicería anchors are interpretive viewpoints, not new
historical geometries. Their exact physical placement must be checked in the
street before any permanent sign is proposed.

## Propuesta de señalización

- Imprimir debajo de cada QR la URL permanente `/place/<slug>/` como alternativa.
- Usar un QR de al menos 30 mm por lado, conservar la zona blanca de seguridad y
  no superponer logotipos.
- Situar texto, controles y código a una altura accesible, con contraste adecuado
  y materiales que reduzcan reflejos.
- Usar tarjetas temporales solo en pruebas controladas o con permiso de
  colocación. No sugerir el respaldo de una institución mediante sus logotipos.
- La persona responsable del proyecto mantiene las URL y el contenido. La entidad
  colaboradora del emplazamiento debe asumir permiso, inspección y sustitución.
- Inspeccionar cualquier señal permanente cada trimestre y tras avisos de daños.
  Las correcciones históricas se publican en el destino estable, sin cambiar el QR.
- Si una parada deja de ser segura o accesible, conservar la URL, explicar allí la
  suspensión y retirar o cubrir el soporte físico hasta su sustitución.

## Signage proposal (English)

- Use the permanent `/place/<slug>/` URL printed below each QR as a fallback.
- Print the QR at no less than 30 mm square, retain its white quiet zone and do
  not place a logo over it.
- Mount controls, text and QR within accessible reach and with adequate contrast
  and glare resistance.
- Temporary cards may be used only in a controlled test or with the relevant
  placement permission. No municipal or institutional logo may be implied.
- The project owner maintains URLs and historical content. A physical-site
  partner must own permission, inspection and replacement of installed signs.
- Inspect permanent signs quarterly and after any report of damage. A historical
  correction updates the stable destination rather than the printed QR.
- If a stop becomes unsafe or inaccessible, retain the stable URL, explain the
  suspension there and remove or cover the physical marker until replacement.

The generated review materials are all bilingual and marked `noindex`:

- `/pilot/review/`: partner-facing review hub with scope, limitations and links.
- `/pilot/test-sheet.html`: printable sheet containing all five QR codes.
- `/pilot/cards/<slug>.html`: an A6 printable card for each individual stop.
- `/pilot/field-checklist.html`: printable per-stop field and accessibility log.
- `/pilot/qr/<slug>.svg`: the high-error-correction QR source assets.

These files are generated from `data/pilot-route.json`, so a slug or title change
updates the QR, fallback URL, card, checklist and review hub together.

## Privacy and measurement

Location is requested only after an in-product explanation and uses a single
browser fix. Coordinates remain in memory and are not written to URLs, storage,
analytics or application requests. The visible map still loads third-party map
tiles for its viewport, which the explanation states explicitly.

Cloudflare Web Analytics may report aggregate page paths for each stop. It must
not be extended with coordinates, persistent identifiers or custom location
events for this pilot.

## Activation gates

Before changing `status` from `preview` to `active`:

1. Review all English text for historical equivalence and idiomatic English.
2. Confirm all five anchors and the pedestrian sequence in the street.
3. Confirm the Madraza–Sagrario final leg is unobstructed and accessible.
4. Scan all QR codes on representative iOS and Android devices in daylight.
5. Run Spanish and English task tests with at least eight participants.
6. Complete screen-reader, keyboard, large-text and reduced-motion checks.
7. Name the party responsible for physical permission, quarterly inspection
   and replacement.
8. Resolve all critical historical, privacy, accessibility and broken-link findings.

After the gates pass, set the registry status to `active`, expose the route from
the main navigation, deploy through the normal Pages workflow and release
`v0.1.1`.
