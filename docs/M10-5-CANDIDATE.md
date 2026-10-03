# M10.5 — Defensible c. 1550 candidate

Status: **implemented to the safe internal-review boundary on 2026-10-02**.
This is not yet a public release candidate. The machine-readable status is
`ready_for_specialist_review`, all six sign-offs are pending, and all 39
geometries remain `in_review`.

## Deliverables

- `data/research/c1550/m10.5-supplement.json` contains the nine bilingual
  records added after the M10.3 vertical slice, the seven thematic clusters,
  and four deferred analytical layers.
- `data/research/c1550/m10.5-candidate.json` combines those records with the
  eight M10.3 records and records the release gate.
- `scripts/assemble-m10-5-candidate.ts` regenerates the candidate
  deterministically from the M10.3 dossier, supplement, and inventory.
- `data/research/c1550/m10.5-source-review.json` develops ten additional
  entities to content-review readiness without creating geometry. See
  [M10-5-SOURCE-TRANCHE-1.md](M10-5-SOURCE-TRANCHE-1.md).
- `data/research/c1550/m10.5-source-review-2.json` develops ten inherited gate,
  wall, water, and route systems to the same boundary. See
  [M10-5-SOURCE-TRANCHE-2.md](M10-5-SOURCE-TRANCHE-2.md).
- `data/research/c1550/m10.5-source-review-3.json` develops the Generalife,
  Bañuelo, three Alhambra gates, two bridges, the Genil, and two acequias. See
  [M10-5-SOURCE-TRANCHE-3.md](M10-5-SOURCE-TRANCHE-3.md).
- `data/research/c1550/m10.5-source-review-4.json` develops the final ten
  untouched gate, inner-wall, acequia, and route records. See
  [M10-5-SOURCE-TRANCHE-4.md](M10-5-SOURCE-TRANCHE-4.md).
- `data/research/c1550/m10.5-evidence-preparation.json` inventories 23 evidence
  inputs, derivation protocols, uncertainty rules, and 12 closed readiness
  criteria for the four deferred analytical layers. See
  [M10-5-EVIDENCE-PREPARATION.md](M10-5-EVIDENCE-PREPARATION.md).
- `data/research/c1550/m10.5-geometry-wave-1.json` records the 16 low-risk
  promotions and the 14 source-reviewed entities that remain geometry-free. See
  [M10-5-GEOMETRY-WAVE-1.md](M10-5-GEOMETRY-WAVE-1.md).
- `data/research/c1550/m10.5-geometry-wave-2.json` records six controlled
  promotions, their spatial controls and exclusions, and eight continuing
  deferrals. See [M10-5-GEOMETRY-WAVE-2.md](M10-5-GEOMETRY-WAVE-2.md).
- The feature-flagged comparison consumes all 39 candidate geometries; search,
  category filters, bilingual names, citations, relationships, and comparison
  copy use the same private dataset.
- The public build remains isolated from the c. 1550 candidate.

Regenerate and check the dossier with:

```sh
npm run m10:5:assemble
npm run validate:data
npm test
npm run build
npm run build:internal
npm run test:e2e:internal
```

## Inventory coverage

Every unique anchor, high, or medium record in the research inventory has one
decision. The current matrix covers 78 records:

| Decision | Count | Meaning |
| --- | ---: | --- |
| `internal_candidate` | 39 | Bilingual, cited record plus audited research geometry; still unapproved. |
| `content_ready_geometry_deferred` | 18 | Bilingual cited content is ready for review; geometry remains deliberately absent. |
| `research_not_started` | 0 | The active anchor/high/medium decision matrix has no untouched source records left. |
| `deferred_analytical_geometry` | 18 | A reproducible spatial derivation is required. |
| `deferred_sensitive_spatial_claim` | 3 | Population/social mapping needs an appropriate corpus and specialist method. |

