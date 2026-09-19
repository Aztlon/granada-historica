# Granada Histórica — Product Specification & Implementation Plan

**Repository:** `Aztlon/granada-historica`  
**Working title:** Granada Histórica  
**Initial release:** *Granada, c. 1492*  
**Status:** Draft v0.1  
**Purpose of this document:** Define the product, historical methodology, technical architecture, data model, research workflow, and implementation sequence for the first usable historical web map of Granada.

---

## 1. Product summary

**Granada Histórica** is an interactive historical atlas that overlays reconstructed historical geography onto the modern city of Granada.

The first release focuses tightly on **Granada circa 1492**, at the end of Nasrid rule. A user should be able to open a modern map, see the extent and structure of late-Nasrid Granada, explore historical neighborhoods and major sites, compare them with the city today, and understand both **what historians think was there** and **how certain that reconstruction is**.

The core product idea is not simply “old things on a map.” It is:

> **A spatial historical reference that makes uncertainty, change over time, and evidence visible.**

The initial product should answer questions such as:

- How large was Granada around 1492?
- Where was the Nasrid medina relative to modern Centro?
- What occupied the site of the modern Cathedral?
- Where did the city walls and gates run?
- Which parts of the modern street network follow medieval routes?
- Where were the Alcaicería, major mosques, markets, baths, cisterns, cemeteries, palaces, and civic institutions?
- How did the Alhambra, Albaicín, lower medina, Generalife, and suburban areas relate spatially?
- Which locations are securely known and which are reconstructed or disputed?
- What happened to a site after 1492, and what occupies it now?

The long-term concept can expand into a time-aware atlas of Granada from the Zirid period through the present, but **v0.1 is not a general history of Granada. It is a focused proof of concept for c. 1492.**

---

## 2. Product principles

### 2.1 Historical usefulness over decorative mapping

The map must do more than place attractive markers. Each important feature should explain:

- what it was;
- what function it served;
- what is known about it around 1492;
- what happened to it afterward;
- what occupies or survives at the site today;
- how its location and date are known;
- which sources support the reconstruction.

A map marker with a photo and a one-line description is not sufficient.

### 2.2 Never imply more certainty than the evidence supports

Historical GIS can make guesses look authoritative because a line on a map appears exact.

Granada Histórica must actively resist this.

A precise-looking polygon should not be used when the evidence only supports a general area. A dashed line, approximate zone, or label-only representation is preferable to false precision.

Every feature must carry explicit locational and temporal confidence metadata.

### 2.3 “1492” means **circa 1492**, not a frozen photograph of 2 January 1492

The surviving evidence rarely supports day-level precision.

The public map should therefore be titled **“Granada, c. 1492.”**

Features may derive from evidence slightly before or after 1492 when scholarship reasonably supports their presence around the conquest. Those cases must be documented in the feature record.

### 2.4 Modern Granada remains legible

The point of the project is comparison.

The historical city should sit on top of a modern geographic reference so that a user can immediately understand statements such as:

- “this mosque stood beneath the Cathedral complex”;
- “this gate was approximately here”;
- “this modern road follows or cuts across the medieval fabric.”

### 2.5 Sources are part of the interface

Citations should not be hidden in a bibliography page only.

A user should be able to select a feature and see a compact **“How do we know this?”** section with supporting sources, page/figure references where available, and a short evidence note.

### 2.6 The software should remain cheap and portable

The proof of concept should require:

- no ArcGIS subscription;
- no backend server;
- no paid database;
- no user accounts;
- no proprietary GIS file format as the canonical dataset.

The project should be deployable as a static site.

---

## 3. Target users

### Primary

People physically exploring Granada who want to understand the historical city beneath the modern one.

Typical question:

> “I am standing next to the Cathedral. What was here in 1492?”

### Secondary

- visitors interested in Granada beyond a conventional tourist guide;
- students of Andalusi, Nasrid, medieval Spanish, or urban history;
- local residents;
- researchers or educators who want a readable spatial synthesis;
- historians who may use the map as a discovery interface, while still consulting the cited scholarship.

The project is **not** intended to replace archaeological publications or primary scholarship.

---

## 4. v0.1 product scope

### 4.1 Main map

The default screen is a modern map of central Granada with a historical overlay labeled:

**Granada, c. 1492**

Initial viewport should include approximately:

