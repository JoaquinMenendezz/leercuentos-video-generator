# Generador de Videos — leercuentos.online

Videos verticales animados para Instagram Reels y TikTok a partir de texto.

---

## Lo que ya tiene

### Contenido
- Campo de texto principal del cuento (textarea)
- Límite de palabras configurable (50–1000), con indicador "X de Y palabras — se corta"
- **Vista previa del texto**: muestra el cuento completo con etiqueta "✂ corta acá" en la palabra exacta del corte, y el resto en gris
- Texto extra al final (sin límite de palabras, aparece después del contenido principal)
- Nombre del cuento y autor (ambos aparecen en la tarjeta de título)
- Respeta saltos de línea del texto original (cada párrafo = bloque separado)
- División en N partes: genera N archivos separados con el texto dividido en partes iguales

### Animación
- **Modo scroll**: texto sube desde abajo de la pantalla
- **Modo líneas**: bloques de 3 líneas que aparecen y desaparecen centrados
- Corte inteligente en puntuación (`.` `,` `;` `!` `?`) antes de cortar en cualquier palabra
- Velocidad de animación: slider 0.5× a 3×
- Fade in/out negro al inicio y al final del video (0.4 seg)

### Tarjetas
- **Tarjeta de título** (opcional, 2.5 seg): nombre del cuento + autor (itálica) + leercuentos.online — puede ir al inicio o al final
- **Tarjeta CTA** (opcional, 3 seg): texto de llamada a acción al final del video

### Diseño
- 8 tipografías: Georgia, Times New Roman, Arial, Verdana, Trebuchet, Palatino, Comic Sans, Courier New
- Tamaño de letra: slider 40–120px
- Espaciado entre líneas: slider 1.1× a 2.5×
- Color de texto: color picker
- Sombra de texto (negra, siempre activa, para legibilidad)
- 20 fondos: 15 gradientes + 5 sólidos
- Imagen de fondo propia (upload), con overlay oscuro automático
- 5 presets de estilo: Minimalista, Dramático, Infantil, Moderno, Elegante

### Formatos de salida
- **WebM** (VP9): funciona en todos los browsers, graba con `setInterval` a exactamente 30fps
- **MP4** (H.264, Chrome/Edge): via WebCodecs + mp4-muxer, corre con MessageChannel (funciona aunque cambies de pestaña)
- Relación de aspecto: **9:16** (Reels/TikTok) o **1:1** (posts de feed)
- Resolución: 1080×1920 (9:16) o 1080×1080 (1:1) a 30fps
- Bitrate: 8 Mbps
- Nombre de archivo con timestamp para no pisar archivos existentes

### UX
- Preview animado en loop (canvas 270×480 o 270×270 según aspecto)
- Barra de progreso con % durante generación
- Indicador "Finalizando archivo…" con barra verde pulsante durante el flush del MP4
- Aviso amarillo "no cambies de pestaña" durante grabación WebM
- Configuración persistida en `localStorage` (tipografía, colores, velocidad, fondos, etc.)
- Duración configurable: 15–90 seg

---

## Lo que agregaría

### Alta prioridad

- **Responsive / Android**: el UI está diseñado para desktop. Una columna en pantallas < 768px, inputs más grandes para touch, preview debajo del formulario. Sin esto no se puede usar en celular.
- **Opción de resolución**: Alta (1080p) para PC, Media (720×1280) para celular. La generación en mobile con 1080p puede ser lenta o crashear.
- **Velocidad de lectura sugerida**: mostrar junto a la duración un indicador de palabras por minuto estimadas (e.g. "~180 pal/min — cómodo") para ayudar a calibrar maxWords + duración sin tener que adivinar.

### Media prioridad

- **Más tipografías**: Google Fonts via `@import` en el canvas (actualmente solo fuentes del sistema). Agregar al menos Lora, Playfair Display, Merriweather — mucho más adecuadas para literatura.
- **Alineación del texto**: izquierda / centrado / derecha. Hoy solo hay centrado.
- **Posición vertical del texto en modo scroll**: opción "empieza en el centro" vs "empieza desde abajo" para textos cortos que no llenan la pantalla.
- **Guardar y cargar configuraciones con nombre**: más allá del único config de localStorage, poder guardar 3-5 perfiles ("Cuentos infantiles", "Terror", etc.) y cargarlos.
- **Más presets de estilo**: al menos 5 más, incluyendo uno con imagen de fondo predeterminada (textura de papel, madera, etc.).
- **Música de fondo** (Medium 5/10): upload de MP3/WAV, control de volumen, opción de loop. Solo para WebM (AudioContext + MediaStreamDestination). MP4 con audio es más complejo.

### Baja prioridad / futuro

- **Exportar MP4 desde mobile**: actualmente WebCodecs requiere Chrome/Edge desktop. Habría que detectar si está disponible y ocultar el botón en browsers no compatibles (ya hay detección, pero el UX podría ser más claro).
- **Transición entre partes**: cuando se generan N partes, cada una es un archivo independiente. Podría haber una opción de "título de parte" ("Parte 1 / 3") que aparezca en la tarjeta de título.
- **Ajuste automático de velocidad**: botón "calcular duración sugerida" que tome maxWords y calcule la duración óptima para un ritmo de lectura elegido (lento / normal / rápido).
- **Historial de configuraciones recientes**: los últimos 5 cuentos generados (nombre + config) para reutilizar rápido.
- **Exportar config como JSON / importar**: para compartir una configuración entre dispositivos o hacer backup.
