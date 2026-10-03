param(
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$researchDirectory = Join-Path $repositoryRoot 'data\research\c1550'
$workDirectory = Join-Path $repositoryRoot 'gis\work'
$geopackage = Join-Path $workDirectory 'granada-historica-c1550-research.gpkg'

if (-not (Test-Path -LiteralPath $researchDirectory)) {
  throw "No existe el paquete de investigación c. 1550 en $researchDirectory."
}

$qgisDirectory = Get-ChildItem -LiteralPath 'C:\Program Files' -Directory -Filter 'QGIS *' |
  Sort-Object Name -Descending |
  Select-Object -First 1
if (-not $qgisDirectory) {
  throw 'No se ha encontrado QGIS en C:\Program Files.'
}

$ogr2ogr = Join-Path $qgisDirectory.FullName 'bin\ogr2ogr.exe'
$qgisPython = Join-Path $qgisDirectory.FullName 'bin\python-qgis-ltr.bat'
$gdalData = Join-Path $qgisDirectory.FullName 'apps\gdal\share\gdal'
if (-not (Test-Path -LiteralPath $ogr2ogr) -or -not (Test-Path -LiteralPath $qgisPython)) {
  throw "La instalación de QGIS no incluye ogr2ogr o Python: $($qgisDirectory.FullName)"
}
if (Test-Path -LiteralPath $gdalData) { $env:GDAL_DATA = $gdalData }

if ((Test-Path -LiteralPath $geopackage) -and -not $Force) {
  throw 'Ya existe el GeoPackage de investigación c. 1550. Exporta cualquier cambio antes de reconstruirlo o usa -Force conscientemente.'
}

New-Item -ItemType Directory -Force -Path $workDirectory | Out-Null
if (Test-Path -LiteralPath $geopackage) {
  Remove-Item -LiteralPath $geopackage -Force
}

Push-Location $repositoryRoot
try {
  npm run validate:data
  if ($LASTEXITCODE -ne 0) { throw 'El paquete de investigación c. 1550 no es válido.' }

  $layers = @(
    @{ Name = 'points'; Source = 'data\research\c1550\points.geojson'; Mode = @() },
    @{ Name = 'lines'; Source = 'data\research\c1550\lines.geojson'; Mode = @('-update') },
    @{ Name = 'areas'; Source = 'data\research\c1550\areas.geojson'; Mode = @('-update') }
  )
  foreach ($layer in $layers) {
    & $ogr2ogr -f GPKG @($layer.Mode) $geopackage $layer.Source -nln $layer.Name -t_srs EPSG:25830 -overwrite
    if ($LASTEXITCODE -ne 0) { throw "No se ha podido importar la capa c. 1550 $($layer.Name)." }
  }

  & $qgisPython 'scripts\create-period-qgis-project.py' $repositoryRoot 'c1550'
  if ($LASTEXITCODE -ne 0) { throw 'No se ha podido crear el proyecto QGIS de investigación c. 1550.' }

  Write-Output 'Espacio GIS c. 1550 preparado en EPSG:25830. INVESTIGACIÓN: NO PUBLICAR.'
  Write-Output "Proyecto: $(Join-Path $repositoryRoot 'gis\granada-historica-c1550-research.qgz')"
  Write-Output "Datos de trabajo: $geopackage"
}
finally {
  Pop-Location
}
