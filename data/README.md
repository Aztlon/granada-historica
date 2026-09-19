# Data workspace

`geo/` contains the canonical public GeoJSON, split into points, lines, and
areas. `content/` is reserved for long-form feature content if keeping it inside
GeoJSON becomes cumbersome. `sources.json` is the normalized source registry.

Public web coordinates must use WGS84 (EPSG:4326). Every feature must follow the
schema and provenance rules in `docs/SPEC.md`; in particular, it needs a stable
ID, spatial and temporal confidence, a geometry method, evidence types,
publication status, and resolvable citations.

Do not add placeholder historical claims to production data. Seed features must
be clearly marked as demo material or pass historical review.

## Adding a feature

1. Add the feature to `points.geojson`, `lines.geojson`, or `areas.geojson`.
2. Give the top-level feature and its properties the same permanent ID.
3. Add every bibliographic or geometry source to `sources.json`.
4. Reference those source IDs from `citations` and `geometry_source_refs`.
5. Record separate locational and temporal confidence values.
6. Use `publication_status: "publishable"` only after historical review.
7. Run `npm run validate:data`.

The frontend imports these files directly. A valid public feature therefore
appears automatically, without editing application code.

## Validation

The validator checks the Zod schema, file/geometry agreement, coordinate ranges,
closed polygon rings, permanent and unique IDs, source resolution, required
public text, confidence values, evidence types, geometry provenance, and the
citation requirement for publishable entities. Validation runs locally, during
the production build, and in both GitHub Actions workflows.
