# Granada c. 1550 research inventory

Status: active research, not public map data
Started: 2026-10-01
Target state: **Granada, c. 1550 — La ciudad morisca y renacentista**

## Purpose and boundary

This work inventories the changes needed to compare the published c. 1492 city
with a defensible c. 1550 state. The representative date uses the 1540–1560
evidence window adopted in [ADR 0002](decisions/0002-second-period-c1550.md).
That window helps research, but never overrides a feature's own chronology.

The structured working inventory is
[`data/research/c1550-inventory.json`](../data/research/c1550-inventory.json).
It is validated in CI but is deliberately excluded from the application. An
entry in that file is a research lead, not permission to publish a marker,
geometry, reconstruction, or historical claim.

## Baseline inventory

The first pass contains:

- 58 triage records, one for every public c. 1492 feature;
- 23 proposed new c. 1550 entities;
- 6 cross-cutting change themes;
- 100 registered sources in total, including the two institutional records
  added by source-review tranche 4;
- 3 transformations already sufficiently bounded for focused historical
  review, but none yet approved for the public map.

M10.2 converted the safest subset into a private GIS review package. M10.3 has
expanded it to 14 points, one line, two areas, and 17 matching `in_review`
audit records by adding the converted Great Mosque and the first University
building. See [C1550-GIS.md](C1550-GIS.md) and
[M10-3-REVIEW.md](M10-3-REVIEW.md). This does not change the boundary above:
the package is research data, not a public period layer.

M10.5 now turns the complete anchor/high/medium inventory into a 78-record
decision matrix and combines 39 mapped records as an internal candidate.
Unmapped records remain visibly assigned to source work or reproducible
geometry deferrals; none is treated as absent. See
[M10-5-CANDIDATE.md](M10-5-CANDIDATE.md).

Source-review tranche 1 subsequently advances ten of the former
`source_review_needed` records to `ready_for_review`, with bilingual cited
content but no new geometry. See
[M10-5-SOURCE-TRANCHE-1.md](M10-5-SOURCE-TRANCHE-1.md).

Source-review tranche 2 does the same for ten inherited gates, wall systems,
water features, and the Elvira street axis. It keeps the lost Puerta del Mauror
unresolved and defers every geometry until the relevant chronology, phase, or
alignment audit is complete. See
[M10-5-SOURCE-TRANCHE-2.md](M10-5-SOURCE-TRANCHE-2.md).

Source-review tranche 3 advances ten connected Alhambra, Generalife, bridge,
river, bath, and canal records. It corrects three gate change assessments,
establishes probable continued Bañuelo use, and keeps the ambiguous Puente del
Cadí/Puerta de los Tableros geometry unresolved. See
[M10-5-SOURCE-TRANCHE-3.md](M10-5-SOURCE-TRANCHE-3.md).

Source-review tranche 4 advances the final ten untouched priority records:
four gates, three inner walls, two acequias, and the Molinos–Sierra route. It
uses explicit probable states for indirect evidence and leaves all ten
geometry-free. See
[M10-5-SOURCE-TRANCHE-4.md](M10-5-SOURCE-TRANCHE-4.md).

The first low-risk geometry wave promoted 16 of the first 30 source-reviewed records:
six church or convent site points, four surviving-gate points, the Corral del
Carbón and Bañuelo envelopes, and four inherited line axes. Every result remains
private and `in_review`. A second controlled wave then promoted Fajalauza and
five principal canal axes, each with multiple controls and explicit exclusions.
The package now contains 39 private geometries; 18 content-ready records remain
geometry-free.
See [M10-5-GEOMETRY-WAVE-1.md](M10-5-GEOMETRY-WAVE-1.md).
See [M10-5-GEOMETRY-WAVE-2.md](M10-5-GEOMETRY-WAVE-2.md).

Every existing feature is assigned a research priority, a provisional change
relationship, a geometry action, and a research status. `unknown` and
`not_started` are intentional results: they prevent a plausible story from
being mistaken for evidence.

## Interpretive themes

### 1. Religious conversion and the parish city

The change is not adequately represented by renaming mosques as churches.
Research must distinguish:

- an institution founded on paper;
- Christian worship inside a reused mosque;
- demolition of the mosque;
- construction and partial use of a new church;
- retained fabric such as a courtyard, alminar, or aljibe;
- later additions that did not yet exist in 1550.

San Miguel Bajo is an especially useful test case: one phase dates to
1528–1539 and the next to 1551–1556. A 1550 reconstruction should therefore
show a partial church, not the completed later building. San Cristóbal was also
being enlarged across the target date, between 1540 and 1559.

The Colegiata del Salvador requires particular caution. Its institutional
foundation in 1527 does not by itself date every part of the surviving church.
The reused Mezquita Mayor, the collegiate institution, and later church fabric
must remain distinct claims.

### 2. Christian civic and religious centre

The Cathedral, Royal Chapel, Lonja, Cabildo in the former Madraza, University,
and Real Chancillería form the strongest multi-feature comparison with 1492.
The group also exposes the need for construction phases:

- the Royal Chapel was complete by 1521;
- the Cathedral was an active building site, not the present finished church;
- the Chancillería had a c. 1540 patio, but its current 1587 façade is too late;
- the University had occupied the Curia eclesiástica since 1538;
- the former Madraza served the municipal Cabildo from 1500.

The first geometry study should reconstruct the whole precinct rather than
placing independent modern-centroid points on overlapping buildings.

### 3. Imperial Alhambra

The Alhambra combines continuity and intervention. The Nasrid palaces remained
part of the royal complex while new imperial works changed its fabric and
approach:

