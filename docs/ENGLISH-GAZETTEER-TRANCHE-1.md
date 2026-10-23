# English gazetteer evidence — first tranche

## Base, dependency and scope

Base: `46d6b68d14e58a6e160dd717a75afe3f2bc385c8` (published optional-media
branch), itself based on translation commit
`377b2b1b58648458429338131ec1f33c645eafce`.
Local branch: `feat/english-gazetteer-tranche-1`.

Remote head inspection before work found those exact two published task heads
and `main` at `689750282272a242f67efce65cd963d6a53289f3`, with no other
advertised branches. The checkout was clean. No `AGENTS.md` or local
`.agents/skills` instructions were present. No published branch was amended.
The approved source review and `ENGLISH-COVERAGE-TRANCHE-1.md` were consulted.
This completes the selected-record gazetteer gap identified in that report;
it does not change the report's historical account of the previous delivery.

## Exact coverage

| Gazetteer ID | Feature ID |
| --- | --- |
| `gaz.royal.alhambra` | `royal.alhambra` |
| `gaz.royal.generalife` | `royal.generalife` |
| `gaz.gate.elvira` | `gate.elvira` |
| `gaz.gate.alhambra-arms` | `gate.alhambra-arms` |
| `gaz.gate.alhambra-justice` | `gate.alhambra-justice` |
| `gaz.commerce.corral-carbon` | `commerce.corral-carbon` |
| `gaz.civic.maristan` | `civic.maristan` |
| `gaz.water.banuelo` | `water.banuelo` |
| `gaz.urban.albaicin` | `urban.albaicin` |
| `gaz.urban.lower-medina` | `urban.lower-medina` |

English gazetteer evidence coverage increases from **0 to 10 of 70** entries
(10 of the 58 mapped public features). The other **60 entries remain unchanged**:
no English panel; their Spanish panel retains the original fields and any
existing defensive context. Twelve inventory-only entries still have no public
map feature. This is not a claim of full gazetteer or application English parity.
Public introduction coverage stays at 58/58; full-record coverage stays at 16/58.

## Translation and presentation contract

`data/translations/gazetteer-en.json` supplies exactly four prose fields for
each selected entry: name-attestation date note, attestation explanation,
survival explanation and general notes (40 translated fields total). It stores
no copied identifiers, source mappings, status codes, historical names, dates
or review approvals that could diverge from canonical data.

`GazetteerPanel` extracts the existing drawer section. For the selected ten,
both locales now expose the existing attested name, date qualification and
general notes alongside the original attestation/survival explanations.
This makes the Bañuelo dating caveat and the urban-boundary qualifications
visible without introducing historical claims. Spanish prose is read directly
from the unchanged canonical record. The remaining sixty retain the exact
previous Spanish field selection, headings and status labels.

English headings and attestation/survival status labels are localized. Status
codes, historical names, source arrays and their order are inherited unchanged.
The Generalife name variants, Bañuelo chronological debate, Albaicín's multiple
nuclei and lower-medina analytical boundary remain explicit. No selected entry
has defensive context; none is invented. Entries with defensive context cannot
use this tranche's English translation shape.

The loader requires a complete valid translation before rendering an English
panel. Missing, blank or incomplete entries return no English panel, matching
the earlier untranslated behavior. There is no field-by-field Spanish mixture.
The validator requires exactly the ten supported IDs and all four fields,
resolves each canonical entry/feature, and rejects unexpected defensive context.
Spanish always returns the original canonical object, even if English is absent.

## Verification

- `npm run lint`: passed.
- `npm run validate:data`: passed; 58 public/verified features, 70 gazetteer
  entries, 100 canonical sources. The new ten-entry translation contract is
  included in data validation.
- `npm test`: **25 files, 172 tests passed**. New tests exercise all ten complete
  contracts, bilingual rendering, unchanged historical names/codes/reference
  order, canonical deep equality and non-mutation, all sixty untranslated
  entries, incomplete translations and defensive-context rejection. Existing
  full-record citation-integrity tests also pass.
- `npm run build`: passed, including TypeScript, period compatibility, M7
  entrypoint checks and exclusion of private c.1550 content. The existing Vite
  large-chunk warning remains non-fatal.
- Browser tests: **4 passed**, two tests in each of desktop and iPhone 13
  viewport/touch emulation using preinstalled `/usr/bin/chromium`, version
  `154.0.8037.57`. Tests exercise every translated panel, Generalife language
  switching through the normal close/switch/search flow, source-list presence,
  and the untranslated Monaita behavior. No browser installation was attempted.
- Canonical preservation: all **40 existing data files** are byte-identical to
  the base; deep JSON equality also passes for all **38 JSON/GeoJSON files**.
  This includes the gazetteer, citations/source registry, prior translations,
  geometries, research records and pilot state.
- Gazetteer SHA-256:
  `571d33bdb8c9d6a8b89b09982fc77a5b894a16d26801988f4243edac065b055f`.
- `git diff --check`: passed.

The Library review bundle includes the incremental patch, exact base/head,
coverage manifest listing translated and untranslated IDs, a bilingual evidence
review matrix, browser override configuration and raw test receipts. The browser
configuration uses the existing executable only; mobile emulation is not WebKit
or physical-device acceptance.

## Remaining gates

Human historical/editorial and native-English acceptance are not claimed by
these translations or automated checks. WebKit, physical devices and manual
visual acceptance were not run for this tranche. The sixty remaining gazetteer
entries and 42 remaining full narratives are still untranslated. No image
acquisition, browser-download retry, pilot activation, c.1550 promotion, push,
PR, merge or deployment is included in this local implementation.
