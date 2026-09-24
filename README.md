# Granada Histórica

**Español** | [English](README.en.md)

Granada Histórica es un atlas histórico interactivo que superpone sobre la
ciudad actual una reconstrucción documentada y consciente de la incertidumbre
de **Granada hacia 1492**. La primera versión se centra deliberadamente en los
últimos años de la Granada nazarí.

El mapa pretende explicar no solo qué pudo haber ocupado un lugar, sino también
con qué grado de certeza se conocen su ubicación y su fecha, qué pruebas
respaldan la reconstrucción, qué sucedió después de 1492 y qué existe allí en la
actualidad.

## Estado del proyecto

Se han completado los hitos **M0 — Especificación y configuración del
repositorio**, **M1 — Estructura funcional del mapa**, **M2 — Sistema de datos
históricos**, **M3 — Morfología histórica**, **M4 — Primer conjunto de datos
revisado**, **M5 — Búsqueda, comparación y acabado** y **M6 — Revisión pública
de la prueba de concepto**. La versión v0.1 está lista como prueba de concepto
pública. La aplicación representa
ahora datos GeoJSON históricos validados sobre un mapa interactivo de Granada,
distingue categorías y niveles de certeza espacial, admite búsqueda normalizada,
controles de comparación, filtrado y selección mediante URL, y muestra en la
ficha de cada elemento su contexto histórico, procedencia, testimonios del
nombre, estado de conservación y citas.

La siguiente etapa propuesta convierte este núcleo en infraestructura histórica
pública: enlaces duraderos y códigos QR desde lugares de la ciudad, localización
opcional procesada en el dispositivo, reconstrucciones visuales revisadas y una
prueba de realidad aumentada en un número reducido de emplazamientos. El mapa,
la explicación de la incertidumbre y las fuentes seguirán funcionando sin AR.
Consulte la [hoja de ruta](docs/ROADMAP.md) y la [especificación](docs/SPEC.md).

El conjunto de datos de trabajo contiene 58 elementos citados y publicables y
un nomenclátor histórico con 70 entradas. No se presupone que ninguno sea
espacialmente correcto: cada geometría debe superar la revisión registrada en
`data/geometry-audit.json` antes de mostrarse en el mapa público. Su morfología a
escala urbana incluye el Albaicín, la medina baja, la Alhambra y el Generalife;
los ríos Darro y Genil; las principales acequias, sistemas de murallas, puertas,
puentes y ejes de circulación; y una extensión urbana tardonazarí explícitamente
aproximada. Las etiquetas y los estilos de confianza están diseñados para
comunicar la forma de la ciudad antes de que el usuario abra un elemento
concreto.

La fase de corrección, la revisión M4 y la primera ampliación M6 han verificado
las 58 geometrías. La muralla de la medina baja se reconstruye a partir de una
secuencia documentada de calles actuales y referencias arqueológicas; el área de
la medina baja se deriva de ese recinto y de otros ejes revisados; y la extensión
urbana tardonazarí es la unión reproducible de los sectores verificados del
Albaicín, la medina baja y la Alhambra, en lugar de una envolvente dibujada a
mano. El primer conjunto de monumentos incorpora las dos mezquitas principales,
la Alcaicería, el Zacatín, el Corral del Carbón, el Maristán, El Bañuelo, la
Puerta de Guadix y la Puerta de los Tableros / Puente del Cadí, manteniendo los
restos conservados diferenciados de los puntos representativos y de las
reconstrucciones aproximadas.

Un segundo conjunto de estructura urbana añade seis barrios históricos
explícitamente aproximados: Alcazaba Qadima, Axares, Garnata al-Yahud, el barrio
de los Alfareros, Antequeruela y el barrio de la Loma. Sus etiquetas aparecen por
debajo de los sectores urbanos más amplios en la jerarquía informativa; se
conservan los nombres históricos cuando resultan útiles, mientras que las
descripciones en español y los hitos actuales hacen comprensible cada zona.

Una revisión posterior de los bordes urbanos oriental y meridional incorpora
al-Ramla, al-Bayyazin, la zona del cementerio Fajjarin/Assal y cuatro puertas
asociadas al recinto tardonazarí. También separa la muralla interior del
Mauror–Realejo de la muralla exterior, corrige Antequeruela y la relación entre
Alfareros y la Loma, y revisa el límite de la medina baja sin presentar como
exactos los tramos inciertos.

La primera ampliación M6 añade Aynadamar, Axares, Romayla, Cadí, Gorda, su ramal
del Realejo, Tarramonta, Arabuleila y la Acequia Real; el Puente del Carbón; los
ejes de circulación del Darro y de Molinos; y los recintos interiores de la
Alcazaba Qadima y Axares. El nomenclátor también conserva doce nombres
candidatos, controvertidos, descartados o no localizados sin inventar puntos en
el mapa para ellos. Una revisión posterior de la capa de aguas corrige Gorda,
Aynadamar, Axares/San Juan, Romayla, Bab al-Difaf y los trazados desplazados de
las murallas de la Alcazaba Qadima y Axares. Las murallas sucesivas indican ahora
si hacia 1492 eran recintos exteriores, interiores o palatinos.

