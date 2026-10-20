# Bab al-Ramla optional media and further reading

## Delivery boundary

Base: translation commit `377b2b1b58648458429338131ec1f33c645eafce`.
This separate incremental change implements the optional resource capability
requested in M8. It does not satisfy M8's reviewed-reconstruction exit gate.
The original translation commit, its report and Library patch are preserved.

One public example is attached to `gate.bib-rambla`, in both the durable
Bibarrambla place panel and its full historical drawer. It is **text-only**:
zero images and zero image bytes are included. The original-site/relocated-arch
distinction is supported by the existing canonical Patronato source. Historical
citations remain untouched and precede further reading in the full drawer.
There is no newly generated reconstruction or recorded human visual approval.

## Candidate source manifest

These are candidate assets, **not public assets**. File-level source records
were read successfully; local acquisition was denied. No bytes were obtained,
so checksums, final dimensions, visual identification, caption/alt verification
and responsive appearance are outstanding. No alternate download route,
proxy, hotlink or permission bypass was attempted after either denial.

### Historical depiction: engraving after David Roberts

- Source: [Granada Moorish Gate c1830.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Granada_Moorish_Gate_c1830.jpg).
- Source-record revision: [1082832849](https://commons.wikimedia.org/w/index.php?title=File:Granada_Moorish_Gate_c1830.jpg&oldid=1082832849).
- Authorship: J. B. Allen, after David Roberts; this is supported by the
  file's upload record, which distinguishes the engraving from the drawing.
  The catalog's structured artist heading is less specific; retain that
  qualification rather than silently promoting the uploader to artist.
- Represented date: **circa 1830**, as catalogued; approximate, not an exact
  depiction date and not 1492.
- Reproduction source named in the file record: Archiv “Deutschland und die Welt”.
- Rights: the file record identifies the work and faithful reproduction as
  public domain, with `PD-Art` / `PD-old-100-expired` and
  [Public Domain Mark 1.0](https://creativecommons.org/publicdomain/mark/1.0/).
  Public-domain status is not the repository's CC BY 4.0 license.
- Proposed credit: “J. B. Allen, after David Roberts, via Wikimedia Commons;
  source: Archiv ‘Deutschland und die Welt’. Public domain.”
- Candidate caption direction: later depiction of the gate before demolition;
  never describe it as a reviewed Nasrid reconstruction or an exact survey.
  Exact visible details and final bilingual alt text await inspection of bytes.
- Acquisition attempted: the 960 px thumbnail linked by the file record,
  `thumb.wikimedia.org`, returned **HTTP 403** to the Cloud download.
  Outcome: denied, no file downloaded.
- Remaining admission requirements: permitted acquisition, visual verification
  of the engraving's inscription and subject, final bilingual caption/alt,
  preserved provenance, local hash/byte count, and image-budget checks.

### Present-day photograph: relocated gate, 19 July 2016

- Source: [Bibrambla gate, Alhambra, Granada, 19 July 2016.JPG — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Bibrambla_gate,_Alhambra,_Granada,_19_July_2016.JPG).
- Source-record revision: [1086372502](https://commons.wikimedia.org/w/index.php?title=File:Bibrambla_gate,_Alhambra,_Granada,_19_July_2016.JPG&oldid=1086372502).
- Author and requested credit: **Kolforn (Wikimedia)**; declared own work.
- Represented/capture date: **19 July 2016**, explicitly given in the file
  record. “Present-day photograph” is the media category, not a claim that it
  was taken today.
- Rights: explicit [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)
  permission on this individual file. Any included derivative must keep the
  author credit, source/license links and change disclosure.
- Candidate caption direction: the reconstructed arch in the Alhambra woods,
  at a different location from the mapped original site. It must not identify
  all visible fabric as medieval or imply that the photograph shows 1492.
- Acquisition attempted: the file record's 500 px thumbnail at
  `upload.wikimedia.org` returned **HTTP 403** to the Cloud download.
  Outcome: denied, no file downloaded.
- Remaining admission requirements: permitted acquisition, visual confirmation,
  final bilingual caption/alt text, derivative/change disclosure, local hash,
  dimensions/byte count and image-budget checks.

### Interpretive reconstruction

No asset commissioned, generated, selected or approved. A future reconstruction
requires named accountable review plus component-level evidence/confidence:
secure, probable, approximate or artistic inference. Neither the engraving nor
the modern photograph can substitute for that review. No reconstructed image
or fictional license has been inserted as a placeholder.

The Patronato's [historical article](https://www.alhambra-patronato.es/la-puerta-de-bibarrambla2)
was also inspected. Its general “other images in the public domain” statement
is not treated as file-specific clearance for its archive drawings, restoration
plans or credited photographs. Those website images are not copied or hotlinked.

## Verified optional reading destinations

Each exact destination below was opened successfully. Links are selected per
locale; an absent locale link is omitted rather than guessed. These are
optional further reading, separate from the existing scholarly/institutional
citation sequence. No Wikipedia narrative or coordinates are imported.

| Provider | Spanish | English |
| --- | --- | --- |
| Patronato | [La Puerta de Bibarrambla](https://www.alhambra-patronato.es/la-puerta-de-bibarrambla2) | [Bibarrambla Gate](https://www.alhambra-patronato.es/en/edificios-lugares/puerta-de-bibarrambla) |
| Wikipedia | [Puerta de Bib-Rambla](https://es.wikipedia.org/wiki/Puerta_de_Bib-Rambla) | [Gate of Bibarrambla](https://en.wikipedia.org/wiki/Gate_of_Bibarrambla) |

Wikipedia's reconstruction-date wording differs from the canonical Patronato
account. This change preserves the existing historical record and does not
resolve the discrepancy by replacing its source with Wikipedia.

## Capability and safeguards

`data/place-resources.json` is a separate optional registry keyed by canonical
entity ID. Missing resources render nothing; text-only entries need no asset.
The bilingual context is explicitly tied to canonical source IDs. The shared
`PlaceResources` component is used in the place panel and public c1492 drawer;
it is not injected into the private c1550 narrative.

An admitted image must provide kind, source, author, represented date, verified
rights evidence, license/public-domain link, attribution, changes, caption,
alt text, location distinction, uncertainty and review status. Reconstructions
also require a named reviewer and nonempty component evidence. No schema flag
itself establishes historical truth or grants reuse permission.

The component exposes type/date, uncertainty and review information in visible
text, not color alone. Provenance and captions survive image-load errors;
links use native keyboard navigation. Images are lazy-loaded, asynchronously
decoded and self-hosted with explicit intrinsic dimensions. Raster paths only;
remote image URLs, traversal paths and SVGs are rejected. The limits are two
images, 200,000 bytes per image, 300,000 bytes per place and 1,600 pixels per
side. The data validator checks referenced sources/entities and actual local
file size/SHA-256. Responsive CSS contains images without cropping and wraps
long text/links. The example currently incurs **no image requests**.

Synthetic test metadata lives only in `src/test/placeResources.fixture.ts`;
no synthetic picture or fictional source/license is published by the app.

## Verification and remaining acceptance

- `npm run lint`: passed.
- `npm run validate:data`: passed; canonical counts remain 58 public/verified
  features, 70 gazetteer entries and 100 sources.
- `npm test`: 23 files / 144 tests passed, including schema rejection, optional
  locale links, text-only rendering, media-kind labels, keyboard links, image
  failure, persistent provenance and reconstruction component confidence.
- `npm run build`: passed, including TypeScript, period parity, M7 build checks
  and private c1550 exclusion. Existing Vite chunk-size warning remains.
- Targeted browser checks: **8 passed** using preinstalled
  `/usr/bin/chromium` (154.0.8037.57), with desktop and iPhone 13 viewport/touch
  emulation. They cover the new text-only card, Spanish/English reading links,
  drawer/source coexistence, no horizontal overflow, and translation routing.
  Chromium mobile emulation is not WebKit or an actual iPhone.
- Browser evidence initially exposed four failures in the previous tranche's
  tests: they attempted to click a header control behind a modal drawer. The
  incremental patch corrects those tests to dismiss the drawer, switch language,
  and reopen through search. No production translation code/data was changed.
- Text-only desktop/mobile screenshots were inspected locally for link wrapping
  and visible focus. The resource blocks had matching client/scroll widths
  (386 px desktop, 354 px mobile). Screenshots are internal check artifacts,
  not Library deliverables. Basemap rendering was not assessed.
- `git diff --check`: passed. Canonical Spanish data, translated introductions,
  all 16 English full records, pilot state, research data and original report
  are byte-identical to the translation commit.

No image visual acceptance or real-asset failure/performance acceptance is
claimed. No WebKit, physical-device, QR-field or historical-reconstruction
acceptance is claimed. Browser downloads remain prohibited and were not
retried. System Chromium, if used, is an already-installed executable.

No push, PR, merge, deployment, paid service, external outreach, pilot activation,
c1550 promotion, historical owner/date change or translation alteration is part
of this change.

### Reproducing the system-browser check

The ordinary Playwright config remains unchanged. A local override uses the
existing executable; it does not install browsers:

```js
import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:4173/granada-historica/' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], browserName: 'chromium',
      launchOptions: { executablePath: '/usr/bin/chromium' } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium',
      defaultBrowserType: 'chromium', launchOptions: { executablePath: '/usr/bin/chromium' } } },
  ],
})
```

The actual temporary override lives at
`/tmp/granada-system-chromium.config.mjs`, with absolute workspace imports and
test directory. Command used:

```sh
npm run test:e2e -- --config=/tmp/granada-system-chromium.config.mjs e2e/place-resources.spec.ts e2e/english-coverage.spec.ts
```
