# M10.5 — Source-review tranche 1

Status: **ready for content review** (2026-10-02). This tranche develops ten
inventory records from initial-source notes into bilingual, claim-level cited
research. It creates no c. 1550 geometry and does not alter the public map.

Machine-readable dossier:
`data/research/c1550/m10.5-source-review.json`.

## Included records

- Corral del Carbón;
- Santa Cruz la Real;
- Acequia Real de la Alhambra;
- San Jerónimo;
- San José;
- San Juan de los Reyes;
- San Matías;
- Casa de Castril;
- Casa de los Tiros; and
- San Luis.

Every record contains Spanish and English period content, at least two cited
claims, a relationship to the wider city model, an explicit temporal
assessment, and a deferred geometry decision with a release condition.

## Evidence-led corrections

The Acequia Real changes from provisional `retained` to `altered`. Its
functional continuity is strong, but research on the Christian period records
regulation and material alteration after 1492. Its c. 1492 line therefore
cannot simply become a c. 1550 line.

San Matías changes from provisional `newly_built` to `replaced`. The
institutional source identifies an earlier mosque on the present site and
dates the side chapels to 1533–1541.

Casa de Castril and Casa de los Tiros remain `presence: unknown`. A general
sixteenth-century date does not prove that either residence existed, or which
parts existed, inside the 1540–1560 evidence window.

## Geometry boundary

The tranche deliberately adds zero features to the private c. 1550 GeoJSON:

- Corral del Carbón and the Acequia Real require audits of inherited geometry;
- the six religious complexes may receive reference points only after their
  sites and phases are checked; and
- Casa de Castril and Casa de los Tiros receive no geometry until their
  chronology around 1550 is resolved.

At the source-review boundary, all ten were recorded as
`content_ready_geometry_deferred`. Geometry wave 1 later promotes Corral del
Carbón and the six religious sites to `internal_candidate`; Acequia Real, Casa
de Castril, and Casa de los Tiros remain geometry-deferred. See
[M10-5-GEOMETRY-WAVE-1.md](M10-5-GEOMETRY-WAVE-1.md).

## Regeneration and checks

```sh
npm run m10:5:sources
npm run m10:5:assemble
npm run validate:data
npm test
```

Validation requires exact membership, resolved sources and relationships,
inventory parity, and exact agreement with the later wave's promoted/deferred split.
