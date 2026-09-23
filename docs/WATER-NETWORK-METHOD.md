# Islamic water-network reconstruction

The public water layer is a topological reconstruction for interpretation at
city scale. It is not a cadastral survey of medieval channel beds.

## Primary reconstruction source

The principal synthesis is Martín Martín et al., *El camino del agua desde sus
fuentes hasta la medina de la Alhambra y Granada en época islámica* (2025), DOI
10.17561/at.27.9097. Map 4 is used for the Zirid city and Bab al-Difaf; Map 5 is
used for the eleventh- to thirteenth-century urban network; Figures 3-6 are used
for the Nasrid Alhambra system.

The article supplies its city plans as raster figures without an embedded CRS
or survey control. They therefore cannot be treated as already georeferenced
GIS layers. The atlas registers their topology against independently reviewed
anchors:

- the DERA axes of the Darro and Genil;
- surviving gates and remains, including Fajalauza and the southern remain of
  Bab al-Difaf;
- the audited Alcazaba Qadima, Axares, Alhambra, and Generalife envelopes;
- modern street corridors used explicitly by the article, such as Santiago;
- the securely identified sites of the two major mosques.

The resulting geometry retains `approximate` confidence unless surviving
fabric or another independent plan supports a stronger classification.

## Required topology

The data validator enforces relationships that were lost in the first draft:

1. Acequia Gorda remains north of the Genil and does not cross its mapped axis.
2. Tarramonta is a distinct derivative and crosses the Genil.
3. Bab al-Difaf is represented as a line crossing the Darro, not merely as a
   displaced point on one bank.
4. Aynadamar is a branched network that reaches the Alcazaba Qadima.
5. Axares extends eastward and remains above the right bank of the Darro; its
   post-conquest name, acequia de San Juan, is recorded as an alias.
6. Romayla crosses the Darro into the lower Sabika side and crosses it again on
   its return toward the Mezquita Mayor.
7. The interior walls of the Alcazaba Qadima and Axares reuse the same audited
   envelopes as the corresponding urban polygons instead of creating a second,
   inexplicably displaced boundary.

## Limits

The article's maps combine several historical phases and are schematic at
street level. Their urban outlines are useful corroboration, but do not alone
justify replacing every existing quarter boundary. Any later boundary revision
must compare the relevant phase, archaeology, documentary evidence, and the
modern topographic anchors rather than tracing the raster uncritically.