- work on the Palace of Charles V began in 1533;
- the patio was founded in 1540 and the chapel crypt closed in 1542;
- the second storey had been raised by 1550;
- the Puerta de las Granadas was traced and founded in 1545–1548, but was not
  completed until the 1590s;
- its imperial shield dates to 1552, just after the representative date.

Both buildings are therefore high-value demonstrations of why Granada
Histórica must display incomplete architecture honestly.

### 4. Public space and urban hierarchy

Bib-Rambla and Campo del Príncipe were recast as settings for commerce,
festivity, justice, and Christian ceremony. Plaza Nueva and the Chancillería
created a new institutional front along the Darro and helped redirect the
approach to the Alhambra. These areas require period-specific polygons and
routes; current plaza outlines are not historical evidence.

### 5. Population geography

The intended comparison is not a binary Muslim/Christian replacement map.
Around 1550 the lower city had become the primary Christian, administrative,
and monumental centre while the Albaicín retained an essential Morisco
population and inherited urban fabric. The expulsion and depopulation following
1568–1571 belong to a later state and must not be projected backwards.

Population claims will need parish, fiscal, household, habices, and property
evidence. The provenance fields, inference limits, aggregation guardrails, and
source targets are now specified in
[M10-5-EVIDENCE-PREPARATION.md](M10-5-EVIDENCE-PREPARATION.md); no social area
is derivable yet. Broad interpretive areas may be publishable before
parcel-level social mapping, but only after the same evidence gate and with
correspondingly broad geometry and confidence.

### 6. Reused infrastructure and buildings

Continuity cannot be assumed merely because something survives today. The
research pass must verify sixteenth-century use of each acequia, gate, bridge,
bath, wall, and route. The clearest reuse found so far is the Maristán: from
1497 it housed the Real Casa de la Moneda, with archaeologically documented
industrial adaptation of the Nasrid hospital.

## New-entity shortlist

| Priority | Candidate | Working state around 1550 | Main unresolved question |
| --- | --- | --- | --- |
| Anchor | Cathedral | Under construction | Exact built footprint and usable spaces |
| Anchor | Royal Chapel | Complete | Historical footprint versus later attachments |
| Anchor | Lonja de Mercaderes | Complete | Minor phases and shared upper-floor use |
| Anchor | Real Chancillería | Partly built/in use | Which crujías existed; exclude 1587 façade |
| High | Hospital Real | Under construction | Built and occupied parts in 1550 |
| Anchor | Palace of Charles V | Under construction | Phase-specific footprint and height |
| Anchor | Puerta de las Granadas | Under construction | Appearance before the 1552 shield and 1590s finish |
| High | Pilar de Carlos V | Unresolved | Exact completion state at the representative date |
| High | San Jerónimo | Present | Precise 1550 construction phase |
| High | Santa Cruz la Real | Present | Precise 1550 construction phase and enclosure |
| High | San Juan de los Reyes | Present | Separate early church from later repairs |
| High | San José | Present | Retained mosque fabric and later additions |
| High | San Cristóbal | Being enlarged | Extent reached within the 1540–1559 campaign |
| High | San Miguel Bajo | Partly built/in use | Use and footprint between its two campaigns |
| High | San Matías | Present | Exclude post-1541 alterations |
| Medium | San Luis | Present | Reconstruct the 1526 church before later chapels |
| Anchor | Colegiata del Salvador | Institution present | Mosque reuse versus later church construction |
| Anchor | Plaza Bib-Rambla | Altered civic square | Period outline and surrounding fronts |
| High | Campo del Príncipe | Altered civic square | Period outline and land-use edges |
| Anchor | Plaza Nueva | New civic square | Sequence of platforms and Darro crossings |
| High | University/Curia | Present from 1538 | One entity or two related institutions/buildings |
| Medium | Casa de Castril | Probable | Secure construction date and phases |
| Medium | Casa de los Tiros | Probable | Secure construction date and phases |

## First review package

The safest first vertical slice is an eight-entity comparison in two clusters:

1. **Cathedral precinct:** former Mezquita Mayor, Cathedral, Royal Chapel,
   Lonja, former Madraza/Cabildo, and University/Curia.
2. **Imperial access:** Palace of Charles V and Puerta de las Granadas, related
   to the retained Puerta de la Justicia and altered access routes.

This package tests every difficult capability without attempting a whole-city
release: retained entities, conversion, replacement, new construction,
unfinished architecture, overlapping footprints, new and altered geometry,
and multi-feature narrative.

## Research work still required

1. Obtain phase plans or defensible plan descriptions for the Cathedral,
   Chancillería, Hospital Real, Palace of Charles V, and major churches.
2. Locate and transcribe the parish, habices, household, fiscal, and property
   series specified by the M10.5 evidence register before drawing
   social-geography polygons.
3. Resolve the remaining probable gate and wall chronologies and convert the
   documented acequia itineraries into sourced segment controls rather than
   inheriting c. 1492 geometry.
4. Complete the documented alignment, archaeology, cartographic-regression,
   and parcel controls specified for Bib-Rambla, Plaza Nueva, and Campo del
   Príncipe before reconstructing their historical extents.
5. Identify which existing entity IDs represent the same material object across
   time and which transformations require related but distinct entities.
6. Obtain historical and architectural review before promoting any inventory
   item from research data to a period layer.

## Source policy

The first pass prioritises the University of Granada, the Patronato de la
Alhambra y Generalife, the Ayuntamiento de Granada, the Junta de Andalucía,
peer-reviewed scholarship, and archaeological reports. Municipal tourism pages
are suitable for initial chronology and identification, not sufficient by
themselves for exact phase geometry. Every geometry will require a source that
actually supports its footprint or reconstruction method.
