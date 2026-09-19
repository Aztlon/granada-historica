# GIS workspace

Use QGIS for research and editing. The working project coordinate reference
system is ETRS89 / UTM zone 30N (EPSG:25830); web exports use WGS84
(EPSG:4326).

For every created geometry, record its method and source references. A precise
shape is appropriate only when supported by the evidence. Otherwise prefer an
approximate area, representative point, or label.

Local scans and research material with uncertain or restricted reuse rights
belong in `gis/research-local/` or `gis/scans/`. Both are ignored by Git. Do not
commit a QGIS project until it can open without private paths or unavailable
licensed layers.
