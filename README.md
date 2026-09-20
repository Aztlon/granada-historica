# Granada Histórica

Granada Histórica is an interactive historical atlas that will place a sourced,
uncertainty-aware reconstruction of **Granada, c. 1492** over the modern city.
The first release is deliberately focused on the final years of Nasrid Granada.

The map is intended to explain not only what may have occupied a place, but how
securely its location and date are known, which evidence supports the
reconstruction, what happened after 1492, and what is there today.

## Project status

Milestones **M0 — Specification and repository setup**, **M1 — Working map
shell**, **M2 — Historical data system**, **M3 — Historical morphology**, and
**M4 — First reviewed dataset** are complete. The app
now renders validated historical GeoJSON over an
interactive map of Granada, distinguishes categories and levels of spatial
certainty, supports filtering and selection, and exposes historical context,
provenance, and citations in each feature card.

The working dataset contains 36 cited and publishable features. None is assumed spatially correct:
each geometry must pass the review recorded in `data/geometry-audit.json`
before it is shown on the public map. Its city-scale morphology includes
the Albaicín, lower medina, Alhambra and Generalife; the Darro and Genil;
principal wall systems, gates, and two defensible routes; and an explicitly
approximate late-Nasrid urban extent. Labels and confidence styling are designed
to communicate the form of the city before a user opens an individual feature.

The corrective pass and M4 review have verified all 36 geometries. The lower-medina wall is
reconstructed from a documented sequence of modern streets and archaeological
anchors; the lower-medina area is derived from that enclosure and other reviewed
axes; and the late-Nasrid urban extent is the reproducible union of the verified
Albaicín, lower-medina, and Alhambra sectors rather than a hand-drawn envelope.
The first monument set adds the two major mosques, Alcaicería, Zacatín, Corral
del Carbón, Maristán, El Bañuelo, Puerta de Guadix, and Puerta de los Tableros /
Puente del Cadí, with surviving fabric kept distinct from representative points
and approximate reconstructions.

A second urban-structure set adds six explicitly approximate historical quarters:
Alcazaba Qadima, Axares, Garnata al-Yahud, the Alfareros quarter,
Antequeruela, and the Loma quarter. Their map labels sit below the broader
city sectors in the information hierarchy; historical names are retained where
useful, while Spanish descriptions and modern landmarks make each area legible.

See:

- [Product specification](docs/SPEC.md)
- [Implementation roadmap](docs/ROADMAP.md)
- [Licensing decision](docs/decisions/0001-project-licensing.md)
- [Data workspace](data/README.md)
- [GIS workflow](gis/README.md)

## Principles

- Prefer historical usefulness to decorative mapping.
- Show uncertainty instead of disguising it as precise geometry.
- Keep modern Granada legible for comparison.
- Put evidence and citations in the feature interface.
- Use open, portable formats and a static-site architecture.
- Publish only reviewed historical features.

## Stack

- Vite, React, and TypeScript
- MapLibre GL JS
- GeoJSON in WGS84 (EPSG:4326) as the canonical public data format
- QGIS in ETRS89 / UTM zone 30N (EPSG:25830) for GIS editing
- Zod-compatible data validation and Vitest tests
- GitHub Pages deployment through GitHub Actions

No backend, account system, paid GIS subscription, or proprietary canonical
data format is required for the proof of concept.

## Local development

Requirements: Node.js 24 and npm. QGIS LTR is also required for cartographic
editing, but not for ordinary frontend development.

```sh
npm install
npm run dev
```

Vite serves the project at
`http://localhost:5173/granada-historica/` by default.

Before submitting changes, run the same checks used by CI:

```sh
npm run lint
npm run validate:data
npm test
npm run build
```

Copy `.env.example` to `.env.local` to override the default
MapLibre-compatible basemap style URL. Never commit provider secrets.

To create the local EPSG:25830 cartographic workspace or export reviewed QGIS
edits back to the public EPSG:4326 GeoJSON files:

```powershell
npm run gis:bootstrap
npm run gis:export
```

See [gis/README.md](gis/README.md) before rebuilding a workspace that contains
unexported changes.

## Deployment

The deployment workflow validates the historical dataset, builds the app, and
publishes `dist/` on pushes to `main`. The project URL is:

`https://aztlon.github.io/granada-historica/`

## Repository layout

```text
docs/                 Product specification, roadmap, and decisions
data/geo/             Canonical public point, line, and area GeoJSON
data/content/         Optional long-form feature content
gis/                  QGIS workflow and project files
src/                  Web application source (from M1)
public/assets/         Publicly reusable static assets
scripts/               Data and build utilities
.github/workflows/     CI and deployment workflows
```

Restricted research scans and unlicensed third-party material must not be
committed.

## Milestones

The proof of concept progresses from the working map shell (M1), through the
validated historical data system and city morphology, to at least 30 reviewed
features and a public usability pass. The detailed gates and issue-sized tasks
are in [docs/ROADMAP.md](docs/ROADMAP.md).

## Contributing

Before contributing historical material, read the methodology and provenance
requirements in [docs/SPEC.md](docs/SPEC.md). Every public feature must have a
stable ID, explicit spatial and temporal confidence, geometry provenance, at
least one resolvable citation, `publishable` review status, and a `verified`
entry in the geometry audit.

Add canonical geometry to the matching file in `data/geo/`, register every
referenced source in `data/sources.json`, and document the check in
`data/geometry-audit.json`. A feature appears on the map only when both its
content and geometry have passed review; `npm run validate:data` reports broken
identifiers, geometry, citations, coordinate ranges, audit coverage, and
publication requirements.

Do not commit source imagery, copied datasets, or traced geometry unless its
reuse terms have been checked and recorded.

## License

Original software code is licensed under the MIT License. Original data and
documentation are licensed under Creative Commons Attribution 4.0 International
(CC BY 4.0). Third-party material is excluded and remains under its respective
terms. See [LICENSE](LICENSE) for details.