The same records are classified across all required themes: parish city,
civic centre, imperial Alhambra, public spaces, inherited systems, quarters,
and population geography. Classification is triage, not proof that an entity
was absent from another theme.

## Mapped candidate

The 39 internal geometries comprise 25 points, ten lines, and four areas. The
nine initial additions to the M10.3 slice are Real Chancillería, Hospital Real, Pilar
de Carlos V, San Miguel Bajo, San Cristóbal, Puerta de la Justicia, the
Alhambra perimeter, the Royal Alhambra site, and the former Maristán operating
as the royal mint.

Geometry wave 1 adds six deliberately non-footprint site points (Santa Cruz la
Real, San Jerónimo, San José, San Juan de los Reyes, San Matías, and San Luis),
four surviving-gate points, the Corral del Carbón and Bañuelo site envelopes,
and the Darro, Genil, Elvira-axis, and Puente del Carbón lines. Inherited
coordinates are not treated as newly proven: every one receives a separate
c. 1550 state, provenance list, caveat, and `in_review` audit.

Geometry wave 2 adds Fajalauza as a surviving-site point and the Real,
Aynadamar, Gorda, Cadí, and Romayla acequias as constrained main-axis
hypotheses. Every promotion has at least two spatial controls and an explicit
list of components that the geometry does not represent. Both wall systems,
Mauror, Generalife, the Arrabal complex, Puente del Cadí, Casa de Castril, and
Casa de los Tiros remain geometry-free.

Points remain points where construction phases or historical footprints are
not adequately resolved. The Alhambra perimeter and site area express retained
systems, not uniform survival or condition. The Maristán area is a site
envelope, not an invented plan of the mint workshops in 1550.

## Analytical geometry deliberately not created

M10.5 does not create polygons merely to fill the map. Four layers remain
explicitly deferred:

1. public-space envelopes for Bib-Rambla, Campo del Príncipe, and Plaza Nueva;
2. parish jurisdictions;
3. Morisco and Christian population geography;
4. a citywide physical, administrative, or social extent.

Each layer records proposed inputs, a reproducible derivation method, its
current blocker, and a release condition. In particular, a church location
does not establish a parish boundary, a present square does not establish its
1550 frontage, and a few monuments cannot support a demographic surface.

The evidence-preparation register expands those placeholders into actionable
source and repository inventories. It records all three public spaces
individually, defines a provenance-first population corpus, and keeps physical,
administrative, and social edges separate. Every associated readiness gate is
still closed, so this additional preparation does not authorize geometry.

## Review and promotion gate

The six entries below are accountable review functions, not six external
people or partner organisations. Historical review is owner-led by the project
historian. Other functions may also be completed internally when the relevant
competence exists, and one person may hold multiple functions with separate
recorded decisions. Institutional affiliation is not required. See
[C1550-REVIEW-GOVERNANCE.md](C1550-REVIEW-GOVERNANCE.md).

Promotion requires all of the following:

- accountable approval for historical, architectural, geometry, translation,
  Morisco-history, and population-geography review;
- every record changed from `ready_for_specialist_review` to `reviewed`;
- every geometry audit changed from `in_review` to `verified`;
- no unresolved release blocker; and
- the candidate status changed to `release_candidate` with
  `promotion_gate.public_ready: true`.

The schema rejects a forged release status if any condition remains pending.
It also rejects duplicate claims, self-relations, incomplete feature sets,
missing thematic coverage, and an incomplete sign-off set.

The Morisco-history review must specifically examine coercion and forced
conversion, how population claims are spatialised, and whether text about the
1568–1571 revolt or later displacement is being projected backward into the
1540–1560 evidence window. Those later events may provide context, but they are
not evidence for a 1550 boundary by themselves.

## Exit assessment

The engineering and source-preparation parts of M10.5 are implemented. The
milestone exit gate is **not passed**: this is a coherent internal candidate,
not an approved public release candidate. Review decisions and the deferred
geometry/evidence work cannot be manufactured in code.
