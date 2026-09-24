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
2. [x] Correct and revalidate the major urban sectors and their labels.
3. [x] Correct and revalidate the major walls, gates, rivers, and defensible routes.
4. [x] Reconstruct the Alhambra, Generalife, lower medina, and Albaicín relationship from explicit evidence.
5. [x] Complete the per-entity geometry audit; no draft geometry is presumed correct.

Corrective-pass result: all 21 geometries in the initial morphology set were
verified. Approximate and reconstructed borders retain explicit confidence,
provenance, and limitation notes; later M4 additions follow the same audit process.

Exit gate: the map communicates city-scale form before individual monuments.

## M4 — First reviewed dataset

1. [x] Build and prioritize the candidate feature inventory.
2. [x] Extract claims and record source locators.
3. [x] Draft content and geometry for each candidate.
4. [x] Review confidence, names, claims, geometry, and reuse status.
5. [x] Publish at least 30 substantive features across multiple categories.

M4 result: the dataset now contains 44 cited, publishable features with 44
verified geometry audits and 48 registered sources. The first nine additions cover
the Puerta de Guadix, both major mosques, the Alcaicería and Zacatín commercial
core, the Corral del Carbón, Maristán, El Bañuelo, and the Puerta de los
Tableros / Puente del Cadí. Surviving footprints, modern reference points, and
approximate historical areas remain explicitly distinguished.

The subsequent urban-structure set adds Alcazaba Qadima, Axares, Garnata
al-Yahud, the Alfareros quarter, Antequeruela, and the Loma quarter. These
reconstructions use a dedicated historical-quarter subtype and label layer;
they complement, rather than replace, the broader analytical sectors such as
the lower medina. Contested extents and overlaps remain visible in each
feature's confidence and evidence notes.

The later eastern and southern urban-edge review adds al-Ramla, al-Bayyazin,
the Fajjarin/Assal cemetery zone, and the Bab al-Fajjarin, Bab Mawrur, Puerta del
Pescado, and Puerta de la Loma/Molinos gates. It separates the interior
Mauror–Realejo wall from the outer late-Nasrid enclosure and corrects the placement
and interpretation of Antequeruela, Alfareros, the Loma, and the lower-medina
boundary. Uncertain wall stretches and neighborhood limits remain explicitly
probable or approximate rather than being promoted to secure geometry.

Exit gate: 30 or more cited, publishable features have meaningful details.

## M5 — Search, comparison, and polish

1. [x] Add normalized search across names, aliases, and modern landmarks.
2. [x] Add category filters, layer toggles, and historical opacity.
3. [x] Add URL-selected features with query parameters.
4. [x] Tune labels, legend, keyboard behavior, touch targets, and mobile layout.
5. [x] Test the interactions and complete an accessibility pass.

M5 result: accent-insensitive search now ranks canonical names, historical
names, aliases, current names, streets, and modern landmarks, with keyboard and
mobile result selection. Users can independently toggle the modern context and
historical overlay, adjust historical opacity, filter categories, and reveal all
or no categories. Feature selections persist in `?feature=` URLs and browser
history, restore hidden categories when necessary, and focus the map on the
selected geometry. Label collision rules, responsive search, touch targets,
focus restoration, Escape handling, drawer focus containment, and reduced-motion
behavior received an accessibility and interaction pass. Citations use a
consistent author–title–publisher–year format while preserving locators,
identifiers, supported claims, and direct source links.

Exit gate: discovery, comparison, sharing, and core interactions work across
desktop and mobile.

## M6 — Public proof-of-concept review

1. [x] Test the representative historical questions listed in the specification.
2. [x] Conduct the v0.1 historical, geographic, copyright, accessibility, and
   performance review.
3. [x] Record and correct errors or misleading precision found during the
   corrective passes.
4. [x] Confirm the repository alone can rebuild and deploy the site.

Completed M6 research-infrastructure work:

1. [x] Create a canonical 70-entry gazetteer covering all 58 mapped entities
   plus candidate, disputed, rejected, and unlocated names.
2. [x] Add the principal water system, a first bridge inventory, and the main
   missing movement corridors without implying survey-level precision.
