param(
  [ValidateSet('c1492')]
  [string]$PeriodId = 'c1492'
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$geopackage = Join-Path $repositoryRoot "gis\work\granada-historica-$PeriodId.gpkg"
$exportDirectory = Join-Path $repositoryRoot "gis\export\$PeriodId"

if (-not (Test-Path -LiteralPath $geopackage)) {
  throw "No existe el GeoPackage temporal $PeriodId. Ejecuta primero npm run gis:period:bootstrap."
}

$qgisDirectory = Get-ChildItem -LiteralPath 'C:\Program Files' -Directory -Filter 'QGIS *' |
  Sort-Object Name -Descending |
  Select-Object -First 1
$ogr2ogr = if ($qgisDirectory) { Join-Path $qgisDirectory.FullName 'bin\ogr2ogr.exe' } else { $null }
$gdalData = if ($qgisDirectory) { Join-Path $qgisDirectory.FullName 'apps\gdal\share\gdal' } else { $null }
if (-not $ogr2ogr -or -not (Test-Path -LiteralPath $ogr2ogr)) {
  throw 'No se ha encontrado ogr2ogr en la instalación de QGIS.'
}
if ($gdalData -and (Test-Path -LiteralPath $gdalData)) {
  $env:GDAL_DATA = $gdalData
}

New-Item -ItemType Directory -Force -Path $exportDirectory | Out-Null

Push-Location $repositoryRoot
try {
  foreach ($layer in @('points', 'lines', 'areas')) {
    $output = Join-Path $exportDirectory "$layer.geojson"
    if (Test-Path -LiteralPath $output) {
      Remove-Item -LiteralPath $output -Force
    }
    & $ogr2ogr -f GeoJSON $output $geopackage $layer -t_srs EPSG:4326 -lco RFC7946=YES -overwrite
    if ($LASTEXITCODE -ne 0) { throw "No se ha podido exportar la capa temporal $layer." }
  }

  npx tsx scripts/normalize-period-gis-export.ts $PeriodId
  if ($LASTEXITCODE -ne 0) { throw 'La exportación GIS temporal no ha superado la validación de paridad.' }

  npm run validate:data
  if ($LASTEXITCODE -ne 0) { throw 'Los GeoJSON temporales exportados no han superado la validación final.' }

  Write-Output "Exportación temporal $PeriodId completada: EPSG:25830 -> GeoJSON RFC 7946 en EPSG:4326."
}
finally {
  Pop-Location
}