- Albaicín;
- Centro / lower medina;
- Alhambra;
- Generalife;
- Realejo / southern approaches;
- relevant portions of the Darro and Genil corridors.

### 4.2 Historical layer groups

The first dataset should support these broad groups:

1. **Urban structure**
   - inhabited/urbanized extent where defensible;
   - major historical sectors;
   - historical neighborhood labels;
   - major routes where sufficiently documented.

2. **Walls & gates**
   - defensive walls;
   - city gates;
   - connections to the Alhambra and other fortified sectors.

3. **Religion & learning**
   - major mosques;
   - oratories where useful;
   - madrasa;
   - other major institutions.

4. **Commerce & civic life**
   - markets;
   - Alcaicería;
   - funduqs/alhóndigas;
   - important civic or commercial buildings.

5. **Water & infrastructure**
   - Darro and Genil;
   - important acequias;
   - cisterns/aljibes;
   - baths where they materially explain urban structure.

6. **Royal & elite landscapes**
   - Alhambra;
   - Generalife;
   - other securely documented palatial or elite sites.

7. **Burial / extra-mural landscapes**
   - major cemeteries or related zones where evidence allows meaningful mapping.

The layer taxonomy may evolve, but the initial UI should avoid a huge list of tiny academic categories.

### 4.3 Historical labels

Persistent or zoom-dependent historical labels are a first-class feature.

The UGR map demonstrates the value of seeing names such as historical districts directly in geographic context. Granada Histórica should preserve that strength while attaching substantially richer information.

Where a district boundary is not securely known, the product should prefer:

- a label anchored to a representative location; or
- a deliberately approximate translucent zone;

rather than a crisp border that suggests a surveyed boundary.

### 4.4 Feature detail panel

Selecting a feature opens a detail panel.

Minimum fields visible to the user:

- **Historical name**
- **Modern/common name**, if relevant
- **Feature type**
- **What was here c. 1492?**
- **Historical context**
- **What happened after 1492?**
- **What is here today?**
- **Location certainty**
- **Date certainty**
- **How do we know this?**
- **Sources**

Longer entries may include images later, but text and evidence come first.

### 4.5 Filters

Initial filters:

- all;
- urban structure;
- walls & gates;
- religion & learning;
- commerce & civic;
- water;
- royal;
- burial/other.

Confidence filtering is optional for v0.1, but confidence must always be visible.

### 4.6 Historical overlay control

Provide:

- historical layer on/off;
- modern context on/off where technically practical;
- historical layer opacity control.

A full swipe-comparison tool is useful later but is not required for the first proof of concept.

### 4.7 Search

Client-side search should match:

- historical name;
- modern name;
- common aliases;
- nearby modern landmark terms.

Example: searching **“Cathedral”** should be able to surface the historical feature associated with the Cathedral site even when its historical name is different.

### 4.8 Shareable selection

Preferred for v0.1, required soon after:

A selected feature should be representable in the URL, for example:

`?feature=mezquita-mayor`

Map position may also be encoded later.

---

## 5. Explicit non-goals for v0.1

Do **not** build these yet:

- a full year slider;
- all historical periods of Granada;
- user accounts;
- crowdsourced editing;
- a mobile native app;
- turn-by-turn historical walking tours;
- augmented reality;
- a server-side spatial database;
- an academic publishing platform;
- a complete inventory of every known Nasrid structure;
- 3D reconstruction;
- automated AI-generated historical claims published without review;
- scraping and republishing another map’s dataset.

A successful v0.1 should feel narrow but trustworthy.

---

## 6. Historical methodology

This section is part of the product specification, not merely research notes. Historical uncertainty affects rendering and UI.

### 6.1 Target period

Public label:

> **Granada, c. 1492**

Interpretation:

A feature may appear in the 1492 layer when the available evidence supports its existence or relevance during the late 15th-century Nasrid city.

If the only evidence is significantly earlier or later, the feature must either:

- remain excluded;
- be explicitly marked as inferred/probable; or
- appear only in a future period layer.

### 6.2 Separate spatial certainty from temporal certainty

These are different questions:

- **Spatial:** How confidently do we know where it was?
- **Temporal:** How confidently do we know it existed in approximately this form around 1492?

A site may have a secure location but uncertain 1492 status, or vice versa.

Use non-numeric confidence states to avoid fake precision.

Recommended values:

**Locational confidence**
- `secure`
- `probable`
- `approximate`
- `disputed`

