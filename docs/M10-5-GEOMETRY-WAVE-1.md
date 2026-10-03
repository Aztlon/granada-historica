# M10.5 — Low-risk geometry wave 1

Status: **implemented for private specialist review on 2026-10-02**
Publication state: research only; `public_application_import: false`
Review state: all 16 new audits are `in_review`

## Purpose

This wave turns the safest subset of the first three source-review tranches into
visible c. 1550 research geometry. It does not approve any historical claim,
verify any geometry, or enlarge the public c. 1492 dataset. Historical review
is owner-led by the project historian; no institutional partner is assumed or
required.

The canonical decision record is
[`data/research/c1550/m10.5-geometry-wave-1.json`](../data/research/c1550/m10.5-geometry-wave-1.json).
It is generated together with the GeoJSON, audit, and manifest changes by
[`scripts/assemble-m10-5-geometry-wave-1.ts`](../scripts/assemble-m10-5-geometry-wave-1.ts).

## Geometry created

### Six church and convent site points

| Feature ID | Site reference | Coordinate (lon, lat) | Interpretation |
|---|---|---:|---|
| `religious.santa-cruz-real` | Convento de Santa Cruz la Real / Santo Domingo | -3.5945504, 37.1730264 | modern site point |
| `religious.san-jeronimo` | Monasterio de San Jerónimo | -3.6044240, 37.1791280 | modern site point |
| `religious.san-jose` | Iglesia de San José | -3.5961800, 37.1786300 | modern site point |
| `religious.san-juan-reyes` | Iglesia de San Juan de los Reyes | -3.5918500, 37.1799194 | modern site point |
| `religious.san-matias` | Iglesia Imperial de San Matías | -3.5965717, 37.1736760 | modern site point |
| `religious.san-luis` | Iglesia de San Luis | -3.5913220, 37.1850870 | modern site point |

These points locate the modern site only. They do not assert a 1550 parcel,
church footprint, convent enclosure, construction phase, or relationship to
neighbouring buildings. Each is cross-referenced to the relevant institutional
history, OpenStreetMap, and the PNOA orthophoto registry entry.

### Four surviving-gate points

- `gate.elvira`
- `gate.monaita`
- `gate.alhambra-arms`
- `gate.alhambra-seven-floors`

The public point geometry is copied unchanged into a new c. 1550 variant. A
point locates surviving fabric; it does not reconstruct towers, courts,
barbicans, attached walls, or the full access complex in 1550.

### Two monument envelopes

- `commerce.corral-carbon`
- `water.banuelo`

The surviving public footprint is retained as a site envelope. It remains
`in_review` because the visible building incorporates later alterations,
losses, and restoration. The Bañuelo's c. 1550 function remains `probable`, not
secure, even though its site and surviving fabric can be mapped.

### Four inherited line axes

- `water.darro`
- `water.genil`
- `route.elvira-axis`
- `bridge.carbon`

These lines are copied as reviewable alignment hypotheses. Continuity of the
river, street, or crossing does not prove every vertex, bank, width, bridge
deck, vault, or contact point in 1550.

## Geometry deferred by this wave

The wave records and validates the exact 14 source-reviewed deferrals:

- `water.acequia-real-alhambra`
- `royal.casa-castril`
- `royal.casa-tiros`
- `gate.fajalauza`
- `gate.mawrur`
- `walls.albaicin-north`
- `walls.medina-lower`
- `water.acequia-aynadamar`
- `water.acequia-gorda`
- `royal.generalife`
- `gate.alhambra-arrabal`
- `bridge.cadi`
- `water.acequia-cadi`
- `water.acequia-romayla`

Wave 2 subsequently promotes Fajalauza and five canal axes under a stricter
control-and-exclusion register. The other eight remain geometry-free. See
[M10-5-GEOMETRY-WAVE-2.md](M10-5-GEOMETRY-WAVE-2.md).

## Resulting package

The private c. 1550 package now contains:

| Geometry | Count |
|---|---:|
| Points | 25 |
| Lines | 10 |
| Areas | 4 |
| **Total after wave 2** | **39** |

After geometry wave 2, the M10.5 inventory matrix contains 39
`internal_candidate`, 18 `content_ready_geometry_deferred`, 0
`research_not_started`, 18
`deferred_analytical_geometry`, and 3 `deferred_sensitive_spatial_claim`
decisions.

## Reproduction and review

Regenerate this wave and the combined candidate with:

```powershell
npm run m10:5:geometry:1
npx tsx scripts/assemble-m10-5-candidate.ts
npm run validate:data
npm test
```

`npm run m10:5:assemble` runs the same steps after rebuilding the four source
tranches and the deferred-evidence package. Any later geometry edit must update
the matching `geometry-audit.json` entry and remain private until the applicable
review functions record approval.
