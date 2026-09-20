param(
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$workDirectory = Join-Path $repositoryRoot 'gis\work'
$geopackage = Join-Path $workDirectory 'granada-historica.gpkg'

$qgisDirectory = Get-ChildItem -LiteralPath 'C:\Program Files' -Directory -Filter 'QGIS *' |
  Sort-Object Name -Descending |
  Select-Object -First 1

if (-not $qgisDirectory) {
  throw 'No se ha encontrado QGIS en C:\Program Files. Instala QGIS LTR antes de preparar el espacio GIS.'
}

$ogr2ogr = Join-Path $qgisDirectory.FullName 'bin\ogr2ogr.exe'
$qgisPython = Join-Path $qgisDirectory.FullName 'bin\python-qgis-ltr.bat'
$gdalData = Join-Path $qgisDirectory.FullName 'apps\gdal\share\gdal'
if (-not (Test-Path -LiteralPath $ogr2ogr) -or -not (Test-Path -LiteralPath $qgisPython)) {
  throw "La instalación de QGIS no incluye ogr2ogr o Python: $($qgisDirectory.FullName)"
}
if (Test-Path -LiteralPath $gdalData) {
  $env:GDAL_DATA = $gdalData
}

if ((Test-Path -LiteralPath $geopackage) -and -not $Force) {
  throw 'Ya existe el GeoPackage de trabajo. Usa -Force solo si quieres reconstruirlo desde los GeoJSON canónicos.'
}

New-Item -ItemType Directory -Force -Path $workDirectory | Out-Null
if (Test-Path -LiteralPath $geopackage) {
  Remove-Item -LiteralPath $geopackage -Force
}

Push-Location $repositoryRoot
try {
  npm run validate:data
  if ($LASTEXITCODE -ne 0) { throw 'Los datos canónicos no son válidos.' }

  $layers = @(
    @{ Name = 'points'; Source = 'data\geo\points.geojson'; Mode = @() },
    @{ Name = 'lines'; Source = 'data\geo\lines.geojson'; Mode = @('-update') },
    @{ Name = 'areas'; Source = 'data\geo\areas.geojson'; Mode = @('-update') }
  )

  foreach ($layer in $layers) {
    & $ogr2ogr -f GPKG @($layer.Mode) $geopackage $layer.Source -nln $layer.Name -t_srs EPSG:25830 -overwrite
    if ($LASTEXITCODE -ne 0) { throw "No se ha podido importar la capa $($layer.Name)." }
  }

  & $qgisPython 'scripts\create-qgis-project.py' $repositoryRoot
  if ($LASTEXITCODE -ne 0) { throw 'No se ha podido crear el proyecto QGIS.' }

  Write-Output 'Espacio GIS preparado en EPSG:25830.'
  Write-Output "Proyecto: $(Join-Path $repositoryRoot 'gis\granada-historica.qgz')"
  Write-Output "Datos de trabajo: $geopackage"
}
finally {
  Pop-Location
}
