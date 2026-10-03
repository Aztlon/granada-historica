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

Preview implementation:

1. [x] Define durable route and place URLs so a public marker can open the
   relevant map position and historical feature without requiring an app.
2. [x] Add an opt-in, client-side `where am I?` mode that updates while the page
   is open without transmitting or persisting a visitor's coordinates. The map
   follows by default, keeps the location visible after a manual pan, and offers
   a standard recenter control.
3. [x] Add a focused desktop side panel and mobile place sheet for the five-stop
   Bibarrambla route, with numbered map stops and feature drill-down.
4. [x] Add Spanish/English interface and content-routing foundations plus full
   English records for the six pilot-related entities.
5. [x] Generate five stable high-error-correction SVG QR codes, a bilingual test
   sheet, and a signage/maintenance proposal.
6. [x] Add route, language, location, privacy, build-entry, and QR validation
   coverage, including deployment smoke checks.
7. [ ] Complete historical/editorial and native-English review.
8. [ ] Field-check anchor placement, the accessible pedestrian progression, and
   representative iOS/Android QR scans.
9. [ ] Complete participant and accessibility testing; resolve all critical
   findings and name maintenance ownership.
10. [ ] Change the pilot from `preview` to `active`, expose it in navigation,
    and publish v0.1.1 after partner approval.

Candidate demonstration: a QR marker in or near Plaza de Bib-Rambla opens the
historical position of Bab al-Ramla, relates it to the wall, Alcaicería, Zacatín,
Madraza, and Mezquita Mayor, and distinguishes the original site from the
surviving reconstructed fabric in the Alhambra woods.

The implemented sequence is Bibarrambla → Zacatín → Alcaicería → Madraza →
Mezquita Mayor. Preview URLs remain directly available with `noindex`, but the
route is hidden from the main map navigation until the activation gates pass.

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

Preparation began on 2026-10-01. The source-backed baseline inventory and the
non-breaking migration design are in [C1550-RESEARCH.md](C1550-RESEARCH.md) and
[C1550-ARCHITECTURE.md](C1550-ARCHITECTURE.md). The research files are validated
but are not loaded by the public application.

#### M10.0 — Scope, sources, and non-public scaffolding

- [x] Adopt c. 1550 and its 1540–1560 evidence window in
  [ADR 0002](decisions/0002-second-period-c1550.md).
- [x] Register c. 1492 as published and c. 1550 as research.
- [x] Triage all 58 current entities and register the first 23 c. 1550
  candidates and six change themes.
- [x] Define generic period-state, construction-state, change, research, and
  period-GeoJSON schemas.
- [x] Validate source resolution, candidate uniqueness, complete triage
  coverage, and the non-public status of c. 1550.

Exit gate: the research target, vocabulary, inventory, sources, and technical
contracts are explicit and validated without changing the public application.

#### M10.1 — c. 1492 compatibility foundation

- [x] Define the stable entity catalogue evolved from the current gazetteer.
- [x] Generate parallel c. 1492 period GeoJSON from the current canonical files
  without deleting or rewriting them.
- [x] Add parity tests for IDs, feature counts, geometry hashes, publication
  state, source citations, search content, labels, and rendered behaviour.
- [x] Generalise geometry-audit identity to `(period_id, feature_id)` in a
  backwards-compatible form.
- [x] Add a period-aware QGIS/export path alongside the existing workflow.

Completed on 2026-10-01. The generated projection contains 70 stable entities,
58 c. 1492 period features, and 58 period-keyed geometry reviews. The legacy
files remain canonical and untouched; `npm run periods:generate` can recreate
the complete projection, and `npm run periods:check` plus the parity suite
guards every published behaviour listed above.

Exit gate: the period-aware c. 1492 dataset is demonstrably identical to the
current public experience and can be discarded without data loss.

#### M10.2 — c. 1550 research GIS and geometry package

- [x] Create research-only c. 1550 point, line, and polygon layers; do not load
  them in the application.
- [x] Require a source, reconstruction method, spatial and temporal confidence,
  and audit status for every research geometry.
- [x] Begin with secure or tightly bounded anchors: Capilla Real, Lonja,
  Madraza/Cabildo, Maristán/Casa de la Moneda, Palace of Charles V, Puerta de
  las Granadas, and retained Alhambra fabric.