**Temporal confidence**
- `secure`
- `probable`
- `approximate`
- `disputed`

Definitions:

#### Secure
The location/date is supported by strong evidence such as surviving fabric, archaeological evidence, reliable contemporary/near-contemporary documentation, or strong scholarly agreement.

#### Probable
The evidence is substantial but requires reconstruction or interpretation.

#### Approximate
The general location or period is supported, but an exact footprint/alignment/date is not.

#### Disputed
Published interpretations materially disagree.

The UI should use more than color to express these distinctions. Dashed or dotted boundaries, line styles, labels, and text must carry meaning.

### 6.3 Evidence basis

Each feature can record one or more evidence types:

- `surviving_fabric`
- `archaeology`
- `documentary`
- `historical_cartography`
- `toponymy`
- `parcel_morphology`
- `scholarly_reconstruction`
- `later_description`
- `other`

This helps explain *why* a feature is on the map without collapsing evidence into a single score.

### 6.4 Conflicting reconstructions

Do not silently choose one reconstruction and present it as fact.

When meaningful disagreement exists:

- record the competing interpretations;
- cite each;
- choose a display strategy deliberately;
- mark the feature `disputed` when appropriate.

Possible display strategies:

- show one preferred reconstruction with a note explaining the basis;
- show alternate geometries behind a toggle;
- show a wider uncertainty zone;
- show only an approximate label until stronger evidence is available.

### 6.5 Historical names

Names require their own caution.

Each feature may have:

- display name;
- historically attested name;
- Arabic name/transliteration where securely attested;
- modern Spanish name;
- alternate spellings;
- name note.

Do not invent a medieval Arabic form merely because a modern Spanish toponym appears to derive from Arabic.

When a familiar modern district name is later than the period being mapped, the panel should say so.

### 6.6 Present-day associations

A field such as “what is here today?” is useful, but it must not imply footprint equivalence.

Example distinction:

- “The modern Cathedral complex occupies part of the historical site.”
- not “The mosque had exactly the same footprint as the Cathedral.”

### 6.7 Citations

Every public historical feature must have at least one cited source.

Important or contested claims should have claim-specific citations.

Where possible, citations include:

- author/editor;
- title;
- year;
- publisher/journal/institution;
- page or figure number;
- stable URL/identifier;
- note on what the source supports.

### 6.8 Research notes versus publishable claims

The repository may contain working hypotheses, but the production dataset should not expose unreviewed claims as established history.

Use a status field:

- `research`
- `reviewed`
- `publishable`

Only `publishable` features appear in production builds by default.

---

## 7. Data model

The data model should support future time filtering from the beginning even though v0.1 exposes only c. 1492.

### 7.1 Canonical geographic format

Use **GeoJSON** as the canonical public geometry format.

For clean QGIS editing, split by geometry type:

```text
data/geo/
  points.geojson
  lines.geojson
  areas.geojson
```

All three use the same property conventions.

Web output coordinates use **WGS84 / EPSG:4326**.

For QGIS working/editing, **ETRS89 / UTM zone 30N (EPSG:25830)** is preferred because it provides sensible metric measurements for Granada. Export web data to EPSG:4326.

### 7.2 Feature identifier

Every feature receives a permanent, human-readable ID.

Examples:

```text
religious.mezquita-mayor
gate.bib-rambla
commercial.alcaiceria
water.darro
district.albaicin
```

IDs should not change merely because display names change.

### 7.3 Proposed feature schema

Illustrative example:

```json
{
  "type": "Feature",
  "id": "religious.example",
  "properties": {
    "id": "religious.example",
    "name": "Example historical site",
    "historical_name": null,
    "modern_name": null,
    "aliases": [],
    "modern_search_terms": [],

    "category": "religion_learning",
    "subtype": "mosque",

    "period": {
      "from_year": null,
      "to_year": null,
      "from_precision": "unknown",
      "to_precision": "unknown",
      "note": ""
    },

    "present_c1492": "secure",

    "confidence": {
      "location": "secure",
      "time": "secure"
    },

    "evidence_basis": [
      "documentary",
      "archaeology"
    ],

    "summary": "",
    "context_1492": "",
    "after_1492": "",
    "today": "",
    "evidence_note": "",

    "geometry_method": "",
    "geometry_source_refs": [],

    "citations": [
      {
        "source_id": "source.example",
        "locator": "pp. 00–00",
        "supports": "Identification and location."
      }
    ],

    "publication_status": "research"
  },
  "geometry": {}
}
```

