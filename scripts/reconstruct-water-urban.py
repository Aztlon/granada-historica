"""Reproduce the September 2026 audit with QGIS Python (numpy/pyproj/shapely).

Print an apply_patch-compatible patch; never overwrite canonical files itself.
Inputs are the recorded page pixels, controls and editorial decisions. --inspect
prints geometric QA. --render writes a temporary source-registration overlay.
"""
import argparse
import difflib
import json
from pathlib import Path

import numpy as np
from pyproj import Transformer
from shapely.geometry import LineString, Point, Polygon, mapping, shape
from shapely.ops import substring, transform, unary_union
from shapely.validation import explain_validity

ROOT = Path(__file__).resolve().parents[1]
read = lambda p: json.loads((ROOT / p).read_text(encoding="utf-8"))
registration = read("data/reconstruction/water-urban-registration.json")
to_m = Transformer.from_crs(4326, 25830, always_xy=True).transform
to_ll = Transformer.from_crs(25830, 4326, always_xy=True).transform
controls = registration["controls"]
pixels = np.array([c["pixel"] + [1] for c in controls])
targets = np.array([to_m(*c["wgs84"]) for c in controls])
affine = np.linalg.lstsq(pixels, targets, rcond=None)[0]


def ll(point):
    return [round(v, 7) for v in to_ll(*(np.array([*point, 1]) @ affine))]


def chain(name):
    return [ll(p) for p in registration["chains"][name]]


collections = {n: read(f"data/geo/{n}.geojson") for n in ["areas", "lines", "points"]}
features = {f["id"]: f for c in collections.values() for f in c["features"]}
original = {k: json.loads(json.dumps(v)) for k, v in features.items()}


def geo(fid, kind, coords):
    features[fid]["geometry"] = {"type": kind, "coordinates": coords}


def polygon(fid, coords):
    if coords[-1] != coords[0]:
        coords = coords + [coords[0]]
    geo(fid, "Polygon", [coords])


def set_shape(fid, geometry):
    # Quantize derived boolean-operation coordinates consistently across layers.
    features[fid]["geometry"] = json.loads(json.dumps(mapping(geometry)),
                                         parse_float=lambda n: round(float(n), 7))


def point(fid):
    return features[fid]["geometry"]["coordinates"]


darro = LineString(point("water.darro"))
genil = LineString(point("water.genil"))


def river_point(p):
    return list(darro.interpolate(darro.project(Point(p))).coords[0])


def river_between(a, b):
    return [list(p) for p in substring(darro, darro.project(Point(a)), darro.project(Point(b))).coords]


# Three contiguous northern enclosures, with shared edges authored only once.
qn, qe, qs = (chain(n) for n in ["qadima_north", "qadima_east", "qadima_south_west"])
qn[0] = qs[-1] = point("gate.monaita")
qn[4] = [-3.5937726, 37.1824667]  # surviving Las Pesas, local OSM footprint
qe[-1] = qs[0] = [-3.5932689, 37.1791099]  # San Juan de los Reyes/coracha junction
polygon("quarter.alcazaba-qadima", qn + qe[1:] + qs[1:])
ae = chain("axares_east")
# The schematic eastern return otherwise clips the surveyed outer-wall descent.
# Keep Axares inside it and tie the river corner to a shared DERA vertex.
ae[-2] = [-3.58865,37.17965]
ae[-1] = [-3.5894253,37.1786145]
bridge_crossing = list(shape(features["bridge.cadi"]["geometry"]).intersection(darro).coords[0])
ax_river = river_between(ae[-1], bridge_crossing)
polygon("quarter.axares", list(reversed(qe)) + ae[1:] + ax_river[1:] + [qe[-1]])
outer = point("walls.albaicin-north")
guadix = point("gate.guadix")
outer_river = river_between(river_point(guadix), ae[-1])
polygon("quarter.albayyazin", outer + [guadix] + outer_river + list(reversed(ae))[1:]
        + list(reversed(qn))[1:] + [outer[0]])
