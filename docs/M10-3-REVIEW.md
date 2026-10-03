# M10.3 — Eight-entity vertical slice review

Status: **ready for specialist review** on 2026-10-01
Publication state: private research; not imported by the application
Machine-readable dossier: `data/research/c1550/m10.3-review.json`

## Delivered scope

The slice contains exactly eight entities in two clusters:

1. Cathedral precinct: the converted former Great Mosque, Cathedral, Royal
   Chapel, Merchants' Exchange, former Madrasa/Council House, and the
   University/Royal College building now used as the ecclesiastical Curia.
2. Imperial access: the Palace of Charles V and the Gate of the Pomegranates,
   related respectively to the retained Alhambra enclosure and Gate of Justice.

Every record has complete Spanish and English names, functions, summaries,
evidence notes, and change notes. Historical assertions are separated into
claim-level records with resolvable citations. Relationships and overlap
decisions are explicit rather than left for a future interface to infer.

## Historical correction

M10.3 rejects the provisional idea that the Great Mosque was simply demolished
and replaced by the Renaissance Cathedral before 1550. The City Council records
the converted mosque as housing the Cathedral in 1526. Antonio Fernández
Puertas' study follows the building and its plan through the evidence used for
the 1705 drawing, when demolition for the Baroque Sagrario began.

The c. 1550 state therefore records the material building as present,
`converted`, and used as the old Sagrario/cathedral space. The new Cathedral is
a separate, simultaneously present construction site that gradually replaced
its cathedral function. A relationship expresses that succession without
claiming an instantaneous physical replacement.

## Geometry decisions

| Entity | c. 1550 state | Representation | Overlap decision |
| --- | --- | --- | --- |
| Former Great Mosque / old Sagrario | converted and in use | retained site point | coexistence with the new Cathedral is explicit |
| Cathedral | under construction | reference point | completed modern footprint remains deferred |
| Royal Chapel | complete | reference point | distinct from attached Cathedral, Sagrario, and Lonja |
| Merchants' Exchange | complete | probable reference point | upper-floor Chapel use is a relationship, not a merged entity |
| Former Madrasa / Council House | converted | retained site point | one material entity with changed function |
| University and Royal College | complete | reference point | later Curia use and building unions are excluded |
| Palace of Charles V | under construction | reference point | contained by, but distinct from, the Alhambra complex |
| Gate of the Pomegranates | under construction | reference point | its route leads toward the retained Gate of Justice |

The private package now has 14 points, one line, two areas, and 17 matching
period-specific audits. The two new points are the converted Great Mosque and
the University/Royal College. All slice audits remain `in_review`; the project
does not turn modern building footprints into unsupported 1550 phase plans.

## Review gate

The technical and editorial package is complete, but the milestone exit gate
is not yet satisfied. The dossier requires four accountable approvals:

- historical claims and treatment of conversion and coercion;
- architectural phases and contacts between buildings;
- geometry decisions and any georeferenced phase plans;
- bilingual editorial content.

Each approval must identify the reviewer, role, date, and decision. The schema
will reject an overall `reviewed` status until all four are approved, all eight
records are marked `reviewed`, and their geometry audits are `verified`.

These are review functions, not requirements for external or institutional
partners. Historical review is owner-led by the project historian. The same
person may hold more than one function when competent, but each decision must
still be recorded separately. See
[C1550-REVIEW-GOVERNANCE.md](C1550-REVIEW-GOVERNANCE.md).

After real approvals are recorded, the same transition must update:

1. each slice record's `readiness`;
2. the four sign-off records and overall dossier status;
3. the eight inventory research statuses;
4. the eight GeoJSON `publication_status` values to `reviewed`—never
   `publishable` at this stage;
5. the eight geometry audit statuses and review dates.

Run `npm run validate:data` after the transition. The validator cross-checks
all five surfaces and blocks partial or anonymous promotion.

## Reproducibility and isolation

`npm run m10:3:assemble` assembled the initial dossier and refuses to overwrite
it without `--force`. The M10.2 QGIS round trip automatically includes the two
new points, but continues to write only under `data/research/c1550/`.

The frontend imports none of the review dossier, research layers, or audit
records. M10.4 may consume the data only through a feature-flagged internal
comparison; public navigation remains limited to c. 1492.
