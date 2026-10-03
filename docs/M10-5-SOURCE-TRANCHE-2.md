# M10.5 — Source-review tranche 2: inherited systems

Status: **implemented to the content-review boundary on 2026-10-02**.
This tranche is private research material. It adds no geometry and is not
imported by the public application.

## Scope and outcome

The tranche develops the ten agreed inherited systems:

| Feature | c. 1550 assessment | Change from 1492 | Geometry decision |
| --- | --- | --- | --- |
| Puerta de Elvira | present; secure | altered | Retain only after a component-level audit. |
| Puerta de Fajalauza | present; probable | retained | Retain only after an alignment and phase audit. |
| Puerta Monaita | present; secure | retained | Retain only after an alignment and phase audit. |
| Puerta del Mauror | presence unknown; probable chronology | unknown | Create nothing until its c. 1550 chronology is resolved. |
| Albaicín northern wall | present; secure; partly in use | altered | Audit the wall segment by segment. |
| Lower-medina wall | present; secure; partly in use | altered | Audit the wall segment by segment. |
| Acequia de Aynadamar | present; secure | retained | Audit the main channel and branches separately. |
| Acequia Gorda | present; secure | retained | Separate the main channel from documented branches. |
| Río Darro | present; secure | retained | Separate the river, covered reaches, and later vaulting. |
| Elvira street axis | present; secure | retained | Test historical alignments before reusing the current line. |

Each record contains Spanish and English names, functions, summaries, evidence
notes and change notes; at least two claim-level citations; explicit
relationships; a period assessment; and a deferred geometry decision with a
release condition.

The machine-readable dossier is
`data/research/c1550/m10.5-source-review-2.json`. Its deterministic assembler is
`scripts/assemble-m10-5-source-tranche-2.ts`, and its exact ten-feature contract
is part of `src/data/temporalSchema.ts`.

## Evidence decisions

The 1538 water ordinances, known through their 1552 publication and analysed by
Daniel Jesús Quesada Morales, are the main synchronically useful source for the
sixteenth-century water network. They support operational continuity for
Aynadamar, the Genil/Acequia Gorda system, Darro-derived channels, distribution,
maintenance, users, and drainage. They do not by themselves establish a
survey-grade centreline for every branch.

The surviving gates and walls use municipal or archaeological records together
with the early-seventeenth-century Vico image as retrospective control. The
latter is close enough to test continuity but is not treated as a direct 1550
survey. Puerta de Fajalauza therefore remains `probable`, while the lost Puerta
del Mauror remains `unknown` and receives the strictest no-geometry decision.

Puerta de Elvira is assessed as altered because its documented earlier complex
was larger than the surviving arch and its barbicans were not removed until
1612. Monaita is securely present, but neither record licenses a precise 1550
footprint without a component-level architectural audit.

For the walls, `altered` and `partially_in_use` express a system whose segments
had unequal condition and function. They must not be rendered as an intact,
uniform enclosure. For the Darro and Calle Elvira, later coverings,
regularisation, and modern alignments must be isolated from the c. 1550 claim.

## Data and application boundary

- All ten inventory records now have `research_status: ready_for_review`.
- At the source-review boundary all ten candidate decisions were
  `content_ready_geometry_deferred`.
- The two source tranches together contain 20 content-ready records.
- Geometry wave 1 later promotes Elvira, Monaita, the Darro, and the Elvira
  street axis; the other six remain geometry-deferred.
- `public_application_import` is `false`; the public c. 1492 dataset is unchanged.

This tranche prepares historical content and a geometry brief. It does not
authorize copying present-day lines or drawing plausible missing structures.

## Regeneration and validation

```sh
npm run m10:5:sources:2
npm run m10:5:assemble
npm run validate:data
npm test
npm run build
npm run build:internal
```

Validation requires the exact feature set, unique claims, resolvable sources
and relationships, inventory/period consistency, and the exact promoted/deferred
split recorded by [geometry wave 1](M10-5-GEOMETRY-WAVE-1.md).
