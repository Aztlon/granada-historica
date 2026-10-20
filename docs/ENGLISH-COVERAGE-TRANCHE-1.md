# Public English coverage — first tranche

## Scope and baseline

This implements the first Granada Histórica assignment in the
[approved source review](https://chatgpt.com/space/page_e3d7a3ddd35481919fb96eeae186daf9).
The clean starting checkout and remote `main` both resolved to
`689750282272a242f67efce65cd963d6a53289f3`.
Remote head inspection returned only `main`; no pull-request head refs were
advertised. The authenticated GitHub PR-list request returned `Forbidden`, so
open-PR metadata and potential overlap could not be independently inspected.
There were no repository/ancestor `AGENTS.md` files or local `.agents/skills`
in this saved Cloud workspace.

Actual public data counts were checked against the canonical GeoJSON,
presentation registry, English registry and validation output, rather than
assuming the earlier audit was still current.

| Coverage | Before | After |
| --- | ---: | ---: |
| Public, publishable, geometry-verified features | 58 | 58 |
| English public short introductions | 0 / 58 | 58 / 58 |
| Complete English historical records | 6 / 58 | 16 / 58 |
| Full records using labelled Spanish fallback in English mode | 52 / 58 | 42 / 58 |
| Gazetteer entries | 70 | 70 |
| English gazetteer evidence panels | 0 | 0 |
| Registered sources | 100 | 100 |

## Selected full records

Each selected record was untranslated at baseline. Selection favours prominent
monuments and two urban sectors that help readers orient themselves in the
map, with substantive existing Spanish narratives and institutional,
archaeological or planning references. This is translation of the existing
record, not new historical research or verification of its source claims.

| Entity ID | Selection basis | Citation explanations translated |
| --- | --- | ---: |
| `royal.alhambra` | Principal palatine complex; Patronato history and urban structure | 2 |
| `royal.generalife` | Palatine estate and landscape; Generalife, fortified-city guide and Plan Director | 3 |
| `gate.elvira` | Major city entrance; municipal historical description | 1 |
| `gate.alhambra-arms` | Historic city–Alhambra connection; Patronato entrance description | 1 |
| `gate.alhambra-justice` | Prominent monumental entrance; Patronato gates and fortified-city guide | 2 |
| `commerce.corral-carbon` | Surviving commercial building; Patronato historical description | 1 |
| `civic.maristan` | Hospital and later mint; Patronato architectural and restoration record | 1 |
| `water.banuelo` | Surviving public bath; Patronato synthesis explicitly retains disputed dating | 1 |
| `urban.albaicin` | Orientation across successive enclosures; PEPRI, wall route and water-route evidence | 6 |
| `urban.lower-medina` | Religious/commercial centre and incorporated suburbs; planning and archaeological evidence | 7 |
| **Total added** | **10 complete records** | **25** |

The six pre-existing English records remain unchanged:
`gate.bib-rambla`, `route.zacatin-axis`, `commerce.alcaiceria`,
`religious.madraza-yusufiyya`, `religious.medina-great-mosque`, and
`walls.medina-lower`. Their separate short introductions now have English text,
which resolves the drawer's preference for the previously Spanish-only lede.

All 58 introductions are added in `general_description.en` using the existing
optional-English presentation schema. Stable canonical titles and names stay
as authored; a Spanish proper name is not treated as a missing introduction.
No new localization schema or drawer rendering path is needed.

## Preservation and fallback

- Spanish presentation fields, canonical names, source references and order
  are identical to the baseline after removing only the new English fields.
- Canonical GeoJSON, gazetteer, source registry, geometries, dates, confidence,
  publication status and all generated period projections are unchanged.
- New records translate all existing translation-schema fields, including
  period notes, aliases/search terms and citation explanations. Bibliographic
  metadata, original-language locators, citation identity and order remain
  canonical. The validator now checks citation-explanation counts for **every**
  translation, extending the previous six-record-only check.
- El Bañuelo retains both proposed centuries and its disputed chronology;
  the urban sectors retain the distinction between reconstructed historical
  envelopes and modern administrative boundaries. Monument footprints retain
  their phase and extent caveats.
- Missing full translations still return the entire canonical Spanish record
  and show the existing explicit fallback notice. Their short introductions
  can now be English independently. Missing optional English introductions
  still fall back to Spanish and set the presentation fallback flag.

## Remaining English-parity gap and review status

The gazetteer evidence panel remains Spanish-only and is still hidden in
English mode, including for these ten records. Name-attestation, survival and
applicable defensive-context explanations have **not** been translated in
this tranche. The 16 complete English historical records therefore do not
constitute full English parity for every part of the interface. The remaining
42 full narratives also remain untranslated.

This is a generated translation and repository consistency pass, not an
independent historical/editorial or native-English human sign-off. No reviewer,
owner, historical date or existing approval record has been changed. M7 stays
`preview`; c.1550 research remains private and unpromoted. No image/media,
slider, merge, push, pull request or public deployment is included.

## Verification

- `npm run lint`: passed.
- `npm run validate:data`: passed; 58 public/verified features, 58 c1492
  compatibility geometries, 70 stable entities/gazetteer entries, 100 sources.
- `npm test`: 21 files, 121 tests passed, including complete/fallback routing,
  all 58 English ledes, all 16 complete records, citation order and metadata,
  incomplete-record rejection and retained uncertainty.
- `npm run build`: passed, including `periods:check`, data validation,
  TypeScript, M7 entrypoint/QR checks and exclusion of private c.1550 narratives.
  Vite reports its existing large-chunk warning; it is not a build failure.
- Baseline JSON comparison: all Spanish presentation content and all six
  pre-existing English records unchanged. `git diff --check`: passed.
- App component checks cover English/Spanish switching, all six existing
  translated drawers and the labelled fallback with an English introduction.
- `npm run test:e2e -- e2e/english-coverage.spec.ts`: six configured
  Chromium-desktop/WebKit-mobile cases could not launch because browser
  executables were absent. Installing them in the workspace was denied by the
  download endpoint (`HTTP 403: Domain forbidden`). No browser assertions ran;
  desktop/mobile layout and real-browser switching remain unverified. Tests
  are committed for a browser-enabled environment. No physical-device checks
  or broader browser suite was run.
