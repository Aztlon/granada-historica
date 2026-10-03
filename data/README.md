# Data workspace

`geo/` contains the canonical public GeoJSON, split into points, lines, and
areas. `gazetteer.json` is the canonical inventory of mapped, candidate,
disputed, rejected, and still-unlocated entities. `content/` is reserved for
long-form feature content if keeping it inside GeoJSON becomes cumbersome.
`sources.json` is the normalized source registry, and `geometry-audit.json`
records the independent cartographic review state.
`periods.json` registers represented dates and their publication state.
`entity-presentations.json` supplies the canonical Spanish name, sourced
period-agnostic lede, and optional English lede for every public information
sheet.
`entities.json`, `periods/c1492/`, and `geometry-audit-periods.json` are the
discardable M10.1 compatibility projection generated from the current
gazetteer, public GeoJSON, and geometry audit.
`research/` contains validated working inventories that are excluded from the
public build. Selected c. 1550 files are loaded only by the feature-flagged
internal comparison and must never be treated as public historical layers.

Public web coordinates must use WGS84 (EPSG:4326). Every feature must follow the
schema and provenance rules in `docs/SPEC.md`; in particular, it needs a stable
ID, spatial and temporal confidence, a geometry method, evidence types,
publication status, and resolvable citations.

Do not add placeholder historical claims to production data. Seed features must
be clearly marked as demo material or pass historical review.

## Adding a feature

1. Add the feature to `points.geojson`, `lines.geojson`, or `areas.geojson`.
2. Give the top-level feature and its properties the same permanent ID.
3. Add every bibliographic or geometry source to `sources.json`.
4. Reference those source IDs from `citations` and `geometry_source_refs`.
5. Record separate locational and temporal confidence values.
6. Use `publication_status: "publishable"` only after historical review.
7. Add or update the matching entry in `geometry-audit.json`. Use `verified`
   only after recording the check date, sources, method, and limitations.
8. Run `npm run validate:data`.

Every mapped feature also requires exactly one `gazetteer.json` entry. The
gazetteer records the status of the name attestation and material survival,
and may relate the feature to successive defensive enclosures. Keep known but
unmapped candidates in the inventory with `feature_id: null`; never invent a
point merely to satisfy the inventory.

The frontend imports these files directly. A valid public feature appears only
when it is both `publishable` and geometrically `verified`, without editing
application code.

## Multi-period research

The committed second state is c. 1550. Its working inventory lives in
`research/c1550-inventory.json`; methodology and architecture are documented in
[`docs/C1550-RESEARCH.md`](../docs/C1550-RESEARCH.md) and
[`docs/C1550-ARCHITECTURE.md`](../docs/C1550-ARCHITECTURE.md).

The inventory is deliberately separate from `geo/`. Its candidate IDs,
sources, research status, and complete triage coverage are validated, but no
candidate becomes public merely by appearing there. Do not add `*_1550` fields
to the current schema. Period-specific geometry and content will be introduced
through the compatibility migration described in the architecture document.

M10.2 geometry lives under `research/c1550/`: three GeoJSON layers, a manifest,
and a period-specific geometry audit. M10.3 expands the package to 17 private
geometries and adds `m10.3-review.json`, containing the bilingual eight-entity
slice, claim-level citations, relationships, geometry decisions, and four
accountable sign-off records. All audit records remain `in_review`, and the
public frontend imports none of these files. The internal comparison imports
only its validated candidate subset. The package and review boundary are
documented in [`docs/C1550-GIS.md`](../docs/C1550-GIS.md) and
[`docs/M10-3-REVIEW.md`](../docs/M10-3-REVIEW.md).

M10.5 adds `m10.5-supplement.json` and the reproducibly assembled
`m10.5-candidate.json`. The candidate covers all 39 mapped research features,
seven themes, 78 priority inventory decisions, four explicitly deferred
analytical layers, and six pending accountable review functions. It is consumed only
by the feature-flagged internal comparison. See
[`docs/M10-5-CANDIDATE.md`](../docs/M10-5-CANDIDATE.md).

The information-sheet presentation layer is split at the publication boundary.
The public registry contains exactly the 58 public entities. The private
`research/c1550/entity-presentations.json` addendum contains only the 17
c. 1550-only entities, while `research/c1550/period-title-decisions.json`
governs the 39 period headings. Shared entities always inherit the public lede;
do not duplicate them in the private addendum.

The first M10.5 source-review tranche lives in
`research/c1550/m10.5-source-review.json`. It advances ten additional records
to bilingual content review while adding no geometry. Its two evidence-led
inventory corrections and geometry boundaries are documented in
[`docs/M10-5-SOURCE-TRANCHE-1.md`](../docs/M10-5-SOURCE-TRANCHE-1.md).

The second source-review tranche lives in
`research/c1550/m10.5-source-review-2.json`. It advances ten inherited gate,
wall, water, and route systems while preserving unequal confidence and adding
no geometry. See
[`docs/M10-5-SOURCE-TRANCHE-2.md`](../docs/M10-5-SOURCE-TRANCHE-2.md).

