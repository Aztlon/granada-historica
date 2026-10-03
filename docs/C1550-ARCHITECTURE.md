# Multi-period architecture for c. 1550

Status: M10.5 internal comparison and hybrid information-sheet presentation implemented
Public period availability: unchanged; c. 1492 remains the only public application layer

## Current constraint

The v0.1 model is intentionally specific to one date. Each public GeoJSON
feature combines a stable historical ID, one geometry, and c. 1492-specific
fields including:

- `present_c1492`;
- `context_1492`;
- `after_1492`;
- one global `confidence.time` value;
- one global geometry and geometry audit;
- `in_use_c1492` inside defensive gazetteer metadata.

Adding parallel fields such as `present_c1550` and `context_1550` would work for
one release but would make every subsequent period a schema migration. It also
would not solve period-specific geometry, names, functions, construction
phases, or citations.

## Architecture decision

Separate the stable historical entity from its state in a represented period.
The same entity ID links states across time, but each period feature owns its
date-specific geometry and claims.

The intended canonical layout after migration is conceptually:

```text
data/
  periods.json
  entities.json
  entity-presentations.json
  periods/
    c1492/
      points.geojson
      lines.geojson
      areas.geojson
    c1550/
      points.geojson
      lines.geojson
      areas.geojson
  geometry-audit-periods.json
  sources.json
  research/
    c1550-inventory.json
    c1550/
      entity-presentations.json
      period-title-decisions.json
```

`entities.json` now evolves from the stable, non-geometric responsibilities of
the present gazetteer: canonical identity, relationships, name attestations,
and broad survival history. A period GeoJSON feature carries the state and
geometry for exactly one period. During M10.1 all three compatibility products
remain generated derivatives, so the migration is reversible.

Mapped entities retain their current feature IDs. Unmapped gazetteer entries
reserve the same ID without the `gaz.` namespace (for example,
`gaz.gate.pesas` reserves `gate.pesas`), so acquiring a reviewed geometry does
not force an identity change later.

This layout is preferred to an array of states inside one GeoJSON feature. A
GeoJSON feature has only one geometry; nesting several historical geometries in
properties would break normal GIS editing and make QGIS round trips fragile.

## Contracts and M10.1 compatibility products

The migration scaffolding is implemented without changing public data:

- [`data/periods.json`](../data/periods.json) registers `c1492` as published and
  `c1550` as research;
- [`src/data/temporalSchema.ts`](../src/data/temporalSchema.ts) defines period,
  period-state, period GeoJSON feature, construction, change, research, and
  inventory schemas;
- [`data/entities.json`](../data/entities.json) contains 70 stable identities
  derived from the current gazetteer;
- [`data/periods/c1492/`](../data/periods/c1492/) contains parallel point, line,
  and area collections for all 58 current features;
- [`data/geometry-audit-periods.json`](../data/geometry-audit-periods.json)
  reproduces all 58 audit records with composite period identity;
- [`data/research/c1550-inventory.json`](../data/research/c1550-inventory.json)
  provides a non-public working inventory;
- `npm run validate:data` validates period uniqueness, source references,
  complete c. 1550 triage coverage, candidate uniqueness, c. 1492 parity, and
  the rule that `c1550` remains a research period;
- `npm run periods:generate` reproducibly rebuilds all compatibility products,
  while `npm run periods:check` proves that committed derivatives are current.

The c. 1492 bridge deliberately retains every legacy property and adds
`period_id` plus a nested `period_state`. This allows current consumers to read
the same labels, search terms, citations, publication status, and geometry
while new code exercises the generic temporal contract. M10.6—not M10.1—will
remove year-named legacy fields after every consumer has migrated.

The generic period-state contract contains:

```text
period_id
presence
temporal_confidence
spatial_confidence
change_from_previous
physical_state
name
function
summary
evidence_note
geometry_variant_id
citations
```

`physical_state` and `change_from_previous` are separate. For example, the
Palace of Charles V is `newly_built` relative to 1492 and
`under_construction` in 1550. The former Maristán is `converted` while its
adapted mint fabric may be `complete` or `partially_in_use` depending on the
evidence.

## Proposed period feature

The target shape should remain ordinary GeoJSON:

```json
{
  "type": "Feature",
  "id": "royal.palace-charles-v",
  "properties": {
    "id": "royal.palace-charles-v",
    "period_id": "c1550",
    "presence": "present",
    "temporal_confidence": "secure",
    "spatial_confidence": "approximate",
    "change_from_previous": "newly_built",
    "physical_state": "under_construction",
    "name": "Palacio de Carlos V",
    "function": "Palacio imperial en construcción",
    "summary": "…",
    "evidence_note": "…",
    "citations": []
  },
  "geometry": {}
}
```

The illustrative empty fields above are not valid publishable data. Actual
period features must include sufficient content, citations, geometry
provenance, publication status, and audit state.

## Identity and transformation rules

Use the same ID when the project is describing the same material or spatial
entity in a later state. Create a related new ID when a genuinely new entity
occupies or overlaps the earlier site.

Examples:

- `civic.maristan` remains the material building entity, with a c. 1550 state
  describing its conversion into the mint;
- `religious.medina-great-mosque` can be absent or replaced in c. 1550, while
  `religious.cathedral-granada` is a distinct newly built entity;
- `religious.albaicin-great-mosque` and
  `religious.salvador-collegiate` must remain related but distinct until
  research resolves mosque reuse and later church fabric;