- [x] Keep active-building phases, including the Cathedral, Chancillería,
  Hospital Real, San Miguel Bajo, and San Cristóbal, at point level until phase
  plans support more detail.
- [x] Defer population, parish, whole-city, public-space, and
  infrastructure-change polygons that lack sixteenth-century spatial evidence.

Completed on 2026-10-01. At the M10.2 exit the private package contained 12
points, one line, two areas, and 15 matching `in_review` geometry audits (M10.3
subsequently added two reviewed-slice points). Its manifest makes every
deferral and release condition explicit; its separate QGIS round trip cannot
write to public data. See [C1550-GIS.md](C1550-GIS.md).

Exit gate: a reviewable research geometry package exists with no unsupported
precision and no route into the public build.

#### M10.3 — Reviewed eight-entity vertical slice

- [x] Complete the Cathedral-precinct cluster: former Mezquita Mayor, Cathedral,
   Royal Chapel, Lonja, former Madraza/Cabildo, and University/Curia.
- [x] Complete the imperial-access cluster: Palace of Charles V and Puerta de las
   Granadas, with their relationships to retained gates and altered routes.
- [x] Complete fully cited Spanish and English content and prepare the
   historical, architectural, geometry, and translation review dossier.
- [ ] Obtain accountable specialist approval of the claims, construction
   phases, geometry decisions, and bilingual content.
- [x] Audit each period-specific geometry and resolve or expose overlaps between
   predecessor and successor entities.

Implemented to the responsible review boundary on 2026-10-01. The private
slice contains eight bilingual, claim-level cited records. It adds the converted
former Mezquita Mayor and the first University building to the GIS package,
corrects their period functions, and makes coexistence, attachment, containment,
and route relationships explicit. The machine-readable approval gate prevents
anonymous or partial promotion. See [M10-3-REVIEW.md](M10-3-REVIEW.md).

Exit gate: the vertical slice is `reviewed`, fully cited, translated, and
geometry-audited, but remains private. **Pending:** the four specialist
approvals; until then the dossier is `ready_for_specialist_review`, every slice
feature remains `research`, and every geometry remains `in_review`.

#### M10.4 — Internal comparison experience

- [x] Add a feature-flagged, internal-only 1492 / c. 1550 selector.
- [x] Preserve durable entity URLs with an explicit `period` parameter.
- [x] Explain absent, retained, converted, replaced, demolished, and unfinished
   states without silently changing the selected period.
- [x] Test keyboard and screen-reader access, mobile layout, performance, source
   display, cartographic ambiguity, and 1492 regressions.
- [x] Do not introduce a continuous timeline or year slider.

Implemented on 2026-10-01 as a separately compiled, `noindex` review surface.
It initially lazy-loaded the eight M10.3 records, keeps entity and period in the URL,
and distinguishes a post-1492 construction from an entity merely omitted from
the limited review slice. The public build contains no M10.3 narrative data.
See [M10-4-INTERNAL-COMPARISON.md](M10-4-INTERNAL-COMPARISON.md).

Exit gate: reviewers can compare the two states without exposing c. 1550 to
public navigation or implying year-by-year knowledge.

#### M10.5 — Defensible c. 1550 city state

- [x] Work through the remaining high- and medium-priority inventory by thematic
   cluster: parish city, civic centre, imperial Alhambra, public spaces,
   inherited systems, quarters, and population geography.
- [x] Promote only reviewed claims and audited geometries from research files into
   the period dataset.
- [x] Specify reproducible derivations for any city-wide analytical polygons,
   expose blockers, and express uncertainty visually and textually. No polygon
   is generated until its required components are reviewed.
- [x] Complete search, filters, names, relationships, translations, comparison
   copy, and source coverage for the release candidate.
- [ ] Obtain specialist review of the treatment of Morisco coercion, conversion,
   population geography, revolt, and later displacement.

Implemented to the safe internal-review boundary on 2026-10-02. The generated
dossier combines all 39 mapped geometries, covers the seven themes, and assigns
one decision to all 78 anchor/high/medium inventory records. Unsupported public
spaces, parish limits, population geography, and citywide extent remain
explicitly deferred instead of being drawn. See
[M10-5-CANDIDATE.md](M10-5-CANDIDATE.md).

