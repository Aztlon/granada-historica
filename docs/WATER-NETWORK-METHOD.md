# Water and urban-enclosure audit

Revised 23 September 2026. These are interpretive historical corridors and
envelopes, not surveyed medieval channel beds or cadastral neighborhood limits.
`verified` means the recorded review was performed, not that the location is
historically certain. Reconstructed features retain approximate confidence.

## Evidence and historical phases

The main hydraulic synthesis is Martín Martín et al., *El camino del agua desde
sus fuentes hasta la medina de la Alhambra y Granada en época islámica*, **Agua y
Territorio / Water and Landscape 27** (2025), pp. 127-151,
[DOI 10.17561/at.27.9097](https://doi.org/10.17561/at.27.9097). The `/atma/`
download path does not identify the journal correctly. Map 5 is on printed
p. 138 / PDF page 12. Its caption says **eleventh-thirteenth centuries** and its
legend distinguishes Zirid fabric and Nasrid expansion: it is not a complete
1492 cadastral plan. Map 4 is an earlier-phase comparison, not an interchangeable
boundary source.

Cross-checks include the municipal PEPRI Albaicín annex, *Memoria urbana*,
pp. 63-65 (successive northern enclosures), pp. 69-70 (water distribution), and
p. 88 (Isac's late-Nasrid city diagram). Surviving gates, OSM footprints, the
DERA river axes and the previously recorded southern-wall archaeology constrain
the modern registration. The Patronato's Acequia Real and Torre del Agua
descriptions constrain the Generalife-to-Alhambra route. Encarnación Reyes
Martínez's 2005 study of ceramics from the Puente del Carbón tannery supplies
the archaeological context for the 1992 bridge excavation.

## Reproducible registration

`data/reconstruction/water-urban-registration.json` records the source-page
pixel frame, five controls, three independent check points and digitized
chains. Coordinates were read on a full-page 1191 x 1684 rendering (2 pixels per
PDF point), with the origin at the top left. An affine least-squares fit maps
pixels to ETRS89 / UTM 30N (EPSG:25830); output is WGS84 (EPSG:4326).

Controls are Monaita, the Sagrario mosque site, Bab al-Difaf's river crossing,
Fajalauza and the Darro-Genil confluence. Elvira, Las Pesas and San Miguel Bajo
are withheld from the fit. The fitted RMSE is **8.37 m**, with a largest control
residual of **11.26 m**. Independent residuals are approximately **14.58, 10.60
and 3.45 m** respectively. These measure alignment to selected anchors, **not
historical positional accuracy**. Generalization, identification of map symbols,
river changes and phase differences remain unquantified. Las Pesas subsequently
anchors the edited boundary; its reported residual is for the original affine
fit, before that local adjustment.

`scripts/reconstruct-water-urban.py` reproduces the fit, geometry and QA report
using Python with numpy, pyproj, shapely and Pillow (available in QGIS Python):

```powershell
& 'C:/Program Files/QGIS 3.44.12/bin/python-qgis-ltr.bat' scripts/reconstruct-water-urban.py --inspect
& 'C:/Program Files/QGIS 3.44.12/bin/python-qgis-ltr.bat' scripts/reconstruct-water-urban.py --file data/geo/lines.geojson
```

The second command prints an `apply_patch` patch; it does not overwrite data.
Omit `--file` to generate all reconstruction outputs. The script consumes
existing independently reviewed rivers, gates and outer walls; it is not a
standalone replacement for those canonical sources. Editorial overrides are
recorded in `water-urban-editorial.json`; affine coefficients, residuals,
crossings and shared-edge lengths are recorded in `water-urban-audit.json`.
For visual QA, `--render` overlays the geometry on `tmp/pdfs/audit/map5.png`, a
locally rendered copy of the source page. The source PDF and its
renders are not required to build the web app and are not committed.

## Hydraulic decisions

| Feature | Revision and qualification |
| --- | --- |
| Axares / San Juan | Follows the right-bank corridor to the Mezquita Mayor/Sagrario. Map 5 and PEPRI pp. 69-70 identify Axares as the principal cistern supply. The endpoint represents supply to the site, not an excavated pipe connection. |
| Aynadamar | Branched high-hill distribution reaches the developed Alcazaba and hill mosque sites. The unsupported descent to the Sagrario is removed. Line endings indicate the represented extent, not necessarily hydraulic terminations. |
| Romayla | The mapped urban section follows the left bank and continues into the southern city. The upstream intake aqueduct is outside this crop. **The 2025 prose, p. 137, mentions two crossings and a return toward the mosque, whereas its map and the PEPRI support Axares as the principal mosque supply.** The discrepancy is retained in the feature card; it no longer generates an invented direct Sagrario connection or mandatory urban crossings. Later repartimientos are not conflated with a fully known 1492 network. |
| Gorda | Remains north of the Genil and crosses the Darro before the confluence. Its upstream Genil intake is outside the crop. |
| Tarramonta | Derives from the eastern Gorda corridor, crosses the Genil roughly 430 m east of the Darro confluence, then continues southwest. The previous downstream western crossing and southeast continuation were wrong. The precise medieval crossing is not surveyed. |
| Arabuleila | Separate upstream/eastern derivation and Genil crossing, followed by southwest continuation. |
| Realejo | Eastern approach, urban penetration and a return branch replace the short spur from the confluence. Small distributions remain approximate. |
| Cadí | Higher southern corridor based on the figure and p. 139. Not every source segment is labelled: assignment is less secure than the explicitly labelled canals. The Aguas Blancas intake is not mapped here. |
| Real | Passes through the Generalife's Patio de la Acequia and the surviving aqueduct at Torre del Agua. The previous shortcut bypassed both. The Jesús del Valle intake is outside the displayed segment. |

The source's schematic rivers do not coincide exactly with modern DERA axes.
After affine registration, eastern Romayla vertices are constrained to the
Darro's southern bank, and Arabuleila's post-crossing vertices to the Genil's
southern bank (minimum 0.00018 degrees latitude offset at adjusted vertices).
This prevents spurious crossings without pretending that the modern axes fix
the medieval banks. The adjustments are explicit in the reconstruction script.

## Bridges, quarters and walls

- Puente del Carbón is now a short crossing of the buried Darro on the surviving
  street alignment beside the Corral, not a point northwest of Bibarrambla. Its
  span remains probable. Bab al-Difaf likewise spans the river; its nomenclature
  controversy remains visible in the gazetteer.
- Qadima now represents the **developed Zirid enclosure**, not just its smaller
  primitive core. Its southern return includes San Miguel Bajo/San José and the
  San Juan de los Reyes corridor described in the PEPRI. This does not date all
  sections to a single building phase.
- Qadima, Axares and al-Bayyazin are constructed together with shared edges,
  without the previous arbitrary gaps and overlaps. Their aggregate forms the
  historical Albaicín envelope. The northern arrabal retains the independently
  checked outer Nasrid wall. “Los Alconeros” is recorded as Map 5's label, not
  asserted as a proven etymology.
- Axares' eastern return is locally constrained inside the surveyed outer-wall
  descent; its river edge follows the DERA axis. The Qadima and Axares wall lines
  reuse their polygon boundaries. A schematic enclosure edge, especially the
  river frontage, is not a surveyed foundation footprint.
- Arenal/Rambla becomes an elongated, approximately rectangular strip outside
  the medina, corroborated by the Isac diagram; overlap from the map fit is
  trimmed against the medina. It is not all of modern Magdalena.
- **Superseded southern-quarter inference:** the original Map 5-based Alfareros
  polygon extended too far under the Alhambra. The archaeological correction in
  [ALFAREROS-REVIEW.md](ALFAREROS-REVIEW.md) restores the documented
  Santo Domingo–Santiago sector and the southwestward interior-wall corridor.
  Alfareros and Loma are approximate reference envelopes, not a forced partition
  along an unidentified border. The water-map affine residuals do not measure
  the accuracy of their editorial vertices. Antequeruela remains overlapping.
- The southern **outer** late-Nasrid wall retains the archaeological anchors
  from the earlier southern-edge review. It is not replaced wholesale by the
  older-phase schematic perimeter. Medina and overall urban extent are
  recomputed consistently with the revised northern enclosures and Arenal.

## Regression checks and remaining uncertainty

`src/data/spatialAudit.ts` runs in `npm run validate:data`, production builds
and CI. Tests deliberately reintroduce wrong mosque endpoints, the western
Tarramonta crossing, the displaced Carbón point and disconnected northern
quarters. Checks cover unique river crossings, orientation after crossing,
connections to Gorda, the Generalife route, gates on the interior wall,
polygon/wall equality and substantial common quarter edges. Collinear disjoint
segments no longer count as intersections, and shared-vertex crossings count
once. The Python report additionally checks full geometry validity.

These checks prevent known contradictions; they do not independently prove
the historical reconstruction. Lost canal beds, minor repartimientos, the
Alfareros/Loma division, primitive versus expanded wall phases and exact
medieval river banks remain research questions. A clean map must not disguise
these uncertainties. Future source changes should revise both geometry and
the documented test assumptions rather than quietly forcing the data to pass.
