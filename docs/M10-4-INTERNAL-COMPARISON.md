# M10.4 — Experiencia interna de comparación

Estado: **implementada para revisión interna** (2026-10-01). No constituye la
publicación de c. 1550. M10.5 amplía la superficie, pero no sustituye sus seis
decisiones de revisión pendientes. Son funciones responsables que pueden
cubrirse dentro del proyecto, no dependencias institucionales.

## Alcance seguro

La experiencia carga exclusivamente las 39 entidades del candidato M10.5. No
presenta el resto del inventario como si su contenido estuviera revisado y no
deriva una imagen completa de la ciudad de 1550. La interfaz identifica de
forma permanente el entorno como «revisión
interna · no publicar» y aplica `noindex,nofollow`.

Los dos estados son cortes discretos:

- `c1492`: estado público existente;
- `c1550`: año representativo 1550 con ventana documental 1540–1560.

No existe deslizador, interpolación ni selección de años intermedios. La
interfaz explica expresamente que no es una cronología año por año.

## Activación y compilación

El modo público sigue siendo el valor predeterminado:

```sh
npm run dev
npm run build
```

El modo interno requiere el modo Vite `internal`, definido en
`.env.internal`, y genera una salida distinta e ignorada por Git:

```sh
npm run dev:internal
npm run build:internal
npm run test:e2e:internal
```

`build:internal` escribe en `dist-internal/`; el flujo público continúa
publicando únicamente `dist/`. La verificación de compilación falla si encuentra
marcadores narrativos privados de c. 1550 en la salida pública. En la compilación
interna, los datos forman un fragmento dinámico separado que solo contiene las
39 fichas del candidato.

## Contrato de URL

Las fichas comparables conservan el identificador estable y añaden un periodo
explícito:

```text
/?period=c1492&feature=religious.madraza-yusufiyya
/?period=c1550&feature=religious.madraza-yusufiyya
/?period=c1550&feature=royal.palace-charles-v
```

Cambiar de periodo mantiene `feature`. Atrás/adelante restaura idioma, periodo y
entidad. En la compilación pública, `period=c1550` se ignora y nunca provoca la
carga del paquete de investigación.

## Semántica de cambio

Cada ficha de c. 1550 muestra por separado:

1. cambio respecto al estado anterior (`retained`, `altered`, `converted`,
   `replaced`, `demolished`, `newly_built` o `unknown`);
2. estado físico (`planned`, `under_construction`, `partially_in_use`,
   `complete`, `ruinous`, `demolished` o `unknown`);
3. confianza espacial y temporal;
4. decisión cartográfica y resolución de solapamientos;
5. nota de evidencia y fuentes a nivel de afirmación;
6. estado de revisión y aprobaciones pendientes.

El renderizador cubre de forma exhaustiva todos los valores del contrato
temporal. El corte actual presenta de forma efectiva conversión, retención,
sustitución, alteración, nueva construcción, terminación y obra en curso. El
estado demolido queda preparado, pero no se simula con entidades fuera de las
39 fichas M10.5.

Hay dos ausencias visuales distintas:

- una construcción posterior a 1492 se describe como todavía no presente, sin
  cambiar automáticamente a c. 1550;
- una entidad de 1492 que no forma parte del candidato limitado de M10.5 se describe
  como «no representada», con la advertencia de que omisión no equivale a
  ausencia histórica.

Ambos mensajes mantienen el periodo seleccionado y ofrecen un cambio explícito.

## Arquitectura

- `vite.config.ts` convierte `VITE_ENABLE_INTERNAL_C1550` en una constante de
  compilación.
- `src/data/internalComparisonData.ts` es el único adaptador que importa el
  paquete privado y valida las 39 fichas.
- `src/data/internalComparisonTypes.ts` transforma cada estado temporal en la
  colección que consumen mapa y búsqueda, sin alterar el modelo público.
- `src/components/PeriodSelector.tsx` implementa dos radios nativos con teclado
  y semántica de grupo.
- `FeatureDrawer` presenta estado, fase, incertidumbre, citas y el cambio de
  periodo accesible desde el diálogo.
- `scripts/verify-m10-4-build.ts` comprueba aislamiento y presupuesto de la
  compilación.

Este adaptador es deliberadamente transitorio. M10.6 migrará los consumidores
al esquema temporal canónico cuando c. 1550 alcance paridad y supere sus puertas
de publicación.

## Verificación

M10.4 añade pruebas para:

- carga exacta de 39 entidades y validación bilingüe del esquema;
- activación solo mediante flag, `noindex` y aislamiento del paquete público;
- URLs durables, historial y conservación de la selección;
- estados convertidos, de nueva construcción y en obra;
- omisión del corte frente a ausencia histórica;
- fuentes, confianza y ambigüedad cartográfica;
- radios nativos mediante teclado y análisis automatizado de accesibilidad;
- interacción completa, accesibilidad y desbordamiento en Chromium de
  escritorio, más una comprobación de carga del selector y la envolvente móvil
  en WebKit;
- presupuesto JavaScript interno de 2,75 MB, límite de 375 KB para el fragmento
  privado y fragmento de datos independiente;
- regresión completa de la aplicación c. 1492 y del piloto M7.

## Límites y siguiente puerta

M10.4 no cambia `ready_for_specialist_review` a `reviewed`, no promociona ninguna
geometría a `verified` y no crea navegación pública hacia c. 1550. M10.5 solo
puede ampliar esta experiencia con contenido y geometrías que hayan superado
sus revisiones correspondientes.

Actualización M10.5 (2026-10-02): el mismo adaptador interno carga ahora las 39
geometrías candidatas y sus relaciones bilingües. La ampliación no altera el
aislamiento público ni implica aprobación; la puerta vigente se documenta en
[M10-5-CANDIDATE.md](M10-5-CANDIDATE.md).