The final implementation can normalize large text fields into separate content files if the GeoJSON becomes cumbersome.

### 7.4 Source registry

Maintain a separate source registry:

```text
data/sources.json
```

Proposed source fields:

```json
{
  "id": "seco-lucena-1975",
  "author": "Luis Seco de Lucena Paredes",
  "title": "La Granada nazarí del siglo XV",
  "year": 1975,
  "publisher": "Patronato de la Alhambra",
  "type": "book",
  "url": "",
  "identifier": "",
  "reuse_status": "unknown",
  "notes": ""
}
```

A feature citation references the source ID plus page/figure/claim information.

### 7.5 Geometry provenance

Every hand-drawn geometry must record how it was produced.

Suggested `geometry_method` values:

- `surviving_footprint`
- `archaeological_plan`
- `traced_georeferenced_map`
- `reconstructed_from_multiple_sources`
- `approximate_area`
- `representative_point`
- `modern_reference_location`

This is critical. The map should know the difference between an excavated wall and a point dropped in the general neighborhood.

---

## 8. User experience

### 8.1 Desktop

Recommended layout:

- full map canvas;
- compact map controls at upper left;
- search at top;
- historical period badge;
- layer/filter control;
- feature details in a right-side drawer;
- opacity/comparison control near bottom.

The map remains visible when the drawer is open.

### 8.2 Mobile

- full-width map;
- compact floating controls;
- details open as a bottom sheet or nearly full-height panel;
- controls must remain usable with touch;
- no hover-only information.

### 8.3 Historical styling

Visual goals:

- historical data should clearly sit above the modern basemap;
- modern map remains readable but visually subordinate;
- water should be unmistakable;
- defensive lines should read differently from roads;
- approximate/disputed geometry must differ by pattern or line style, not merely color;
- historical district labels should be legible without implying exact borders.

A warm historical palette is appropriate, but semantic clarity matters more than decorative “parchment” styling.

### 8.4 Selection behavior

Selecting a feature should:

1. highlight it on the map;
2. open the detail panel;
3. preserve the selected feature until the user closes it or selects another;
4. optionally fit the viewport if the feature is off-screen;
5. expose citations and confidence without requiring another page.

### 8.5 “How do we know this?”

This is a signature interaction.

For each feature:

**How do we know this?**

> Location: Probable  
> Date c. 1492: Secure  
> Evidence: documentary sources + scholarly reconstruction  
> Geometry: traced/reconstructed from [source], adjusted against [reference]

Then list citations.

This turns uncertainty from a weakness into a product advantage.

---

## 9. Technical architecture

### 9.1 Frontend stack

Recommended:

- **Vite**
- **TypeScript**
- **React**
- **MapLibre GL JS**
- lightweight CSS / CSS modules
- **Zod** or equivalent for build-time/runtime dataset validation
- **Vitest** for unit tests

No global state library is required initially.

### 9.2 Why MapLibre

MapLibre GL JS is an open-source WebGL map library capable of rendering interactive vector and GeoJSON layers, custom styles, labels, polygons, lines, markers, and user interaction.

It does not require an ArcGIS subscription.

Documentation:  
https://maplibre.org/maplibre-gl-js/docs/

### 9.3 Basemap

The application should not hard-code itself to one commercial provider.

Use an environment/config value:

```text
VITE_BASEMAP_STYLE_URL=
```

For development and an early public proof of concept, use an appropriate MapLibre-compatible public/open basemap subject to its usage terms.

If the project grows, a paid tile provider can be substituted without rewriting the historical application layer.

### 9.4 No backend for v0.1

All data is static:

```text
browser
  ↓
static app bundle
  ↓
GeoJSON + JSON + optional Markdown
```

This is enough for hundreds or low thousands of features.

### 9.5 Hosting

Preferred initial deployment:

**GitHub Pages via GitHub Actions**

Advantages:

- zero application server;
- tied directly to the repository;
- preview/build workflow is straightforward;
- no account/database infrastructure.

Alternative later: Cloudflare Pages, Netlify, Vercel, or a custom static host.

### 9.6 URL state

Use query parameters rather than SPA path routing for initial shareability:

```text
/?feature=religious.mezquita-mayor
```

