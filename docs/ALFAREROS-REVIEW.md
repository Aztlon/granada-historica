# Alfareros: archaeological correction, 23 September 2026

## Decision

The preceding water-map audit moved Alfareros too far east. Its polygon filled
the slope below the Alhambra while excluding archaeological sectors around
Santo Domingo, Santiago and the Cuarto Real. This was an editorial error, not
an established historical boundary shift. The earlier western polygon is not
simply restored: early workshops inside the medina must be distinguished from
the later arrabal outside its old wall.

## Evidence hierarchy

- **Garrido López 2024**, *Configuración y desarrollo de un espacio artesanal*,
  DOI [10.5944/etfiii.37.2024.36264](https://doi.org/10.5944/etfiii.37.2024.36264),
  printed pp. 663–679, especially figures 1, 5 and 6: a specialist synthesis of
  excavated pottery sites and their chronology. The western boundary is the old
  medina wall with Bab al-Fajjarin; the north is the southern face of the Mauror;
  the southern enclosure passes Progreso, Aixa, Cuarto Real and Pescado. The
  boundary with al-Nayd is explicitly **unidentified**. Later sites include
  Callejón de Santo Domingo, Seco de Lucena, Santiago, Jarrería and Molinos.
  The distribution includes sites of different dates, including some outside
  the arrabal: it must not be converted into a convex hull of every kiln.
- **Mancilla Cabello and Román Punzón**, Cuesta del Realejo 26, AAA 2004,
  printed pp. 470–472: places the excavation in Alfareros/Realejo Alto and
  describes the gate, wall, Santo Domingo, Moral–Santiago and Cuarto Real.
  This prevents a correction that would move everything onto the western plain.
- **Patronato, Bosque de Gomérez (2022)**: the medieval slope had a military
  function and less dense vegetation; extensive woodland developed after the
  conquest. Modern forest is not proof of unchanged medieval land use, but
  neither is it evidence for assigning this slope to the pottery quarter.
- **2025 water-network Map 5 / PEPRI diagrams** remain useful for broad
  relationships. They are superseded here by archaeological evidence, not
  treated as cadastral boundaries or proof that every enclosed slope was urban.

## Changes and limits

1. Alfareros now marks an approximate reference envelope around Realejo,
   Santo Domingo, Santiago/Jarrería and the northern Cuarto Real sector.
   It includes mixed land uses, not continuous houses or exclusively workshops.
2. The interior wall descends southwest from Fortuny through the Santo Domingo
   corridor toward Campos/Progreso, rather than almost due south. Its vertices
   are modern street reference points interpolating a historical corridor, not
   surveyed medieval foundations. The northward Sol/Torres Bermejas link is retained.
3. La Loma no longer receives the western archaeological core by subtraction.
   The envelopes leave a narrow unresolved transition. This is **not evidence
   for a gap in habitation, an intervening quarter, or a dividing wall**.
4. The outer late-Nasrid enclosure is not redrawn in this focused correction.
   Its approximate placement and phase-specific archaeological support remain
   separate from the internal quarter assignment. The aggregate city envelope
   includes open and defensive land; it is not a built-up-area map.

The gate belongs to an older enclosure, not the final perimeter of the expanded
city. A corner position alone cannot falsify a quarter; here the decisive
contradiction was the exclusion of documented sectors and unjustified filling
of the eastern slope. Exact quarter borders still require specialist review;
this revision does not claim a definitive 1492 parcel reconstruction.

## Reproducibility

`data/reconstruction/alfareros-review.json` records the editorial vertices,
positive archaeological-sector checks and withdrawn eastern assignments.
`scripts/reconstruct-water-urban.py` consumes it after the northern registration;
**the affine residuals in the water audit do not apply to these southern vertices**.
The gazetteer, feature descriptions and geometry audit share the revised rationale.
Regression tests check inclusion of documented sectors, exclusion of the two
withdrawn slope locations and southwestward wall continuity. They no longer
require an invented shared Alfareros/Loma border.

Modern coordinates are from OpenStreetMap street/building references (consulted
23 September 2026), not measurements claimed by the historical publications.
The Cuarto Real check identifies the northern qubba sector, not every part of
the modern museum estate. Source PDFs and rendered figures are research-local
and are not redistributed with the application.
