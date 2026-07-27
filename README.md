# Transición 2026 — Landing de cuenta regresiva

Página interactiva, responsive y funcional como PWA para la graduación de
**Transición 2026 · Gimnasio Moderno Montecatini** (Magangué - Bolívar).

## 📁 Estructura

```
index.html            → estructura de la página
style.css              → toda la apariencia visual (usa variables CSS)
script.js               → countdown, animaciones, música, compartir, PWA
config.json            → ⭐ EDITA AQUÍ fecha, textos, colores, imágenes, música
manifest.json          → configuración de instalación como app (PWA)
service-worker.js      → caché offline
assets/
  images/               → fondo (bg-full.jpg) y logo recortado del diseño
  audio/                → coloca aquí tu música de fondo como musica-fondo.mp3
  icons/                → íconos de la app (192px y 512px)
  fonts/                → (opcional) fuentes locales si no quieres usar Google Fonts
```

## ✏️ Cómo editar el contenido (sin tocar código)

Todo se controla desde **`config.json`**:

- `evento.fechaObjetivoISO` — fecha y hora exacta de la graduación
  (ya está en `2026-11-28T15:00:00-05:00`, zona horaria Bogotá).
- `evento.mensajeCelebracion` — texto que aparece cuando el reloj llega a cero.
- `colores.*` — cambia dorados, azules, brillos y sombras en un solo lugar.
- `animaciones.*` — multiplicadores de velocidad (1 = normal, 0.5 = más lento,
  2 = más rápido) para globos, cortinas, partículas y el pulso del escudo.
- `imagenes.fondo` — reemplaza el póster por otra imagen (o video, ver abajo)
  sin tocar `index.html`.
- `musica.archivo` — ruta al MP3 de fondo.
- `compartir.url` — coloca aquí el dominio final donde publiques la página,
  para que los botones de compartir y el código QR apunten correctamente.

## 🎵 Música

Agrega tu archivo de audio en `assets/audio/musica-fondo.mp3` (o cambia la ruta
en `config.json`). Por política de los navegadores, la música solo empieza a
sonar después de que el usuario toque la pantalla o haga clic (aparece un
aviso "Toca para activar la música").

## 🖼️ Cambiar el fondo por video o animación

El fondo actual es una imagen (`assets/images/bg-full.jpg`) mostrada dentro de
`<img id="bg-image">`. Para usar un video, reemplaza esa etiqueta en
`index.html` por un `<video autoplay muted loop playsinline>` apuntando a tu
archivo — el resto del diseño (globos, brillo, panel de cuenta regresiva) se
mantiene igual porque están posicionados de forma independiente y proporcional
al marco (`.poster-frame`).

## ⏱️ Reloj funcional

El conteo se calcula en tiempo real con JavaScript (no es una imagen) a partir
de la fecha en `config.json`, interpretada en la zona horaria de Bogotá.
Cuando llega a cero, se detiene automáticamente, oculta el panel numérico y
muestra una animación de celebración con confeti dorado.

## 📲 Instalar como aplicación (PWA)

La página incluye `manifest.json` y `service-worker.js`. En Chrome/Edge/Android
aparecerá un botón "Instalar"; en iPhone (Safari), el usuario debe usar
"Compartir → Agregar a pantalla de inicio".

## 🚀 Publicar

El proyecto es 100% estático — puedes subir la carpeta completa tal cual a:

- **GitHub Pages**: sube estos archivos a un repositorio y activa Pages sobre
  la rama principal.
- **Netlify / Vercel**: arrastra la carpeta o conéctala a un repositorio; no
  requiere build ni configuración adicional.

No hay dependencias de servidor, base de datos ni build step.

## 🔤 Fuentes usadas

- **Cinzel / Cinzel Decorative** — títulos y cifras del reloj (estilo clásico
  y elegante, similar al de la imagen original).
- **Alex Brush** — disponible para textos caligráficos si reemplazas el fondo
  por una versión editable con capas de texto HTML.

Cargadas desde Google Fonts vía CDN (`index.html`). Si prefieres alojarlas
localmente, colócalas en `assets/fonts/` y actualiza el `<link>` correspondiente.

## ✅ Compatibilidad

Probada visualmente para funcionar en Safari, Chrome, Firefox, Edge, Samsung
Internet y Opera, en iPhone, Android, iPad, tablets, PC, Mac y smart TVs
(navegador basado en Chromium/WebKit).