for quarter, wall in [("quarter.alcazaba-qadima", "walls.alcazaba-qadima-inner"),
                      ("quarter.axares", "walls.axares-inner")]:
    geo(wall, "LineString", point(quarter)[0])
for q in ["alcazaba-qadima", "axares", "albayyazin"]:
    g = shape(features[f"quarter.{q}"]["geometry"])
    if not g.is_valid:
        raise ValueError(f"{q}: {explain_validity(g)} {g.wkt}")
set_shape("urban.albaicin", unary_union([shape(features[f"quarter.{q}"]["geometry"])
                                       for q in ["alcazaba-qadima", "axares", "albayyazin"]]))
# Bring the medina up to the actual interior enclosure instead of ending at Elvira street.
medina = point("urban.lower-medina")[0]
end = medina.index([-3.592682, 37.1782206]) + 1
polygon("urban.lower-medina", medina[:end] + [bridge_crossing, qe[-1]] + qs[1:] + [outer[0]])
# Elongated Arenal along the outside of the medina wall; trim the small map-fit overlap.
ramla = Polygon(chain("ramla_outer"))
set_shape("quarter.ramla", ramla.difference(shape(features["urban.lower-medina"]["geometry"])))
# Specialist archaeological review supersedes the schematic map for this sector.
# Do not fill all enclosed space or manufacture an unidentified quarter boundary.
southern_review = read("data/reconstruction/alfareros-review.json")
geo("walls.mauror-realejo-inner", "LineString", southern_review["interior_wall"])
polygon("quarter.alfajjarin", southern_review["alfareros_envelope"])
polygon("quarter.loma", southern_review["loma_envelope"])
set_shape("urban.late-nasrid-extent", unary_union([shape(features[f]["geometry"]) for f in
          ["urban.albaicin", "urban.lower-medina", "royal.alhambra", "quarter.ramla"]]))
# Channels follow digitized source lines. No invented upstream intake connections.
geo("water.acequia-aynadamar", "MultiLineString",
    [[ll(p) for p in part] for part in registration["chains"]["aynadamar"]])
for name in ["axares", "romayla", "gorda", "tarramonta", "arabuleila", "cadi"]:
    geo(f"water.acequia-{name}", "LineString", chain(name))
# The schematic rivers and today's axes differ locally. Constrain the identified
# bank after registration instead of publishing accidental modern-river crossings.
def south_bank(p, river):
    section = river.intersection(LineString([[p[0],37.15],[p[0],37.20]]))
    if section.geom_type == "Point":
        return [p[0], round(min(p[1], section.y - 0.00018), 7)]
    return p
geo("water.acequia-romayla", "LineString", [south_bank(p,darro) if p[0] > -3.585 else p
    for p in point("water.acequia-romayla")])
geo("water.acequia-arabuleila", "LineString", [south_bank(p,genil) if i >= 8 else p
    for i,p in enumerate(point("water.acequia-arabuleila"))])
point("water.acequia-axares")[-1] = point("religious.medina-great-mosque")
geo("water.acequia-realejo", "MultiLineString", [chain("realejo"), chain("realejo_outlet")])
# Carbón: prolong the observed street axis across the buried river, beside the funduq.
geo("bridge.carbon", "LineString", [[-3.59853,37.17524],[-3.598396,37.1751453],[-3.5982066,37.1750254]])
collections["points"]["features"] = [f for f in collections["points"]["features"] if f["id"] != "bridge.carbon"]
if not any(f["id"] == "bridge.carbon" for f in collections["lines"]["features"]):
    collections["lines"]["features"].append(features["bridge.carbon"])