This avoids unnecessary static-host routing complications.

### 9.7 Data validation

A build should fail if:

- a feature ID is duplicated;
- a required field is missing;
- a citation references a nonexistent source;
- a geometry is structurally invalid;
- an unsupported confidence/category value is used;
- a publishable feature has no citations;
- a publishable feature has no evidence note;
- dates are internally impossible.

Validation should run locally and in CI.

### 9.8 Continuous integration

GitHub Actions should run on pull requests and main:

```text
npm install
npm run lint
npm run validate:data
npm test
npm run build
```

Deployment occurs only after a successful main build.

---

## 10. Proposed repository structure

```text
granada-historica/
├── README.md
├── SPEC.md
├── package.json
├── vite.config.ts
├── tsconfig.json
│
├── docs/
│   ├── HISTORICAL_METHODOLOGY.md
│   ├── DATA_MODEL.md
│   ├── SOURCES.md
│   └── decisions/
│
├── data/
│   ├── geo/
│   │   ├── points.geojson
│   │   ├── lines.geojson
│   │   └── areas.geojson
│   ├── sources.json
│   └── content/
│
├── gis/
│   ├── README.md
│   └── granada-historica.qgz
│
├── src/
│   ├── app/
│   ├── map/
│   ├── components/
│   ├── data/
│   ├── types/
│   └── styles/
│
├── public/
│   └── assets/
│
├── scripts/
│   ├── validate-data.ts
│   └── build-search-index.ts
│
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

The separate methodology/data-model documents can be split out from this specification once implementation begins. Until then, this file is the source of truth.

---

## 11. GIS workflow

### 11.1 Tooling

Use **QGIS**, not ArcGIS, for the proof of concept.

QGIS is open-source and includes a Georeferencer for aligning historical raster or vector material with known coordinates using Ground Control Points.

Documentation:  
https://documentation.qgis.org/3.44/en/docs/user_manual/managing_data_source/georeferencer.html

### 11.2 Georeferencing workflow

For a historical map or scholarly reconstruction that can legally be used for research/derivation:

1. record its bibliographic source and reuse status;
2. load the scan/reference into QGIS;
3. load modern reference geography;
4. identify stable control points;
5. place control points across the image, not only in one cluster;
6. choose an appropriate transformation based on the source’s distortion;
7. inspect residual error;
8. georeference the source;
9. digitize only the features justified by that source;
10. record the geometry method and source;
11. export web geometry to EPSG:4326.

Residual error is useful diagnostic information but does **not** by itself prove historical accuracy.

### 11.3 Control points

Potential control points may include securely identifiable surviving features or topographic anchors, depending on the particular source.

Do not force uncertain historical structures to act as control points merely to make a reconstruction line up.

### 11.4 Working coordinate system

QGIS project:

**EPSG:25830 — ETRS89 / UTM zone 30N**

Public GeoJSON:

**EPSG:4326 — WGS84**

### 11.5 QGIS is an editing/research tool, not the public database

The source of truth committed to Git should remain open, reviewable data.

Avoid making a proprietary or opaque binary geodatabase the only authoritative copy.

---

## 12. Research and content workflow

Every feature follows this pipeline:

```text
candidate
   ↓
source discovery
   ↓
claim extraction
   ↓
location/date assessment
   ↓
geometry creation
   ↓
historical write-up
   ↓
citation review
   ↓
