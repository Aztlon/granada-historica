# ADR 0001: License original code under MIT and original data under CC BY 4.0

- Status: accepted for M0 owner review
- Date: 2026-09-20

## Context

Granada Histórica combines software, original geographic and historical data,
documentation, and citations to third-party scholarship. A single software
license does not describe all of those materials well. The project also needs
to remain easy to reuse while avoiding any suggestion that cited or consulted
third-party works have been relicensed.

## Decision

Original software code, scripts, configuration, and software tests use the MIT
License. Original project data and documentation use Creative Commons
Attribution 4.0 International (CC BY 4.0).

Third-party works are excluded from both grants unless an individual file
explicitly says otherwise. Their provenance and reuse terms must be recorded,
and material with unknown or incompatible terms must remain outside the public
repository.

## Consequences

- The application code can be reused with a short, familiar permissive license.
- The historical dataset and writing can be reused and adapted with attribution.
- Contributors must distinguish original work from third-party material.
- Source citation alone never establishes permission to reproduce an image,
  scan, map, dataset, or derived geometry.
- A future data release may adopt a database-specific license only through a
  new decision record and an explicit migration plan.
