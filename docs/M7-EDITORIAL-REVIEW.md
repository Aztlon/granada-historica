# M7 editorial and translation review

## Review status

Repository editorial pass completed on 2026-10-01. This pass checks naming,
Spanish–English equivalence, citation presentation and internal consistency. It
does **not** satisfy the activation gate for independent historical/editorial
and native-English review.

## Naming decision

The fourth stop is a durable present-day place, not a period-specific entity:

- public title in both languages: **Palacio de la Madraza**;
- durable URL: `/place/madraza/`;
- canonical c. 1492 feature: `religious.madraza-yusufiyya`;
- Spanish historical name: **Madraza Yusufiyya**;
- English historical name: **Yusufiyya Madrasa**.

The place introduction explicitly identifies the Nasrid institution. Feature
drill-down retains its historical name, evidence, dates and canonical ID. This
allows future periods to reuse the place URL while presenting a different
historical state of the building.

## Six-record audit

| Feature | Repository review outcome | Independent review still needed |
| --- | --- | --- |
| `gate.bib-rambla` | Place wording now treats the *arenal de Bib-Rambla* as one historical setting and distinguishes the original site from the reconstructed arch. | Confirm the most idiomatic English rendering of *arenal* in context. |
| `route.zacatin-axis` | Removed an unsupported etymological gloss from the place introduction; Spanish and English now describe the evidenced commercial axis. | Confirm preferred capitalization and treatment of the historical toponym. |
| `commerce.alcaiceria` | Spanish and English consistently distinguish the historical precinct, the post-1843 fabric and the approximate mapped envelope. | Review commercial terminology and the rendering of *alojamientos*. |
| `religious.madraza-yusufiyya` | The modern place and historical institution are now explicitly separate; the English feature remains a complete translation of the c. 1492 record. | Check educational terminology and the institutional history after 1492. |
| `religious.medina-great-mosque` | Both languages distinguish the reference point at the Sagrario from an unevidenced mosque footprint. | Check the preferred English terms for *mezquita aljama* and the early cathedral use. |
| `walls.medina-lower` | Expanded the English `today` and evidence fields to restore the named anchors and reconstructed sections present in Spanish. | Specialist review of the long defensive sequence remains desirable. |

## Citation policy checked

- Source titles, authors, publishers, identifiers and quoted locators remain in
  their original language.
- English translations replace only explanatory `supports` text; they do not
  translate or rewrite bibliographic metadata or locators.
- Every pilot translation has exactly the same number and order of citation
  explanations as its canonical Spanish record.
- No English historical record is assembled field by field from Spanish. A
  missing complete translation triggers the clearly labelled Spanish fallback.
- All eleven institutional and scholarly URLs used by the six records'
  explanatory citations returned HTTP 200 on 2026-10-01. This is a link-health
  check, not a substitute for source interpretation or future link monitoring.

## Activation hand-off

An independent reviewer should record their name, date, scope and corrections
below before M7 becomes `active`.

| Review | Reviewer | Date | Outcome / corrections |
| --- | --- | --- | --- |
| Historical/editorial | — | — | Pending |
| Native English | — | — | Pending |
