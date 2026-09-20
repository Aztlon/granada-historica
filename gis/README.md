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