publishable
```

### Step 1 — Candidate

Create a minimal research record:

- proposed name;
- category;
- why it matters;
- likely sources.

### Step 2 — Source discovery

Prefer:

1. archaeological/public heritage records;
2. scholarly books/articles;
3. institutional research projects;
4. historical documentary/cartographic sources;
5. responsible secondary synthesis.

The UGR interactive map is valuable for discovery and cross-checking but should not automatically be treated as a reusable data feed.

### Step 3 — Claim extraction

Record discrete claims:

- existence;
- function;
- date;
- location;
- extent;
- later transformation.

### Step 4 — Geometry assessment

Decide whether the evidence supports:

- exact/secure footprint;
- probable alignment;
- approximate area;
- representative point only.

### Step 5 — Write-up

Target concise but meaningful entries.

A typical important feature should eventually have roughly:

- 1–2 sentence summary;
- 1–3 short paragraphs of 1492 context;
- short post-1492 history;
- modern-site explanation;
- evidence note;
- citations.

### Step 6 — Review

Before `publication_status = publishable`, verify:

- the source actually supports the displayed claim;
- geometry confidence is defensible;
- temporal confidence is defensible;
- language does not overstate certainty;
- modern/historical names are not conflated;
- reuse of source imagery/data is permitted.

---

## 13. Initial research inventory

These are **starting points**, not a completed bibliography.

### University of Granada — Mapa de la Granada Andalusí

https://abierta.ugr.es/mapa_alhambra/

Useful for:

- discovery of known sites;
- category ideas;
- historical neighborhood labeling;
- cross-checking spatial relationships.

Do not scrape or republish its geometry/content unless the relevant reuse rights are confirmed.

### UGR MOOC — La Alhambra y la Granada Andalusí

https://abierta.ugr.es/

Useful for:

- university-produced historical/urban context;
- bibliographies;
- specialist contributors;
- feature discovery.

Individual course resources may have specific licenses; record them per source.

### Antonio Orihuela Uzal — *Granada, Between the Zīrids and the Nasrids*

School of Arabic Studies / CSIC.

Public PDF has circulated through the EEA/CSIC site and contains a valuable synthesis of Granada’s urban development and reconstructed geography.

Useful for:

- urban morphology;
- walls;
- districts;
- routes;
- relationship of Zirid and Nasrid city structures.

### Luis Seco de Lucena Paredes — *La Granada nazarí del siglo XV* (1975)

Patronato de la Alhambra.

A foundational source specifically focused on 15th-century Nasrid Granada.

Useful for:

- site identification;
- historical topography;
- toponymy;
- reconstruction questions.

Treat the work and any maps/plates as copyrighted unless verified otherwise. Citation does not imply permission to republish imagery.

Official publication record:  
https://www.juntadeandalucia.es/servicios/publicaciones/detalle/35401.html

### Patronato de la Alhambra y Generalife

Research and archival materials relating to the Alhambra, Generalife, historical cartography, and Granada.

Useful for:

- primary/archival map discovery;
- Alhambra/Generalife features;
- institutional research.

### Archivo Municipal de Granada — Cartografía Histórica

Municipal historical cartography and archival records.

Useful especially for later phases, where historical maps can be georeferenced directly and used to reconstruct change after the Nasrid period.

### Junta de Andalucía — heritage / archaeological records

Useful for:

- protected sites;
- archaeological descriptions;
- official geometry where available;
- modern heritage records linked to historical structures.

---

## 14. Copyright, licensing, and provenance

This project must distinguish between:

- **consulting a source**;
- **citing facts from a source**;
- **republishing an image**;
- **copying a dataset**;
- **tracing or deriving geometry from a published map**.

These are not automatically equivalent in terms of reuse permission.

Before committing a source image, scan, tile, or copied dataset:

1. identify the rights holder;
2. record the license or reuse terms;
3. determine whether repository/public-web reuse is permitted;
4. avoid committing restricted material when uncertain.

For copyrighted maps needed only for research, keep local working copies outside the repository when necessary and commit only defensible derived data plus citations, subject to appropriate rights review.

Create a `.gitignore` rule for local research scans if needed.

---

## 15. First dataset target

The first public map should contain **at least 30 historically substantive features** across multiple categories.

Quality matters more than count.

A good first dataset should include enough features to make these geographic relationships immediately understandable:

- Albaicín / older northern city;
- lower Nasrid medina;
- Alhambra;
- Generalife;
- major walls and gates;
- Darro and Genil;
- principal religious/civic/commercial sites;
- historical district labels;
- selected suburban/extra-mural areas.

Do not fill the map with minor points before the city’s overall morphology is understandable.

---

## 16. Implementation milestones

### M0 — Specification and repository setup

Deliverables:

- `SPEC.md`;
- README;
- license decision for project code/data;
- initial folder structure;
- issue list / milestone board if useful.

**Exit condition:** project scope and methodology are agreed.

### M1 — Working map shell

Deliverables:

- Vite + TypeScript + React;
- MapLibre map;
- modern basemap;
- Granada initial viewport;
- responsive layout;
- layer-control shell;
- feature drawer shell;
- GitHub Pages deployment.

Use clearly labeled mock/demo features only if real historical data has not yet been reviewed.

**Exit condition:** public URL loads an interactive Granada map.

### M2 — Historical data system

Deliverables:

- GeoJSON files;
- TypeScript types/schema;
- source registry;
- validation script;
- confidence rendering;
- category styling;
- feature selection;
- citations UI.

**Exit condition:** adding a valid GeoJSON feature automatically makes it explorable on the site.

### M3 — Historical morphology

Prioritize the city-scale structure:

- major urban sectors/labels;
- walls;
- gates;
- rivers;
- Alhambra/Generalife relationship;
- approximate late-Nasrid urban extent where defensible.

**Exit condition:** the user can visually understand the shape of Granada c. 1492 before clicking individual monuments.

### M4 — First 30+ reviewed features

Research and publish the first content set.

**Exit condition:** at least 30 publishable, cited features with meaningful detail panels.

### M5 — Search, compare, and polish

Deliverables:

- search;
- historical layer opacity;
- URL-selected features;
- improved mobile UI;
- legend;
- accessibility pass;
- map-label collision/zoom tuning;
- source formatting.

### M6 — Public POC review

Test against actual questions:

- “What was under the Cathedral?”
- “Was Centro already urban?”
- “Where did the walls run?”
- “What did Albaicín mean spatially?”
- “Where was the Darro?”
- “How confident is this reconstruction?”

Collect errors and missing context before adding another historical period.

---

## 17. v0.1 acceptance criteria

The proof of concept is successful when all of the following are true:

- [ ] A user can open a public URL without logging in.
- [ ] The map opens centered on Granada.
- [ ] The map clearly identifies itself as **Granada, c. 1492**.
- [ ] Modern geography remains available for comparison.
- [ ] Historical district/sector labels are visible.
- [ ] Walls/gates, major waterways, and important sites can be toggled or filtered.
- [ ] At least 30 historical features are available.
- [ ] Every public feature has at least one source.
- [ ] Every public feature exposes locational confidence.
- [ ] Every public feature exposes temporal confidence.
- [ ] Approximate/disputed geometry is visually distinguishable from secure geometry.
- [ ] Important features contain substantive historical text, not just a photo/caption.
- [ ] A user can understand what happened to a selected site after 1492.
- [ ] A user can understand what is at or near that location today.
- [ ] The dataset passes automated validation.
- [ ] The site works on desktop and mobile.
- [ ] No ArcGIS subscription or backend server is required.
- [ ] Restricted source imagery/data is not inadvertently republished.
- [ ] The project can be rebuilt and deployed entirely from the Git repository.

---

## 18. Testing

### Application tests

Test:

- feature selection;
- category filtering;
- confidence rendering;
- search normalization;
- URL-selected feature;
- detail drawer open/close behavior;
- responsive controls.

### Data tests

Automated checks:

- unique IDs;
- valid category values;
- valid confidence values;
- valid publication status;
- citation references resolve;
- publishable features have citations;
- coordinate ranges are valid;
- required user-facing text is present;
- feature names are non-empty.

### Manual historical QA

Software tests cannot validate history.

Before publication, manually review:

- whether a source supports the claim attributed to it;
- whether geometry is more precise than the evidence;
- whether a later name is being projected backward;
- whether a disputed interpretation is being presented as settled.

---

## 19. Performance targets

This is a compact city map, so v0.1 should remain lightweight.

Targets:

- avoid loading unnecessary high-resolution raster overlays on first load;
- keep historical vector data small enough to download as normal static GeoJSON;
- lazy-load long content/images if they become substantial;
- do not introduce a vector-tile pipeline until ordinary GeoJSON becomes an actual performance problem.

Do not prematurely optimize for millions of features.

---

## 20. Accessibility

Minimum expectations:

- all map controls keyboard reachable;
- visible focus states;
- detail content readable outside hover interactions;
- confidence is not represented through color alone;
- adequate contrast;
- controls large enough for touch;
- map icons have textual equivalents in the detail/filter UI.

Historical geography is inherently visual, but the explanatory content should remain usable with assistive technology.

---

## 21. Division of work

### AI / coding-assistant work

The assistant can take primary responsibility for:

- frontend architecture;
- application scaffolding;
- MapLibre integration;
- UI components;
- filters/search;
- data schemas;
- validators;
- tests;
- GitHub Actions;
- deployment configuration;
- bibliography structuring;
- candidate-source research;
- drafting feature summaries from sources;
- converting structured GIS exports into production GeoJSON;
- identifying contradictions and missing evidence;
- preparing candidate geometries for review where defensible.

### Robbie / project-owner work

The owner should primarily handle:

- product decisions;
- approval of disputed historical interpretations;
- deciding when a reconstruction is good enough to publish;
- occasional QGIS work that benefits from visual human judgment;
- careful placement of georeferencing control points;
- reviewing map feel/readability;
- optional on-the-ground verification in Granada;
- decisions about project licensing and publication.

The goal is **not** for the owner to manually write hundreds of records or spend weeks coding basic map UI.

### Shared work

Historical publication decisions should be collaborative.

An AI-generated feature draft is a research artifact until its source claims and geometry have been checked.

---

## 22. Risks

### Historical false precision

**Risk:** Interactive maps make speculative reconstructions look authoritative.

**Mitigation:** confidence fields, geometry-method provenance, dashed/approximate rendering, evidence notes.

### Scope creep

**Risk:** Immediately trying to map 1000 years of Granada.

**Mitigation:** no second period until the 1492 POC satisfies acceptance criteria.

### Copyright/reuse

**Risk:** A useful scholarly map is copied or traced without understanding reuse rights.

**Mitigation:** source registry includes reuse status; research files remain local where necessary; public assets require explicit review.

### Poor basemap dependency

**Risk:** free tile provider changes terms or becomes unreliable.

**Mitigation:** provider is configurable; historical layer architecture remains MapLibre-standard.

### Research debt

**Risk:** fast feature creation produces dozens of poorly sourced markers.

**Mitigation:** production build only exposes `publishable` features; citations required by validation.

### Geometry becomes difficult to maintain

**Risk:** edits are scattered across QGIS, JSON, and web code.

**Mitigation:** explicit canonical GeoJSON files, permanent IDs, geometry provenance, documented import/export workflow.

---

## 23. Future roadmap

Only after v0.1 works.

### v0.2 — Late medieval / early Christian transition

Add an early 16th-century state that demonstrates:

- mosque-to-church conversions;
- Cathedral construction;
- civic and ecclesiastical changes;
- changing population geography.

This is the most natural second period because it directly explains the transformation that users can still see today.

### v0.3 — Historical cartography comparison

Add georeferenced historical maps from periods where actual maps survive.

Possible features:

- raster opacity;
- swipe comparison;
- “source map” mode;
- map metadata.

### v0.4 — Timeline

Add time selection using the temporal fields already stored per feature.

The architecture should support something conceptually like:

```text
1000 ─── 1100 ─── 1200 ─── 1300 ─── 1400 ─── 1492 ─── 1550 ─── 1600 ...
```

Do not implement the slider until there are at least two historically defensible states.

### Later possibilities

- 1492 / 1600 / 1800 / 1900 / present presets;
- historical walking mode;
- “what was here?” location lookup;
- georeferenced historical map library;
- changes to the Darro and street network;
- Gran Vía transformation;
- demolished buildings;
- archaeological excavation layers;
- 3D terrain/building context;
- multilingual Spanish/English interface;
- downloadable GeoJSON;
- research API;
- educator mode.

---

## 24. First build order after this specification

The next work should happen in this order:

1. **Scaffold the frontend**
   - Vite
   - React
   - TypeScript
   - MapLibre

2. **Deploy an empty Granada map**
   - verify GitHub Pages pipeline before adding historical complexity.

3. **Implement the feature schema and validation**
   - IDs
   - categories
   - confidence
   - sources
   - publication status.

4. **Add 3–5 clearly reviewed seed features**
   - one point;
   - one line;
   - one area;
   - at least one approximate feature.

   This tests the entire visual language before mass digitization.

5. **Create the QGIS project**
   - EPSG:25830 working CRS;
   - modern reference layer;
   - output GeoJSON structure.

6. **Build the source inventory**
   - start with urban morphology and high-value late-Nasrid sources.

7. **Reconstruct city-scale morphology**
   - districts/labels;
   - walls/gates;
   - waterways;
   - broad urban extent.

8. **Then add individual sites.**

This ordering is intentional. If individual monuments are added first, the result risks becoming another marker map rather than a reconstruction of a historical city.

---

## 25. Product definition in one sentence

> **Granada Histórica lets a person stand in modern Granada and see a sourced, uncertainty-aware reconstruction of the city that occupied the same ground in the past.**

For v0.1, that past is **Granada circa 1492**.
