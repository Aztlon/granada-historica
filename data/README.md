# Data workspace

`geo/` will contain the canonical public GeoJSON, split into points, lines, and
areas. `content/` is reserved for long-form feature content if keeping it inside
GeoJSON becomes cumbersome. `sources.json` will become the source registry in
M2.

Public web coordinates must use WGS84 (EPSG:4326). Every feature must follow the
schema and provenance rules in `docs/SPEC.md`; in particular, it needs a stable
ID, spatial and temporal confidence, a geometry method, evidence types,
publication status, and resolvable citations.

Do not add placeholder historical claims to production data. Seed features must
be clearly marked as demo material or pass historical review.