La auditoría del 23 de septiembre de 2026 añade un registro afín reproducible
del plano fuente, corrige el abastecimiento de la Mezquita Mayor por Axares,
los cruces orientales del Genil y el Puente del Carbón, y reconstruye límites
compartidos entre los barrios. Las decisiones, discrepancias entre fuentes y
limitaciones se documentan en [la metodología](docs/WATER-NETWORK-METHOD.md).

Véase:

- [Especificación del producto](docs/SPEC.md)
- [Hoja de ruta de implementación](docs/ROADMAP.md)
- [Decisión sobre licencias](docs/decisions/0001-project-licensing.md)
- [Área de trabajo de datos](data/README.md)
- [Flujo de trabajo SIG](gis/README.md)

## Principios

- Priorizar la utilidad histórica frente a la cartografía decorativa.
- Mostrar la incertidumbre en lugar de ocultarla tras una geometría precisa.
- Mantener legible la Granada actual para facilitar la comparación.
- Incluir las pruebas y citas en la interfaz de cada elemento.
- Utilizar formatos abiertos y portables y una arquitectura de sitio estático.
- Publicar únicamente elementos históricos revisados.

## Tecnologías

- Vite, React y TypeScript
- MapLibre GL JS
- GeoJSON en WGS84 (EPSG:4326) como formato canónico de los datos públicos
- QGIS en ETRS89 / UTM huso 30N (EPSG:25830) para la edición SIG
- Validación de datos compatible con Zod y pruebas con Vitest
- Despliegue en GitHub Pages mediante GitHub Actions

La prueba de concepto no requiere servidor, sistema de cuentas, suscripción SIG
de pago ni ningún formato de datos canónico propietario.

## Desarrollo local

Requisitos: Node.js 24 y npm. QGIS LTR también es necesario para la edición
cartográfica, pero no para el desarrollo habitual de la interfaz.

```sh
npm install
npm run dev
```

De forma predeterminada, Vite sirve el proyecto en
`http://localhost:5173/granada-historica/`.

Antes de enviar cambios, ejecute las mismas comprobaciones que utiliza la
integración continua:

```sh
npm run lint
npm run validate:data
npm test
npm run build
```

Copie `.env.example` como `.env.local` para sustituir la URL predeterminada del
estilo de mapa base compatible con MapLibre. No incluya nunca secretos de
proveedores en el repositorio.

Para crear el entorno cartográfico local en EPSG:25830 o exportar las ediciones
revisadas de QGIS a los archivos GeoJSON públicos en EPSG:4326:

```powershell
npm run gis:bootstrap
npm run gis:export
```

Consulte [gis/README.md](gis/README.md) antes de volver a generar un entorno que
contenga cambios sin exportar.

## Despliegue

El flujo de despliegue valida el conjunto de datos históricos, compila la
aplicación y publica `dist/` con cada envío a `main`. La URL del proyecto es:

`https://aztlon.github.io/granada-historica/`

## Estructura del repositorio

```text
docs/                 Especificación del producto, hoja de ruta y decisiones
data/geo/             GeoJSON canónico público de puntos, líneas y áreas
data/content/         Contenido extenso opcional de los elementos
gis/                  Flujo de trabajo y archivos de proyecto de QGIS
src/                  Código fuente de la aplicación web (desde M1)
public/assets/         Recursos estáticos públicos y reutilizables
scripts/               Herramientas de datos y compilación
.github/workflows/     Flujos de integración continua y despliegue
```

No deben incorporarse al repositorio escaneos de investigación restringidos ni
material de terceros sin licencia.

## Hitos

La prueba de concepto avanza desde la estructura funcional del mapa (M1),
pasando por el sistema validado de datos históricos y la morfología urbana,
hasta alcanzar al menos 30 elementos revisados y una fase pública de evaluación
de usabilidad. Los criterios detallados y las tareas dimensionadas como
incidencias se encuentran en [docs/ROADMAP.md](docs/ROADMAP.md).

## Contribuciones

Antes de aportar material histórico, lea los requisitos de metodología y
procedencia en [docs/SPEC.md](docs/SPEC.md). Cada elemento público debe tener un
identificador estable, niveles explícitos de confianza espacial y temporal,
procedencia de la geometría, al menos una cita accesible, estado de revisión
`publishable` y una entrada `verified` en la auditoría de geometrías.

Añada la geometría canónica al archivo correspondiente de `data/geo/`, registre
cada fuente citada en `data/sources.json` y documente la comprobación en
`data/geometry-audit.json`. Un elemento aparece en el mapa solo cuando tanto su
contenido como su geometría han superado la revisión; `npm run validate:data`
informa de identificadores, geometrías, citas, rangos de coordenadas, cobertura
de auditoría y requisitos de publicación que sean incorrectos.

No incorpore imágenes de fuentes, conjuntos de datos copiados ni geometrías
calcadas a menos que se hayan comprobado y registrado sus condiciones de
reutilización.

## Licencia

El código original del programa se distribuye bajo la licencia MIT. Los datos y
la documentación originales se distribuyen bajo la licencia Creative Commons
Reconocimiento 4.0 Internacional (CC BY 4.0). El material de terceros queda
excluido y sujeto a sus respectivas condiciones. Consulte [LICENSE](LICENSE)
para obtener más información.
