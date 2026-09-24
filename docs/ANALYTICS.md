# Analítica web

Granada Histórica usa opcionalmente **Cloudflare Web Analytics**. La integración se
limita a `src/analytics/cloudflare.ts`, se activa solo en compilaciones que reciben
un token y no añade cookies, almacenamiento local, identificadores propios ni un
servidor de analítica del proyecto.

## Activación en GitHub Pages

1. Inicia sesión en Cloudflare y abre **Web Analytics**.
2. Selecciona **Add a site** y registra el hostname exacto de la web publicada:
   `aztlon.github.io` (sin protocolo ni `/granada-historica/`). No
   es necesario cambiar el DNS ni alojar la web en Cloudflare.
3. En **Manage site**, copia el valor `token` del snippet JavaScript. Es el valor
   que aparece en `data-cf-beacon='{"token":"..."}'`; no copies el snippet entero.
4. En GitHub, abre el repositorio y ve a **Settings → Secrets and variables →
   Actions → Variables → New repository variable**.
5. Crea una variable llamada `CLOUDFLARE_ANALYTICS_TOKEN` con el token como valor.
   Es una variable (no una credencial secreta), pero no debe inventarse ni
   reutilizarse desde otro hostname.
6. Vuelve a ejecutar **Deploy to GitHub Pages** o publica un commit en `main`.
   Los datos pueden tardar unos minutos en aparecer.

Para comprobarlo, abre la web publicada sin bloqueador de anuncios y busca en las
herramientas de desarrollo una carga de `beacon.min.js` y una petición a
`cloudflareinsights.com/cdn-cgi/rum`. Si el token no está configurado, no se carga
ningún script ni se envía ningún dato.

Para una compilación local puntual:

```powershell
$env:VITE_CLOUDFLARE_ANALYTICS_TOKEN = '<token-del-sitio>'
npm run build
```

## Datos disponibles y límites

El panel ofrece evolución temporal, visitas y páginas vistas, país aproximado,
referrer y ruta. “Visitas” no equivale a una cifra fiable de personas únicas, y
el producto no muestra marcas de tiempo de sesiones individuales. El beacon
reconoce cambios de ruta mediante la History API, por
lo que no necesita código adicional para una SPA. Esta aplicación actualmente
permanece en una sola ruta y expresa la selección del mapa con `?feature=...`;
Cloudflare omite deliberadamente las query strings, de modo que una selección de
elemento no se convierte en una página distinta en los informes.

Cloudflare Web Analytics no ofrece ubicación por ciudad en este producto. Tampoco
permite identificar a una persona concreta, confirmar que una visita procede de
un destinatario específico, ni atribuir de forma fiable una visita directa a un
correo ya enviado. El referrer puede indicar un proveedor webmail en algunos
casos, pero muchos clientes de correo lo eliminan. Un aumento de tráfico desde
España próximo al envío es solo evidencia agregada y circunstancial. Para una
campaña futura, enlaces etiquetados o redirecciones diferenciadas permitirían una
atribución mejor, aunque Cloudflare Web Analytics actualmente no conserva los
parámetros de consulta.

## Desactivación

Elimina la variable de GitHub y vuelve a desplegar. Para retirar también el código,
borra `src/analytics/cloudflare.ts`, su importación y llamada en `src/main.tsx`, y
las referencias de configuración y documentación.
