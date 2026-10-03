# M10.5 — Source-review tranche 4: gates, inner walls, and southern water routes

Status: **implemented to the owner-led historical-review boundary on
2026-10-02**. The tranche is private research material, creates no c. 1550
geometry, and is not imported by the public application.

## Scope and result

| Feature | c. 1550 assessment | Change from 1492 | Geometry decision |
| --- | --- | --- | --- |
| Puerta de los Alfareros | present; probable; partly in use | altered | Resolve sixteenth-century survival before mapping. |
| Puerta de Guadix | present; probable; state unknown | retained | Find period evidence for the threshold before mapping. |
| Puerta de los Molinos | present; secure; complete | retained | Audit the point against pre-demolition evidence. |
| Puerta del Pescado | present; secure; complete | retained | Reconstruct only from pre-demolition and archaeological controls. |
| Alcazaba Qadima inner wall | present; secure; partly in use | altered | Segment surviving, reused, lost, and inferred fabric. |
| Axares inner wall | present; probable; partly in use | altered | Do not close a circuit until segment chronology is resolved. |
| Mauror–Realejo inner wall | present; probable; partly in use | altered | Audit the corridor segment by segment. |
| Acequia de Axares / San Juan | present; secure; complete | retained | Convert the 1538 itinerary into segment controls. |
| Realejo branch | present; secure; complete | altered | Separate channel, distributors, mills, and outlets. |
| Molinos–Sierra route | present; probable; complete | retained | Treat the outer route as interpretative pending property controls. |

Every record contains bilingual period content, two claim-level citations,
relationships, a temporal assessment, and a deferred geometry decision with a
release condition. The machine-readable dossier is
`data/research/c1550/m10.5-source-review-4.json`; its deterministic assembler is
`scripts/assemble-m10-5-source-tranche-4.ts`.

## Historical findings and limits

The southern gates do not all carry the same evidentiary weight. The Molinos
and Pescado gates survived long after 1550, so their presence is secure even
though their precise footprints are not. Alfajjarín and Guadix have secure
urban contexts but lack a sufficiently direct 1540–1560 description of the
individual threshold; they remain probable and geometry-free.

The three inner walls are not represented as intact defensive circuits. The
Alcazaba Qadima dossier uses archaeological evidence for masonry reused in
later buildings. Axares and Mauror–Realejo remain segment problems: the
historic corridor is defensible, but a continuous line would merge surviving,
absorbed, lost, and inferred fabric.

The strongest near-period evidence belongs to the water systems. The 1538
ordinances document the Axares/San Juan and Genil–Acequia Gorda networks, while
the water-route study establishes their broad corridors and destinations.
Neither source is treated as a metric survey. The Molinos–Sierra route is
therefore supported as a functional corridor, not as a road centreline.

Two source records were added to the registry: the Junta de Andalucía report
on the reused Zirid wall at Placeta de las Escuelas, and the Patronato de la
Alhambra account of the Casa de los Girones and its 1554 context near
Bab al-Fajjarin.

## Data boundary

- All ten tranche records now have `research_status: ready_for_review`.
- All ten candidate decisions are `content_ready_geometry_deferred`.
- The four source tranches contain 40 content-ready records.
- Before geometry wave 2, the M10.5 decision matrix had 24 geometry-deferred content records and
  no `research_not_started` records.
- Nine lower-priority or explicitly deferred inventory records remain
  `not_started`; they are outside the active M10.5 decision matrix and are not
  silently promoted by this tranche.
- This source-review tranche created no c. 1550 point, line, or polygon. The
  later controlled second geometry wave promoted six earlier deferrals and
  reduced the geometry-deferred total to 18.
- The public c. 1492 dataset and application remain unchanged.

Historical review is owner-led under
[C1550-REVIEW-GOVERNANCE.md](C1550-REVIEW-GOVERNANCE.md). The dossier records
evidence and uncertainty; it does not infer approval.

## Regeneration and validation

```sh
npm run m10:5:sources:4
npm run m10:5:assemble
npm run validate:data
npm test
npm run build
npm run build:internal
```

Validation requires the exact ten-feature set, unique claim identifiers,
resolvable sources and relationships, inventory/candidate parity, zero new
geometry, and preservation of explicit uncertainty for the five probable
records.