Source-review tranche 1 adds ten more bilingual, cited records on 2026-10-02
without creating geometry. The matrix now separates content-ready records from
unstarted research. See
[M10-5-SOURCE-TRANCHE-1.md](M10-5-SOURCE-TRANCHE-1.md).

Source-review tranche 2 advances ten inherited systems—four gates, two wall
systems, three water features, and the Elvira street axis—on 2026-10-02. It
records uneven confidence and explicit geometry release conditions while
keeping the GIS package at 17 features. Across both tranches, 20 records are
now content-ready and geometry-deferred. See
[M10-5-SOURCE-TRANCHE-2.md](M10-5-SOURCE-TRANCHE-2.md).

Source-review tranche 3 advances the Generalife, Bañuelo, three Alhambra gates,
two bridges, the Genil, and the Cadí and Romayla canals on 2026-10-02. It
records early-modern transformations, corrects the Puente del Cadí/Puerta de
los Tableros identification, and uses 1531–1538 water evidence without creating
survey geometry. Across the three tranches, 30 records are content-ready and
geometry-deferred; 10 priority records remain unstarted. See
[M10-5-SOURCE-TRANCHE-3.md](M10-5-SOURCE-TRANCHE-3.md).

Source-review tranche 4 advances the final ten untouched priority records on
2026-10-02: four gates, three inner walls, two acequias, and the
Molinos–Sierra route. The active M10.5 matrix now has 40 content-ready source
records and no `research_not_started` decision; all ten new records remain
geometry-free. See
[M10-5-SOURCE-TRANCHE-4.md](M10-5-SOURCE-TRANCHE-4.md).

Geometry wave 1 then promotes the 16 lowest-risk records on 2026-10-02: six
church/convent site points, four surviving-gate points, two retained monument
envelopes, and four inherited line axes. The package now has 33 private
`in_review` geometries. Complex walls, canals, Generalife/Arrabal phases,
Fajalauza, and unresolved entities remain geometry-free. See
[M10-5-GEOMETRY-WAVE-1.md](M10-5-GEOMETRY-WAVE-1.md).

Geometry wave 2 re-audits those 14 deferrals on 2026-10-02 and promotes six:
Fajalauza as a surviving-site point plus the Real, Aynadamar, Gorda, Cadí, and
Romayla main canal axes. Each is limited by multiple controls and explicit
component exclusions. Eight records remain geometry-free, and the package now
has 39 private `in_review` geometries. See
[M10-5-GEOMETRY-WAVE-2.md](M10-5-GEOMETRY-WAVE-2.md).

Evidence preparation now also inventories 23 inputs and 12 quality criteria
for parish jurisdictions, the alignments of three public spaces, a
household/property/fiscal/habices corpus, and citywide composition. No geometry
was generated and every readiness gate remains closed. See
[M10-5-EVIDENCE-PREPARATION.md](M10-5-EVIDENCE-PREPARATION.md).

Exit gate: c. 1550 is a coherent release candidate rather than a collection of
isolated monuments, and every visible claim meets the same standard as c. 1492.
**Pending:** recorded decisions for all six accountable review functions,
geometry verification,
and the source work identified by the inventory matrix. The present status is
`ready_for_specialist_review`, not `release_candidate`.

These functions do not imply external consultants or institutional partners.
Historical review is owner-led by the project historian; see
[C1550-REVIEW-GOVERNANCE.md](C1550-REVIEW-GOVERNANCE.md).

#### M10.6 — Canonical migration, publication, and stewardship

1. Promote the period-aware files only after c. 1492 parity remains exact and
   the c. 1550 release gate passes.
2. Migrate search, drawer content, routes, entrypoint generation, QGIS,
   validation, exports, and educational clients.
3. Remove legacy year-named fields only after every consumer uses period
   states and a rollback path has been tested.
4. Establish durable editorial governance across historical, archaeological,
   architectural, artistic, GIS, educational, and maintenance competencies.
5. Define long-term hosting, review, asset licensing, attribution, and
   maintenance responsibilities. Institutional collaboration may be explored
   later but is not a release prerequisite.

Exit gate: c. 1492 and c. 1550 operate as separately reviewable, comparable
states on maintained public historical infrastructure rather than as a one-off
tourism or AR application.
