# Implementation roadmap

The product scope and milestone definitions live in [SPEC.md](SPEC.md). This
file turns the remaining milestones into issue-ready work without expanding
the agreed v0.1 scope.

## M0 — Specification and repository setup

- [x] Product specification and historical methodology
- [x] Project README
- [x] Dual-license decision for original code and original data/documentation
- [x] Initial repository structure
- [x] Provenance and restricted-research-file policy
- [x] Issue-ready implementation sequence

Exit gate: scope, methodology, and licensing are documented and ready for owner
review.

## M1 — Working map shell

1. [x] Scaffold Vite, React, and TypeScript with linting and tests.
2. [x] Add MapLibre and a configurable `VITE_BASEMAP_STYLE_URL`.
3. [x] Center the initial responsive map on Granada.
4. [x] Add the period badge, layer-control shell, and feature-drawer shell.
5. [x] Add GitHub Actions for CI and GitHub Pages deployment.
6. [x] Verify the local production UI in desktop and mobile viewports.
7. [x] Verify the deployed public URL after the first push to `main`.

Exit gate: a public URL loads an interactive Granada map.

## M2 — Historical data system

1. [x] Define the shared TypeScript/Zod feature and source schemas.
2. [x] Add canonical point, line, and area GeoJSON plus the source registry.
3. [x] Validate IDs, enums, citations, coordinates, and publishability rules.
4. [x] Add category and confidence styling, including non-color distinctions.
5. [x] Add selection, detail content, evidence notes, and citations.
6. [x] Add reviewed point, line, area, and approximate geometry examples.

Exit gate: a valid GeoJSON feature becomes explorable without application-code
changes.

## M3 — Historical morphology

1. [x] Establish the QGIS project in EPSG:25830 and export workflow to EPSG:4326.
2. [ ] Correct and revalidate the major urban sectors and their labels.
3. [ ] Correct and revalidate the major walls, gates, rivers, and defensible routes.
4. [ ] Reconstruct the Alhambra, Generalife, lower medina, and Albaicín relationship from explicit evidence.
5. [ ] Complete the per-entity geometry audit; no draft geometry is presumed correct.

Corrective-pass checkpoint: 18 of 21 geometries are verified. The lower-medina
wall, lower-medina area, and composite late-Nasrid extent remain withheld.

Exit gate: the map communicates city-scale form before individual monuments.

## M4 — First reviewed dataset

1. Build and prioritize the candidate feature inventory.
2. Extract claims and record source locators.
3. Draft content and geometry for each candidate.
4. Review confidence, names, claims, geometry, and reuse status.
5. Publish at least 30 substantive features across multiple categories.

Exit gate: 30 or more cited, publishable features have meaningful details.

## M5 — Search, comparison, and polish

1. Add normalized search across names, aliases, and modern landmarks.
2. Add category filters, layer toggles, and historical opacity.
3. Add URL-selected features with query parameters.
4. Tune labels, legend, keyboard behavior, touch targets, and mobile layout.
5. Test the interactions and complete an accessibility pass.

Exit gate: discovery, comparison, sharing, and core interactions work across
desktop and mobile.

## M6 — Public proof-of-concept review

1. Test the representative historical questions listed in the specification.
2. Conduct historical, geographic, copyright, accessibility, and performance QA.
3. Record and correct errors or misleading precision.
4. Confirm the repository alone can rebuild and deploy the site.

Exit gate: all v0.1 acceptance criteria in the specification pass.