The third source-review tranche lives in
`research/c1550/m10.5-source-review-3.json`. It advances ten connected
Generalife, Alhambra-access, bridge, bath, river, and canal records, while
correcting inherited identifications and adding no geometry. See
[`docs/M10-5-SOURCE-TRANCHE-3.md`](../docs/M10-5-SOURCE-TRANCHE-3.md).

The fourth source-review tranche lives in
`research/c1550/m10.5-source-review-4.json`. It advances the final ten
untouched priority gates, inner walls, canals, and route records without
creating geometry. The active decision matrix now contains no
`research_not_started` record. See
[`docs/M10-5-SOURCE-TRANCHE-4.md`](../docs/M10-5-SOURCE-TRANCHE-4.md).

The deferred-polygon evidence register lives in
`research/c1550/m10.5-evidence-preparation.json`. It catalogs known sources,
repository targets, missing inputs, bias, derivation protocols, uncertainty,
and closed readiness gates for parish jurisdictions, public spaces, population
geography, and citywide extent. It deliberately contains no spatial payload.
See
[`docs/M10-5-EVIDENCE-PREPARATION.md`](../docs/M10-5-EVIDENCE-PREPARATION.md).

The first low-risk geometry wave lives in
`research/c1550/m10.5-geometry-wave-1.json`. Its deterministic assembler adds
16 private, audited geometries and records the 14 source-reviewed entities that
remain deferred. See
[`docs/M10-5-GEOMETRY-WAVE-1.md`](../docs/M10-5-GEOMETRY-WAVE-1.md).

The second controlled geometry wave lives in
`research/c1550/m10.5-geometry-wave-2.json`. It promotes Fajalauza and five
canal axes as private `in_review` hypotheses, records at least two controls and
explicit exclusions for each, and keeps eight complex or unresolved records
geometry-free. See
[`docs/M10-5-GEOMETRY-WAVE-2.md`](../docs/M10-5-GEOMETRY-WAVE-2.md).

M10.1 is now available as an exact c. 1492 compatibility projection. Regenerate
and verify it with:

```powershell
npm run periods:generate
npm run periods:check
```

Do not hand-edit `entities.json`, `geometry-audit-periods.json`, or
`periods/c1492/`. Their generator preserves every legacy property and adds a
generic `period_state`; the validator proves ID, geometry, content, citation,
publication, and audit parity. Deleting these derived files loses no canonical
data because they can be recreated from `gazetteer.json`, `geo/`, and
`geometry-audit.json`.

## QGIS round trip

Use `npm run gis:bootstrap` to build the local EPSG:25830 GeoPackage and QGIS
project from these canonical files. After reviewing or editing geometry in
QGIS, use `npm run gis:export` to reproject, normalize, and validate all three
layers before they replace the public EPSG:4326 files. The complete workflow
and safeguards are documented in `gis/README.md`.

Use `npm run gis:period:bootstrap` and `npm run gis:period:export` for the
separate c. 1492 compatibility workspace. During M10.1 its export gate rejects
any drift from the canonical c. 1492 data.

Use `npm run gis:c1550:bootstrap` and `npm run gis:c1550:export` for the isolated
c. 1550 research workspace. That exporter can update only
`data/research/c1550/`; it cannot write to the public `data/geo/` layers.

The specific registration and topology rules for the Islamic water network are
documented in [`docs/WATER-NETWORK-METHOD.md`](../docs/WATER-NETWORK-METHOD.md).
`reconstruction/` preserves source pixels, registration controls, editorial
decisions and the generated QA report for the September 2026 water/urban audit.
The reconstruction script emits reviewable patches rather than overwriting data.

## Validation

The validator checks the Zod schema, file/geometry agreement, coordinate ranges,
closed polygon rings, permanent and unique IDs, source resolution, required
public text, confidence values, evidence types, geometry provenance, and the
citation requirement for publishable entities. Validation runs locally, during
the production build, and in both GitHub Actions workflows.
It also validates the period registry and the non-public c. 1550 research
inventory, including source resolution and coverage of every existing public
feature. M10.1 validation additionally requires 70 stable entities, exact
parity for all 58 c. 1492 features, and unique geometry-audit identity by
`(period_id, feature_id)`.
M10.2 validation additionally requires manifest/layer parity, research-only
publication status, separate spatial confidence, complete source resolution,
one non-verified audit per geometry, and the mandatory deferral categories.
M10.3 validation additionally requires exactly eight slice records, complete
Spanish and English content, citations for every claim, resolvable
relationships, inventory/readiness parity, and matching GeoJSON and audit
states. It rejects `reviewed` until all four named specialist approvals exist.
M10.5 validation requires the exact 39-feature set, unique cited claims,
resolvable relationships, complete theme and priority-inventory coverage,
geometry/audit parity, and all six approvals before `release_candidate`.
It also requires each deferred analytical layer to resolve to exactly one
non-ready evidence workstream, validates every evidence source and target
entity, and rejects spatial payload in the evidence-preparation test suite.
Spatial regression checks additionally cover mosque supply, canal crossings and
branches, bridges on the Darro, wall/gate alignment and shared quarter edges.
They enforce documented reconstruction assumptions, not historical certainty.
