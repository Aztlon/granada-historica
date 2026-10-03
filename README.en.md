# Granada Histórica

[Español](README.md) | **English**

Granada Histórica is an interactive historical atlas that places a sourced,
uncertainty-aware reconstruction of **Granada, c. 1492** over the modern city.
The first release is deliberately focused on the final years of Nasrid Granada.

The map is intended to explain not only what may have occupied a place, but how
securely its location and date are known, which evidence supports the
reconstruction, what happened after 1492, and what is there today.

## Project status

Milestones **M0 — Specification and repository setup**, **M1 — Working map
shell**, **M2 — Historical data system**, **M3 — Historical morphology**,
**M4 — First reviewed dataset**, **M5 — Search, comparison, and polish**, and
**M6 — Public proof-of-concept review** are complete. v0.1 is ready as a public
proof of concept. The app
now renders validated historical GeoJSON over an
interactive map of Granada, distinguishes categories and levels of spatial
certainty, supports normalized search, comparison controls, filtering, URL-based
selection, and exposes historical context, provenance, name attestation,
survival status, and citations in each feature card.

M7 now has a preview implementation: a bilingual five-stop route from
Bibarrambla to the former Great Mosque, durable links, QR codes, focused place
views, and continuously updating in-page location processed on the device. It remains hidden from the
main navigation and marked `noindex` until historical and native-English review,
field checks, accessibility testing, and maintenance approval are complete.
Visual reconstruction and augmented reality remain outside this pilot.
See the [roadmap](docs/ROADMAP.md) and [specification](docs/SPEC.md).

The second temporal state is now committed: **Granada, c. 1550 — The Morisco
and Renaissance city**. It will use an approximate 1540–1560 evidence window
and show Christian and imperial transformation without erasing the continuity
of the Morisco city before 1568. The decision, scope, and data-model
consequences are recorded in
[ADR 0002](docs/decisions/0002-second-period-c1550.md). Research and
implementation belong to M10 and are not yet part of the public c. 1492
dataset.

M10 preparation now includes a validated
[research inventory](docs/C1550-RESEARCH.md): it covers all 58 current features,
registers 23 new candidates, and keeps every c. 1550 hypothesis outside the
public application. The [temporal migration design](docs/C1550-ARCHITECTURE.md)
separates stable entities, period states, and date-specific audited geometry.
M10.1 now reproduces c. 1492 in parallel as 70 stable entities, 58 geographic
states, and 58 period-keyed audits, with exact parity tests and no change to the
public application.
M10.2 adds a [private c. 1550 GIS package](docs/C1550-GIS.md), expanded by M10.3
to 17 geometries. The
[eight-entity vertical slice](docs/M10-3-REVIEW.md) now has bilingual content,
cited claims, explicit relationships, and an accountable approval gate; none
is imported by the public application or marked verified.
M10.5 now combines 39 geometries into a
[coherent internal candidate](docs/M10-5-CANDIDATE.md), classifies all 78
priority inventory records, and keeps unsupported urban and demographic
polygons deferred. Its six specialist reviews remain pending.
These are review functions that may be fulfilled within the project, not a
dependency on institutional partners; historical review is owner-led by the
project historian.
The first [additional source tranche](docs/M10-5-SOURCE-TRANCHE-1.md)
develops ten more entities with bilingual cited content while adding no
speculative geometry. The
[second tranche](docs/M10-5-SOURCE-TRANCHE-2.md) does the same for ten inherited
gates, walls, water systems, and routes. The
[third tranche](docs/M10-5-SOURCE-TRANCHE-3.md) adds ten connected Generalife,
Alhambra-access, bridge, bath, river, and canal records; 30 records now have
review-ready content. The
[first low-risk geometry wave](docs/M10-5-GEOMETRY-WAVE-1.md) promotes 16 of
them to private `in_review` geometry: six site points, four gates, two monument
envelopes, and four inherited axes. A
[second controlled wave](docs/M10-5-GEOMETRY-WAVE-2.md) adds Fajalauza and five
principal canal axes with explicit controls and exclusions; eight of the
original 14 deferrals remain geometry-free.

The working dataset contains 58 cited and publishable features and a 70-entry
historical gazetteer. None is assumed spatially correct:
each geometry must pass the review recorded in `data/geometry-audit.json`
before it is shown on the public map. Its city-scale morphology includes
the Albaicín, lower medina, Alhambra and Generalife; the Darro and Genil;
the principal acequias, wall systems, gates, bridges, and movement corridors;
and an explicitly approximate late-Nasrid urban extent. Labels and confidence styling are designed
to communicate the form of the city before a user opens an individual feature.

The corrective pass, M4 review, and first M6 expansion have verified all 58 geometries. The lower-medina wall is
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

A subsequent eastern and southern urban-edge review adds al-Ramla, al-Bayyazin,
the Fajjarin/Assal cemetery zone, and four gates associated with the late-Nasrid
enclosure. It also separates the interior Mauror–Realejo wall from the outer wall,
corrects Antequeruela and the relationship between Alfareros and the Loma, and
revises the lower-medina boundary without presenting uncertain stretches as exact.

The first M6 expansion adds Aynadamar, Axares, Romayla, Cadí, Gorda, its Realejo
branch, Tarramonta, Arabuleila, and the Acequia Real; the Puente del Carbón; the Darro and Molinos
movement corridors; and the interior enclosures of the Alcazaba Qadima and
Axares. The gazetteer also retains twelve candidate, disputed, rejected, or
unlocated names without inventing map points for them. A subsequent water-layer
review corrects Gorda, Aynadamar, Axares/San Juan, Romayla, Bab al-Difaf, and
the displaced Alcazaba Qadima and Axares wall circuits. Successive walls now
state whether they were outer, inner, or palatine enclosures around 1492.

The 23 September 2026 audit adds reproducible affine registration of the source
plan, corrects the mosque's Axares supply, the eastern Genil crossings and
Puente del Carbón, and reconstructs shared quarter boundaries. Decisions,
source disagreements and limitations are recorded in
[the methodology](docs/WATER-NETWORK-METHOD.md).

See:

- [Product specification](docs/SPEC.md)
- [Implementation roadmap](docs/ROADMAP.md)
- [Licensing decision](docs/decisions/0001-project-licensing.md)
- [Granada c. 1550 decision](docs/decisions/0002-second-period-c1550.md)
- [c. 1550 research inventory](docs/C1550-RESEARCH.md)
- [Multi-period architecture](docs/C1550-ARCHITECTURE.md)
- [c. 1550 review governance](docs/C1550-REVIEW-GOVERNANCE.md)
- [Private c. 1550 GIS package](docs/C1550-GIS.md)
- [M10.5 internal candidate](docs/M10-5-CANDIDATE.md)
- [M10.5 source-review tranche 1](docs/M10-5-SOURCE-TRANCHE-1.md)
- [M10.5 source-review tranche 2](docs/M10-5-SOURCE-TRANCHE-2.md)
- [M10.5 source-review tranche 3](docs/M10-5-SOURCE-TRANCHE-3.md)
- [M10.5 source-review tranche 4](docs/M10-5-SOURCE-TRANCHE-4.md)
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

The internal comparison between 1492 and the c. 1550 M10.5 candidate is disabled in
public mode, and its private data is excluded from the public build. To open or
verify that internal surface only:

```sh
npm run dev:internal
npm run build:internal
npm run test:e2e:internal
```

The internal output is written to `dist-internal/`, applies `noindex,nofollow`
at runtime, and must not be deployed. See
[docs/M10-4-INTERNAL-COMPARISON.md](docs/M10-4-INTERNAL-COMPARISON.md).

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
