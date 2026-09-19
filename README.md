# Granada Histórica

Granada Histórica is an interactive historical atlas that will place a sourced,
uncertainty-aware reconstruction of **Granada, c. 1492** over the modern city.
The first release is deliberately focused on the final years of Nasrid Granada.

The map is intended to explain not only what may have occupied a place, but how
securely its location and date are known, which evidence supports the
reconstruction, what happened after 1492, and what is there today.

## Project status

Milestones **M0 — Specification and repository setup**, **M1 — Working map
shell**, and **M2 — Historical data system** are complete. The app now renders
validated historical GeoJSON over an interactive map of Granada, distinguishes
categories and levels of spatial certainty, supports filtering and selection,
and exposes historical context, provenance, and citations in each feature card.

The M2 seed dataset contains three reviewed examples: the Madraza Yusufiyya,
the Río Darro, and a deliberately approximate area for the Alhambra. They test
point, line, and polygon rendering without implying that the historical dataset
is complete.

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

## Planned stack

- Vite, React, and TypeScript
- MapLibre GL JS
- GeoJSON in WGS84 (EPSG:4326) as the canonical public data format
- QGIS in ETRS89 / UTM zone 30N (EPSG:25830) for GIS editing
- Zod-compatible data validation and Vitest tests
- GitHub Pages deployment through GitHub Actions

No backend, account system, paid GIS subscription, or proprietary canonical
data format is required for the proof of concept.

## Local development

Requirements: Node.js 24 and npm.

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

Some directories are placeholders until their corresponding milestone begins.
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
least one resolvable citation, and `publishable` review status.

Add canonical geometry to the matching file in `data/geo/` and register every
referenced source in `data/sources.json`. A valid `publishable` feature appears
on the map automatically; `npm run validate:data` reports broken identifiers,
geometry, citations, coordinate ranges, and publication requirements.

Do not commit source imagery, copied datasets, or traced geometry unless its
reuse terms have been checked and recorded.

## License

Original software code is licensed under the MIT License. Original data and
documentation are licensed under Creative Commons Attribution 4.0 International
(CC BY 4.0). Third-party material is excluded and remains under its respective
terms. See [LICENSE](LICENSE) for details.