# Real: checked OSM approach, Generalife courtyard and surviving water aqueduct.
geo("water.acequia-real-alhambra", "LineString", [
    [-3.5817625,37.1788478],[-3.5816603,37.178665],[-3.581667,37.1785531],
    [-3.5819913,37.1787368],[-3.5824111,37.1787738],[-3.5832342,37.1787096],
    [-3.5839494,37.1789329],[-3.5840519,37.1790179],[-3.5842283,37.1788751],
    [-3.5845059,37.1787815],[-3.5848573,37.1785505],[-3.584979,37.1784263],
    [-3.5853513,37.1778787],[-3.58572,37.17823],[-3.5859,37.1779],
    [-3.5858,37.1775],[-3.5856,37.1769],[-3.5853,37.1763],[-3.58508,37.17555],
    [-3.5852216,37.1749396],[-3.5854219,37.1750104],[-3.5855848,37.1750621],
    [-3.5865,37.1756],[-3.5874,37.1761],[-3.5884,37.17665],[-3.5891,37.1768]])

for fid, props in read("data/reconstruction/water-urban-editorial.json").items():
    features[fid]["properties"].update(props)


def metric(fid):
    return transform(to_m, shape(features[fid]["geometry"]))


report = {
    "source_id": registration["source_id"], "target_crs": "EPSG:25830",
    "affine_pixel_to_utm": affine.tolist(),
    "control_rmse_m": round(float(np.sqrt(np.mean(np.sum((pixels @ affine-targets)**2, axis=1)))), 2),
    "control_residuals_m": {c["name"]: round(float(np.linalg.norm(p @ affine-t)), 2)
                            for c,p,t in zip(controls,pixels,targets)},
    "independent_check_residuals_m": {
        c["name"]: round(float(np.linalg.norm(np.array([*c["pixel"],1]) @ affine-np.array(to_m(*c["wgs84"])))),2)
        for c in registration["check_points"]},
    "historical_accuracy": "Unquantified; drawing generalization, anchor identification and historical phase differences exceed registration residuals.",
    "reviewed_features": sorted(read("data/reconstruction/water-urban-editorial.json")),
    "invalid_geometries": [fid for fid in features if not shape(features[fid]["geometry"]).is_valid],
    "crossings": {},
    "quarter_shared_edges_m": {},
    "quarter_overlap_area_m2": {},
}
for water, river in [("gorda","genil"),("gorda","darro"),("tarramonta","genil"),
                     ("arabuleila","genil"),("axares","darro"),("romayla","darro")]:
    result = shape(features[f"water.acequia-{water}"]["geometry"]).intersection(shape(features[f"water.{river}"]["geometry"]))
    report["crossings"][f"{water}/{river}"] = mapping(result)
for a,b in [("alcazaba-qadima","axares"),("alcazaba-qadima","albayyazin"),
            ("axares","albayyazin")]:
    first, second = metric(f"quarter.{a}"), metric(f"quarter.{b}")
    report["quarter_shared_edges_m"][f"{a}/{b}"] = round(first.boundary.intersection(second.boundary).length, 1)
    report["quarter_overlap_area_m2"][f"{a}/{b}"] = round(first.intersection(second).area, 2)
if report["invalid_geometries"] or any(v > 0.5 for v in report["quarter_overlap_area_m2"].values()):
    raise ValueError(f"Invalid reconstruction: {report}")
alf = shape(features["quarter.alfajjarin"]["geometry"])
report["southern_review"] = {
    "input": "data/reconstruction/alfareros-review.json",
    "method": southern_review["method"],
    "boundary_status": southern_review["unknown"],
    "inclusions": {a["name"]: alf.contains(Point(a["wgs84"])) for a in southern_review["inclusion_checks"]},
    "exclusions": {a["name"]: not alf.contains(Point(a["wgs84"])) for a in southern_review["exclusion_checks"]},
    "overlap_m2": round(metric("quarter.alfajjarin").intersection(metric("quarter.loma")).area, 2),
}
assert all(report["southern_review"]["inclusions"].values())
assert all(report["southern_review"]["exclusions"].values())
assert report["southern_review"]["overlap_m2"] < 0.5