- `urban.late-nasrid-extent` is a period-specific analytical entity and should
  not be renamed into a c. 1550 urban extent.

Entity relationships will need explicit vocabulary during the migration:
`occupies_site_of`, `reuses_fabric_of`, `replaces`, `contained_by`,
`successor_function_of`, and `related_to` are initial candidates. These should
not be added to production before testing them against the first review package.

## Geometry and audit changes

Geometry identity must become the pair `(period_id, feature_id)`, not only the
feature ID. The geometry audit should consequently gain `period_id` and allow
one audited geometry per entity per represented state.

Rules:

1. Reusing coordinates requires a new period audit; persistence is a historical
   claim, not a technical shortcut.
2. A construction phase may need a smaller or different footprint from the
   present building.
3. Overlapping predecessor and successor entities are valid when they explain
   conversion or construction, but the UI must avoid implying simultaneous
   complete use.
4. Period-wide analytical polygons must be derived reproducibly from reviewed
   components where possible.
5. QGIS projects and exports must select one period explicitly and preserve
   `period_id` in every layer.

## Content and translation changes

Information sheets now use a hybrid presentation contract. Stable identity and
period state are deliberately different layers:

- `data/entity-presentations.json` contains the 58 public canonical names and
  concise Spanish general descriptions;
- `data/research/c1550/entity-presentations.json` adds the 17 entities that
  exist only in the private M10.5 candidate and is imported only by the
  internal comparison chunk;
- `data/research/c1550/period-title-decisions.json` records whether each of the
  39 c. 1550 titles is canonical or a sourced historical variant;
- the general description is a single period-agnostic sentence of at most 220
  characters and supplies the lede in every represented period;
- `summary` remains period-owned and is presented under “¿Qué había aquí hacia
  …?”, followed by function, change, cartographic decision, relationships,
  evidence, and sources;
- review status, approval counts, confidence, construction state, and the
  documentary window never belong in the general description.

A period-title difference must identify a historically meaningful institution
or name. Incidental phrases such as “en construcción”, “retenida” or “en
ampliación” belong in the state badges and narrative. Historical variants must
carry a rationale and at least one registered source. The primary heading is
still period-owned; the stable canonical name governs validation and fallback.

Spanish general descriptions are mandatory. English is optional during this
course correction; when it is missing the interface shows the existing
language-fallback notice and displays Spanish instead of substituting a
period-specific English summary.

Translations for period narratives remain keyed by entity and period, not by
field names that contain a year. Pilot-route copy can remain on the legacy
model until routes support period selection.

## UI and URL behaviour

The first multi-period control should be a discrete selector with two choices:
1492 and c. 1550. It must not be a continuous slider.

Recommended URL form:

```text
/?period=c1550&feature=royal.palace-charles-v
```

Entity links remain durable because IDs do not include a date. If a requested
entity is absent from the selected period, the UI should say so and offer the
nearest represented state instead of silently switching dates.

The selector must remain hidden while `c1550` has `status: research`.

## Migration sequence

M10 is divided into seven gated phases in
[the implementation roadmap](ROADMAP.md):

1. **M10.0 — Scope, sources, and non-public scaffolding:** completed period
   registry, inventory, sources, schemas, and validation.
2. **M10.1 — c. 1492 compatibility foundation:** parallel period data, parity
   tests, period-aware audits, and QGIS/export support.
3. **M10.2 — c. 1550 research GIS and geometry package:** completed non-public
   layers, subsequently expanded by M10.3 to 17 sourced and audited points,
   lines, and polygons; see
   [C1550-GIS.md](C1550-GIS.md).
4. **M10.3 — Reviewed eight-entity vertical slice:** the Cathedral precinct and
   imperial-access content, relationships, and approval machinery are complete;
   accountable role decisions are still pending. These roles may be fulfilled
   internally and do not require institutional partners. See
   [M10-3-REVIEW.md](M10-3-REVIEW.md).
5. **M10.4 — Internal comparison experience:** feature-flagged two-state UI,
   durable URLs, accessibility, and regression testing.
6. **M10.5 — Defensible c. 1550 city state:** thematic expansion now combines
   39 private `in_review` geometries, including a 16-entity low-risk wave and
   a six-entity controlled second wave. It
   remains a coherent internal candidate rather than a reviewed release
   candidate; see [M10-5-GEOMETRY-WAVE-1.md](M10-5-GEOMETRY-WAVE-1.md) and
   [M10-5-GEOMETRY-WAVE-2.md](M10-5-GEOMETRY-WAVE-2.md).
7. **M10.6 — Canonical migration, publication, and stewardship:** production
   migration, removal of legacy fields, governance, and long-term maintenance.

Each phase has its own exit gate in the roadmap. In particular, research
geometry begins in M10.2, the comparison UI remains private through M10.4, and
no c. 1550 state becomes public before M10.6.

Review ownership is defined in
[C1550-REVIEW-GOVERNANCE.md](C1550-REVIEW-GOVERNANCE.md). The historical role is
owner-led; `specialist` denotes competence and accountability rather than an
external organisation.

## Release gate

c. 1550 may become `published` only when:

- every visible feature has reviewed historical claims and resolvable citations;
- every visible geometry has a period-specific audit;
- incomplete buildings are represented in their supported phase;
- Spanish and English content are complete;
- 1492 regression and accessibility tests pass unchanged;
- the selector never implies continuous year-by-year knowledge;
- an editorial reviewer approves the population-geography language and the
  treatment of Morisco coercion, conversion, and displacement.