3. [x] Distinguish the outer late-Nasrid enclosures from the earlier interior
   circuits of the Alcazaba Qadima, Axares, and Mauror–Realejo.
4. [x] Add structured name-attestation, survival, and defensive-context fields,
   validate them, and expose them in feature cards.

Final v0.1 dataset result: 58 cited, publishable, and geometrically audited map
features; 70 gazetteer records; and 57 registered sources. The September 2026
water/urban audit adds reproducible affine registration, corrects mosque supply
and upstream canal crossings, places
Carbón on the Darro, and reconstructs shared quarter boundaries. Automated
checks cover endpoints, crossings, bridge alignments, gates, and shared edges;
source conflicts and mixed historical phases remain documented in
`WATER-NETWORK-METHOD.md`. Automated validation, tests, a clean production
build, and live desktop/mobile review complete the public proof of concept.
Future expert review remains welcome and may revise individual interpretations
without reopening the v0.1 product milestone.

Exit gate: all v0.1 acceptance criteria in the specification pass.

## Post-v0.1 — Public historical infrastructure

The next stage treats Granada Histórica as an open historical data and
interpretation platform. QR access, location-aware exploration, illustrated
reconstruction, AR, VR, educational displays, and future periods should remain
presentation layers over the same sourced entities, geometries, dates,
translations, citations, and confidence metadata.

This is a collaboration roadmap rather than committed v0.1 scope.

### M7 — Place-based public access pilot

1. Define durable place URLs and a QR resolver so a public marker can open the
   relevant map position and historical feature without requiring an app.
2. Add an opt-in, client-side `where am I?` mode; do not transmit or retain a
   visitor's coordinates by default.
3. Design a focused mobile place view for use while standing in the city.
4. Add Spanish/English interface and content-routing foundations.
5. Develop a signage and maintenance proposal with the Ayuntamiento or another
   institutional partner, beginning with a small, evaluated pilot.

Candidate demonstration: a QR marker in or near Plaza de Bib-Rambla opens the
historical position of Bab al-Ramla, relates it to the wall, Alcaicería, Zacatín,
Madraza, and Mezquita Mayor, and distinguishes the original site from the
surviving reconstructed fabric in the Alhambra woods.

Exit gate: a visitor can move from a physical place to its sourced historical
context in one scan, with no installation and a clear privacy explanation.

### M8 — Reviewed visual reconstruction

1. Extend the data model with optional reconstruction assets, represented date,
   authorship, license, review state, and component-level confidence.
2. Produce historically reviewed illustrated reconstructions for a small number
   of high-value sites before attempting citywide coverage.
3. Present secure, probable, approximate, and artistic-inference elements as
   visibly different parts of the reconstruction.
4. Preserve a useful text, map, and image experience when no 3D asset exists.

The first reconstruction should be selected for evidentiary quality and public
legibility, not spectacle alone. Bab al-Ramla is a strong candidate because its
original position, documented form, demolition, surviving material, and later
reconstruction make the spatial argument immediately understandable.

Exit gate: at least one visual reconstruction is publishable, attributable,
licensed, reviewed, and explicit about uncertainty.

### M9 — Optional AR window pilot

1. Test browser-based AR at one reviewed site without making AR a prerequisite
   for the map or requiring a native application.
2. Evaluate GPS, device orientation, and a visible landmark/manual calibration
   step; ordinary phone GPS must not be presented as architectural precision.
3. Provide a non-camera fallback with the same history, sources, and artwork.
4. Test performance, accessibility, safety, privacy, and device compatibility
   in the actual street environment.

Exit gate: the pilot places a reviewed reconstruction usefully and honestly at
one site, while degrading gracefully on unsupported devices.

### M10 — Multi-period civic platform

1. Add a second historically defensible city state before introducing a time
   slider.
2. Establish editorial governance with historians, archaeologists,
   architectural historians, artists, GIS specialists, educators, and public
   institutions.
3. Reuse the canonical historical model across maps, QR routes, AR/VR,
   exhibitions, research exports, and educational material.
4. Define long-term hosting, review, asset licensing, attribution, and
   maintenance responsibilities with institutional partners.

Exit gate: Granada Histórica operates as maintained public historical
infrastructure rather than as a one-off tourism or AR application.
