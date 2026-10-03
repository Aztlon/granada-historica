# Flujo cartográfico de M3

M3 está en una pasada correctiva completa. Ninguna geometría de trabajo se
considera válida por herencia: su estado y método de control se registran en
`data/geometry-audit.json`. El mapa web solo muestra entradas `verified`.

El proyecto QGIS trabaja en **ETRS89 / UTM zona 30N (EPSG:25830)** para que
distancias, ajustes y revisiones se realicen en metros. Los GeoJSON públicos de
`data/geo/` siguen siendo la copia canónica versionada y se publican en
**WGS84 / EPSG:4326**, conforme a RFC 7946.

## Preparar el espacio de trabajo

Con QGIS LTR instalado:

```powershell
npm run gis:bootstrap
```

El comando valida los datos públicos, crea
`gis/work/granada-historica.gpkg` en EPSG:25830 y genera
`gis/granada-historica.qgz`. El GeoPackage es local y no se versiona para evitar
dos fuentes de verdad.

`gis:bootstrap` reconstruye el GeoPackage. Haz antes una exportación si contiene
cambios que quieras conservar.

## Editar y revisar

1. Abre `gis/granada-historica.qgz` en QGIS.
2. Edita las capas `points`, `lines` y `areas` dentro del GeoPackage.
3. Conserva los campos JSON (`period`, `confidence`, citas y listas) como JSON
   válido; QGIS los almacena como texto estructurado.
4. Revisa en metros la relación con restos conservados, relieve y referencias.
5. No conviertas una reconstrucción aproximada en un borde preciso sin añadir
   una fuente y actualizar `confidence`, `geometry_method` y `evidence_note`.
6. Actualiza `data/geometry-audit.json` solo después de documentar la fuente, el
   método y la fecha de la comprobación.

El proyecto incluye la ortofoto oficial PNOA Andalucía 2022 como referencia de
control y OpenStreetMap como contexto secundario. La ortofoto permite comprobar
fábricas visibles actuales; no demuestra por sí sola una geometría histórica.

## Exportar para la web

```powershell
npm run gis:export
```

El comando reproyecta las tres capas a EPSG:4326, restaura los identificadores
GeoJSON, valida esquema y fuentes, y solo entonces actualiza `data/geo/`. Después
conviene revisar el diff y ejecutar `npm test` y `npm run build`.

Los PDF, escaneos, mapas georreferenciados y demás materiales de investigación
no se guardan en este directorio. Deben permanecer en `gis/research-local/` o
`gis/scans/`, que están excluidos del repositorio.

## Ruta temporal paralela de M10.1

M10.1 añade un espacio de trabajo separado para comprobar que la arquitectura
por periodos puede reproducir el estado publicado sin modificarlo:

```powershell
npm run periods:generate
npm run gis:period:bootstrap
```

El segundo comando crea `gis/work/granada-historica-c1492.gpkg` y
`gis/granada-historica-c1492.qgz` a partir de `data/periods/c1492/`. No reemplaza
el GeoPackage, el proyecto QGIS ni los GeoJSON canónicos anteriores.

La exportación paralela se ejecuta con:

```powershell
npm run gis:period:export
```

Durante M10.1 este exportador es deliberadamente estricto: comprueba IDs,
orden, todas las propiedades y geometrías contra `data/geo/` antes de escribir.
Si QGIS o la reproyección introducen cualquier cambio, la exportación se detiene
sin actualizar `data/periods/c1492/`. Para recuperar los derivados basta ejecutar
de nuevo `npm run periods:generate`. Las geometrías nuevas de c. 1550 pertenecen
a M10.2 y no deben incorporarse todavía a esta ruta de compatibilidad.

## Espacio privado de investigación c. 1550

M10.2 tiene un flujo aislado propio:

```powershell
npm run gis:c1550:bootstrap
npm run gis:c1550:export
```

Crea `gis/work/granada-historica-c1550-research.gpkg` y
`gis/granada-historica-c1550-research.qgz`. El proyecto lleva la etiqueta
`INVESTIGACIÓN — NO PUBLICAR` y su exportador solo escribe en
`data/research/c1550/`. Nunca actualiza `data/geo/` ni la aplicación pública
c. 1492.

Todo cambio material exige revisar también
`data/research/c1550/geometry-audit.json`. Los registros permanecen `in_review`
hasta registrar las seis aprobaciones responsables del candidato M10.5; el
validador rechaza un estado `verified` prematuro o incoherente. Consulta
[`docs/C1550-GIS.md`](../docs/C1550-GIS.md) para ver los anclajes incluidos,
las reglas de fase y los polígonos aplazados, y
[`docs/M10-3-REVIEW.md`](../docs/M10-3-REVIEW.md) para el procedimiento de
revisión inicial y [`docs/M10-5-CANDIDATE.md`](../docs/M10-5-CANDIDATE.md) para
la puerta actual, las derivaciones aplazadas y la matriz de inventario.
