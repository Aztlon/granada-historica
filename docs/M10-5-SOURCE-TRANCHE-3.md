# M10.5 — Source-review tranche 3: Generalife, Alhambra access, and water

Status: **implemented to the owner-led historical-review boundary on
2026-10-02**. The tranche is private research material, creates no c. 1550
geometry, and is not imported by the public application.

## Scope and result

| Feature | c. 1550 assessment | Change from 1492 | Geometry decision |
| --- | --- | --- | --- |
| Generalife | present; secure; complete | altered | Audit palace, orchards, water and Christian works by phase. |
| Baño del Nogal / Bañuelo | present; probable; complete | retained | Separate historic fabric from later loss and restoration. |
| Puerta de las Armas | present; secure; complete | altered | Retain the point only after route and component audit. |
| Puerta del Arrabal | present; secure; partly in use | altered | Separate Bāb al-Faraŷ, bastion, stables and Iron Gate. |
| Puerta de los Siete Suelos | present; secure; complete | altered | Separate the Nasrid gate from its Christian artillery bastion. |
| Puerta de los Tableros / “Puente del Cadí” | presence unknown around 1550 | unknown | No geometry until identity and survival are resolved. |
| Puente del Carbón | present; secure; complete | retained | Tie a proposed crossing to excavated and documentary controls. |
| Río Genil | present; secure; complete | retained | Audit channel changes segment by segment. |
| Acequia del Cadí | present; secure; complete | retained | Georeference the 1531–1533 evidence before line reuse. |
| Acequia de Romayla | present; secure; complete | retained | Separate the main channel from documented urban branches. |

Every record contains bilingual content, at least two claim-level citations,
relationships, a temporal assessment, and a deferred geometry decision with a
release condition. The machine-readable dossier is
`data/research/c1550/m10.5-source-review-3.json`; its deterministic assembler is
`scripts/assemble-m10-5-source-tranche-3.ts`.

## Historical findings and corrections

The Generalife did not simply preserve an unchanged Nasrid landscape. The
early Christian alcaidía, royal works, Granada Venegas tenure, and repair
obligation support secure continuity with altered administration and fabric.
The current site envelope cannot serve as a 1550 phase plan.

The Baño del Nogal is named in 1494 and was repaired in 1509. Scholarship
considers continued bath use until the 1567 prohibition probable, so the record
now treats activity around 1550 as probable rather than unknown or certain.

All three Alhambra gates were present, but `retained` alone would conceal
important change. The Gate of Arms lost its former access primacy; the Gate of
the Arrabal was reorganised by a bastion, stables and the Iron Gate; and the
Gate of the Seven Floors received a Christian artillery bastion.

The Cadí bridge record preserves a critical identification warning. The
surviving structure traditionally called Puente del Cadí is Bab al-Difaf or the
Puerta de los Tableros. It must not be rendered as a complete bridge in 1550
until the identity, loss chronology and material extent are resolved.

The Puente del Carbón is more secure: sixteenth-century habices evidence names
a tannery below it, and excavation identified an abutment and early Christian
occupation. That evidence establishes presence, not the exact deck or span.

The hydraulic records use evidence close to the represented period. The 1538
water ordinances document the Genil system and Romayla network; the specific
1531 Cadí ordinances and a 1533 lease establish that canal’s operation and
administration. None of those texts is treated as survey geometry.

## Data boundary

- All ten inventory records now have `research_status: ready_for_review`.
- At the source-review boundary all ten candidate decisions were
  `content_ready_geometry_deferred`.
- The three source tranches now contain 30 content-ready records.
- `research_not_started` has fallen from 20 to 10 records.
- Geometry wave 1 later promotes Bañuelo, the Arms and Seven Floors gates,
  Puente del Carbón, and the Genil. Geometry wave 2 later promotes the Cadí and
  Romayla main axes; Generalife, the Arrabal gate complex, and Puente del Cadí
  remain geometry-deferred.
- The public c. 1492 dataset and application remain unchanged.

Historical review is owner-led under
[C1550-REVIEW-GOVERNANCE.md](C1550-REVIEW-GOVERNANCE.md). No institutional
partner is required. No approval is inferred merely because the dossier has
been assembled.

## Regeneration and validation

```sh
npm run m10:5:sources:3
npm run m10:5:assemble
npm run validate:data
npm test
npm run build
npm run build:internal
```

Validation requires the exact feature set, unique claims, resolvable sources
and relationships, inventory and candidate parity, and the exact
promoted/deferred split recorded by
[geometry wave 1](M10-5-GEOMETRY-WAVE-1.md).
