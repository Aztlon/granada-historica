# ADR 0002: Adopt Granada c. 1550 as the second temporal state

- Status: accepted
- Date: 2026-10-01

## Context

Granada Histórica needs a second historically defensible city state before it
can become a genuinely time-aware atlas. The state must create a meaningful
comparison with Granada c. 1492 without skipping the process that transformed
the Nasrid city into an early modern Christian city.

Several dates were considered:

- c. 1501 captures forced conversion and the creation of the parish network,
  but remains too close to the 1492 morphology;
- 1526 provides a strong event centred on the visit of Charles V, although many
  of the imperial and ecclesiastical projects associated with it had only begun;
- c. 1550 shows mature institutional and spatial change while Granada still had
  a substantial Morisco population;
- c. 1575 or 1600 shows the city after the revolt and expulsion, but loses the
  transitional coexistence that best explains the change from 1492.

The selection is supported by the convergence of an interpretively useful
historical boundary and visible building phases. Research from the University
of Granada characterises the urban operation between 1492 and 1550 as the
introduction of a new spiritual and civic order. By 1550 the Royal Chapel was
complete, the Cathedral was under construction, and the Palace of Charles V
had risen to its second storey. The Morisco revolt of 1568 and subsequent
expulsion had not yet produced the later demographic rupture.

## Decision

The second temporal state is:

> **Granada, c. 1550 — La ciudad morisca y renacentista**

English public label:

> **Granada, c. 1550 — The Morisco and Renaissance city**

`1550` is the representative date for an evidence window of approximately
1540–1560. It is not a claim that every mapped condition can be dated to the
calendar year 1550. Each feature must retain its own dates, precision,
citations, temporal confidence, and construction or use phase.

The first c. 1550 release will prioritise four comparisons:

1. mosques converted into parishes or replaced by churches;
2. the Nasrid religious and commercial centre transformed by the Cathedral,
   Royal Chapel, and Christian civic institutions;
3. the Alhambra as both a preserved Nasrid royal site and an imperial building
   programme;
4. the changing population geography of the Morisco Albaicín, the increasingly
   Christian lower city, and the Realejo.

The state may include retained, converted, replaced, demolished, newly built,
and actively constructed features. Construction state must be explicit; an
unfinished building must never be rendered or described as its completed later
form. The initial controlled vocabulary should distinguish at least `planned`,
`under_construction`, `partially_in_use`, `complete`, `converted`, `demolished`,
and `unknown`, subject to validation during schema design.

Historical entities keep stable identifiers across periods. Period-specific
states belong to the entity and must not be represented by duplicating the
entity merely to obtain a different date, name, use, geometry, or description.
The current c. 1492-specific fields are therefore transitional. Before c. 1550
data is published, the schema must support repeatable period states with:

- a stable period identifier such as `c1492` or `c1550`;
- a representative year and an evidence window;
- period-specific presence and temporal confidence;
- period-specific name, function, description, geometry, and construction/use
  phase where these differ;
- citations that support each period-specific claim;
- an explicit relationship to the preceding state, such as retained,
  converted, replaced, demolished, or newly built.

A discrete two-state selector must precede any continuous timeline. A slider
must not imply year-by-year knowledge that the evidence cannot support.

## Initial research boundary

The c. 1550 layer is a city-state reconstruction, not a general history of
sixteenth-century Granada. Its first research inventory should concentrate on
features already mapped for c. 1492 and the most legible agents of change:

- the former major mosques and the parish network;
- Cathedral, Royal Chapel, Madraza/Cabildo, Lonja, and Chancillería precinct;
- Palace of Charles V and changed Alhambra access and use;
- San Jerónimo, Santa Cruz la Real, Hospital Real, and other major foundations;
- Bibarrambla, Plaza Nueva, principal street changes, gates, and walls;
- Albaicín, lower-city, and Realejo population and land-use patterns;
- water, commercial, and circulation systems where continuity or change can be
  supported rather than assumed.

The revolt of 1568, the expulsions, and the resulting reorganisation belong to
a later state, provisionally c. 1575 or c. 1600. They may be mentioned as later
history but must not be projected backwards into c. 1550.

## Consequences

- Research and implementation can use a fixed second target instead of an open
  "early sixteenth century" brief.
- The comparison tells a process story: 1492 presents the late Nasrid city;
  c. 1550 presents an altered but still Morisco and recognisably inherited city.
- Unfinished architecture and mixed reuse become first-class historical states.
- The data model and UI must be generalised before the second dataset is
  published; simply adding `present_c1550` and `context_1550` fields is not an
  acceptable long-term design.
- c. 1550 must pass the same source, geometry, uncertainty, review, and
  publication requirements as c. 1492.
- c. 1575 or c. 1600 remains the natural candidate for a later state centred on
  the post-Morisco demographic and urban rupture.

## References

- Andrea Montero Priego, "La transformación urbana en Granada del Medievo a la
  Modernidad," *Arqueología y Territorio* 14 (University of Granada):
  <https://www.ugr.es/~arqueologyterritorio/Artics14/Artic14_12.html>
- Patronato de la Alhambra y Generalife, "La historia del palacio":
  <https://www.alhambra-patronato.es/la-historia-del-palacio>
- Ayuntamiento de Granada, "Evolución del asentamiento" (PGOU):
  <https://www.granada.org/inet/wpgo.nsf/8c6283f8cc03dea2c1256e32003da6e9/3ea190e325405e80c1256e27007bb0ca!OpenDocument>