parser = argparse.ArgumentParser()
parser.add_argument("--inspect", action="store_true")
parser.add_argument("--render", action="store_true")
parser.add_argument("--file", help="Emit a patch only for this repository-relative file")
args = parser.parse_args()
if args.inspect:
    print(json.dumps(report, ensure_ascii=False, indent=2))
elif args.render:
    from PIL import Image, ImageDraw
    img = Image.open(ROOT / "tmp/pdfs/audit/map5.png").convert("RGB")
    draw = ImageDraw.Draw(img)
    inverse = np.linalg.inv(affine[:2, :])
    def px(p):
        return tuple((np.array(to_m(*p))-affine[2,:]) @ inverse)
    for fid, feature in features.items():
        g = feature["geometry"]
        if fid.startswith("quarter."):
            rings = g["coordinates"] if g["type"] == "Polygon" else [r for p in g["coordinates"] for r in p]
            for ring in rings:
                draw.line([px(p) for p in ring], fill="#bd325e", width=3)
        elif fid.startswith("water.acequia") or fid.startswith("bridge."):
            parts = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
            for part in parts:
                draw.line([px(p) for p in part], fill="#009a43", width=2)
    img.save(ROOT / "tmp/pdfs/audit/registered-overlay.png")
else:
    updates = {f"data/geo/{n}.geojson": c for n,c in collections.items()}
    audits = read("data/geometry-audit.json")
    for entry in audits:
        fid = entry["feature_id"]
        if fid in report["reviewed_features"]:
            p = features[fid]["properties"]
            entry.update(reviewed_on="2026-09-23", geometry_source_refs=p["geometry_source_refs"],
                         check_method="Registro afín reproducible del Mapa 5 y contraste con PEPRI, cartografía moderna y anclajes documentados; auditoría en data/reconstruction/water-urban-audit.json.",
                         notes=p["evidence_note"])
            if fid in ["quarter.alfajjarin", "quarter.loma", "walls.mauror-realejo-inner"]:
                entry["check_method"] = "Revisión arqueológica Garrido López 2024 y Cuesta del Realejo 26; anclajes modernos OSM. Envolventes editoriales y corredor de cerca aproximados, no registro afín: docs/ALFAREROS-REVIEW.md."
    updates["data/geometry-audit.json"] = audits
    updates["data/reconstruction/water-urban-audit.json"] = report
    print("*** Begin Patch")
    for path, data in updates.items():
        if args.file and path != args.file:
            continue
        target = ROOT / path
        old = target.read_text(encoding="utf-8") if target.exists() else ""
        if "/geo/" in path:
            # Preserve the formatting of untouched features and keep the diff scoped.
            chunks = []
            decoder = json.JSONDecoder()
            start = old.index("[", old.index('"features"')) + 1
            old_chunks = {}
            cursor = start
            while True:
                while old[cursor].isspace() or old[cursor] == ',': cursor += 1
                if old[cursor] == ']': break
                item, end = decoder.raw_decode(old, cursor)
                old_chunks[item["id"]] = old[cursor:end]
                cursor = end
            for f in data["features"]:
                if f["id"] in old_chunks and f == original[f["id"]]:
                    chunks.append('    ' + old_chunks[f["id"]])
                else:
                    chunks.append('\n'.join('    '+s for s in json.dumps(f,ensure_ascii=False,indent=2).splitlines()))
            new = '{\n  "type": "FeatureCollection",\n  "features": [\n'+',\n'.join(chunks)+'\n  ]\n}\n'
        else:
            new = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        if new == old: continue
        if not target.exists():
            print(f"*** Add File: {path}")
            print('\n'.join('+'+s for s in new.splitlines()))
        else:
            print(f"*** Update File: {path}")
            diff = list(difflib.unified_diff(old.splitlines(),new.splitlines(),n=3))[2:]
            print('\n'.join('@'+'@' if line.startswith('@@') else line for line in diff))
    print("*** End Patch")
