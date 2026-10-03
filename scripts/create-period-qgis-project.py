from pathlib import Path
import sys

from qgis.PyQt.QtGui import QColor
from qgis.core import (
    Qgis,
    QgsApplication,
    QgsCategorizedSymbolRenderer,
    QgsCoordinateReferenceSystem,
    QgsPalLayerSettings,
    QgsProject,
    QgsRasterLayer,
    QgsRendererCategory,
    QgsSymbol,
    QgsTextBufferSettings,
    QgsTextFormat,
    QgsVectorLayer,
    QgsVectorLayerSimpleLabeling,
)


CATEGORY_STYLES = {
    "urban_structure": ("Estructura urbana", "#9a6845"),
    "walls_gates": ("Murallas y puertas", "#9f493d"),
    "religion_learning": ("Religión y conocimiento", "#6e4f88"),
    "commerce_civic": ("Comercio y vida cívica", "#bd7a2a"),
    "water_infrastructure": ("Agua e infraestructuras", "#247d91"),
    "royal_elite": ("Paisajes regios y de élite", "#b23f37"),
    "burial_other": ("Ámbitos funerarios y otros", "#687267"),
}


def style_layer(layer: QgsVectorLayer) -> None:
    categories = []
    for value, (label, color) in CATEGORY_STYLES.items():
        symbol = QgsSymbol.defaultSymbol(layer.geometryType())
        symbol.setColor(QColor(color))
        if layer.geometryType() == Qgis.GeometryType.Polygon:
            symbol.setOpacity(0.24)
        elif layer.geometryType() == Qgis.GeometryType.Line:
            symbol.setWidth(1.15)
        else:
            symbol.setSize(4.2)
        categories.append(QgsRendererCategory(value, symbol, label))
    layer.setRenderer(QgsCategorizedSymbolRenderer("category", categories))

    settings = QgsPalLayerSettings()
    settings.fieldName = "name"
    text_format = QgsTextFormat()
    text_format.setColor(QColor("#3f2d25"))
    text_format.setSize(9.5)
    buffer = QgsTextBufferSettings()
    buffer.setEnabled(True)
    buffer.setSize(1.1)
    buffer.setColor(QColor("#fff9eb"))
    text_format.setBuffer(buffer)
    settings.setFormat(text_format)
    layer.setLabeling(QgsVectorLayerSimpleLabeling(settings))
    layer.setLabelsEnabled(True)


def main() -> int:
    if len(sys.argv) != 3:
        raise RuntimeError(
            "Uso: create-period-qgis-project.py <raíz-del-repositorio> <periodo>"
        )

    repository_root = Path(sys.argv[1]).resolve()
    period_id = sys.argv[2]
    if period_id not in ("c1492", "c1550"):
        raise RuntimeError("El proyecto temporal solo admite c1492 o c1550.")

    suffix = "c1492" if period_id == "c1492" else "c1550-research"
    geopackage = repository_root / "gis" / "work" / f"granada-historica-{suffix}.gpkg"
    project_path = repository_root / "gis" / f"granada-historica-{suffix}.qgz"
    if not geopackage.exists():
        raise FileNotFoundError(f"No existe el GeoPackage: {geopackage}")

    app = QgsApplication([], False)
    app.initQgis()
    try:
        project = QgsProject.instance()
        project.clear()
        if period_id == "c1492":
            project.setTitle("Granada Histórica - periodo c. 1492 (compatibilidad M10.1)")
            group_name = "Periodo c. 1492 - compatibilidad M10.1"
        else:
            project.setTitle("Granada Histórica - c. 1550 (INVESTIGACIÓN M10.2 - NO PUBLICAR)")
            group_name = "c. 1550 - INVESTIGACIÓN M10.2 - NO PUBLICAR"
        project.setCrs(QgsCoordinateReferenceSystem("EPSG:25830"))
        project.setFilePathStorage(Qgis.FilePathType.Relative)

        period_group = project.layerTreeRoot().addGroup(group_name)
        for layer_name, display_name in (
            ("areas", f"Áreas históricas {period_id}"),
            ("lines", f"Líneas históricas {period_id}"),
            ("points", f"Puntos históricos {period_id}"),
        ):
            uri = f"{geopackage.as_posix()}|layername={layer_name}"
            layer = QgsVectorLayer(uri, display_name, "ogr")
            if not layer.isValid():
                raise RuntimeError(f"QGIS no ha podido abrir la capa {layer_name}.")
            style_layer(layer)
            project.addMapLayer(layer, False)
            period_group.addLayer(layer)

        reference_group = project.layerTreeRoot().addGroup(
            "Referencias de control (no editar)"
        )
        ortho_uri = (
            "crs=EPSG:25830&format=image/png&layers=ortofotografia_2022_rgb"
            "&styles=&url=https://www.ideandalucia.es/wms/ortofoto_2022?"
        )
        ortho = QgsRasterLayer(ortho_uri, "PNOA Andalucía 2022 · 0,25 m", "wms")
        if ortho.isValid():
            project.addMapLayer(ortho, False)
            reference_group.addLayer(ortho)

        basemap_uri = (
            "type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            "&zmin=0&zmax=19"
        )
        basemap = QgsRasterLayer(
            basemap_uri, "Contexto moderno - OpenStreetMap", "wms"
        )
        if basemap.isValid():
            project.addMapLayer(basemap, False)
            reference_group.addLayer(basemap)
            reference_group.findLayer(basemap.id()).setItemVisibilityChecked(False)

        if not project.write(str(project_path)):
            raise RuntimeError(f"No se ha podido escribir el proyecto {project_path}.")
        print(f"Proyecto QGIS temporal creado: {project_path}")
        return 0
    finally:
        app.exitQgis()


if __name__ == "__main__":
    raise SystemExit(main())
