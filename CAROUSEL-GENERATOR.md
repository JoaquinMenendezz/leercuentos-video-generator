# Generador de Carruseles — leercuentos.online

Imágenes estáticas para carruseles de Instagram a partir de texto.

---

## Qué es un carrusel de Instagram

Entre 2 y 10 imágenes que el usuario desliza. Cada imagen es independiente.
El primer slide es el "gancho" que aparece en el feed — el más importante.
Se exportan como imágenes PNG individuales, generalmente en un ZIP.

---

## Arquitectura propuesta

Extraer las funciones de dibujo compartidas en `canvasUtils.js`:

```
canvasUtils.js          ← drawBg, drawEdgeFade, applyTextStyle,
                           buildLinesSmart, trimToParagraphs,
                           BACKGROUNDS, FONTS, PRESETS
StoryVideoGenerator.jsx ← importa canvasUtils
CarouselGenerator.jsx   ← importa canvasUtils
App.jsx                 ← toggle "Video | Carrusel"
```

Todo lo visual (fondos, tipografías, colores, presets, imagen de fondo) se reutiliza sin duplicar código.

---

## Estructura de un carrusel generado

```
Slide 1  →  Portada: título + autor                (siempre, diseño especial)
Slide 2..N-1  →  Contenido: texto del cuento       (un párrafo por slide)
Slide N  →  Cierre: llamada a acción               (opcional)
```

---

## Features del generador de carruseles

### Contenido
- Texto del cuento con respeto a párrafos (mismo parser que el video)
- **Distribución automática por párrafo**: cada párrafo del texto → un slide de contenido
- **Distribución por N slides fijos**: divide el texto en partes iguales independientemente de párrafos
- Límite de palabras por slide (para no saturar una imagen)
- Texto extra al final (igual que en el video)
- Nombre del cuento, autor, llamada a acción

### Slides especiales
- **Slide de portada** (opcional): título + autor + leercuentos.online, diseño más destacado
- **Slide de cierre CTA** (opcional): llamada a acción en grande
- **Numeración de slide**: "3 / 7" en esquina o pie — muy común en carruseles

### Diseño (heredado del video)
- Los mismos 20 fondos, 8 tipografías, color picker, imagen de fondo, 5 presets
- Tamaño de letra configurable
- Espaciado entre líneas
- Sombra de texto
- Alineación: centrado (como el video) + izquierda (más natural para lectura en carrusel)

### Diseño específico de carrusel
- **Padding generoso**: ~15% de margen en los bordes (textos más "respirados" que en video)
- **Indicador de slide**: número de slide, configurable (off / centrado abajo / esquina)
- **Coherencia visual automática**: todos los slides usan el mismo fondo/fuente/color
- **Tamaño automático del texto**: si un slide tiene mucho texto, reduce la fuente para que entre (o lo divide en dos slides)

### Formatos de salida
- **Aspecto 1:1** (1080×1080) — el más común para carruseles
- **Aspecto 4:5** (1080×1350) — ocupa más espacio en el feed, mayor visibilidad
- **Resolución**: 1080px (estándar Instagram)
- **Exportar**: ZIP con todos los PNG via `jszip`
- **Descarga individual**: click en cualquier slide para descargar solo ese

### Preview
- **Grilla de slides**: todos los slides en miniatura (~150×150px o 150×188px) en fila horizontal
- **Slide activo**: clic en miniatura → se muestra en grande (350×350px o similar)
- **Preview en tiempo real**: al cambiar tipografía, fondo o texto, todos los slides se actualizan

### UX
- Mismo localStorage para persistir configuración de diseño
- Número de slides estimado visible antes de generar ("Tu texto genera ~7 slides")
- Aviso si algún slide queda con muy poco texto o muy lleno

---

## Lo que agregaría (futuro v2)

- **Edición por slide individual**: override de fondo o tipografía en un slide específico (ej: slide de portada con un fondo diferente al resto)
- **Reordenar slides**: drag & drop en la grilla de miniaturas
- **Templates de portada prediseñados**: 3-4 layouts distintos para el primer slide (título grande centrado / título lateral / con franja de color)
- **Modo "cita"**: un slide con una frase destacada del cuento en tipografía grande, como pull quote
- **Exportar como PDF**: útil para imprimir o compartir en otros formatos
- **Responsive / mobile**: misma consideración que el video — la generación de 10 imágenes 1080px en mobile puede ser pesada

---

## Diferencias clave vs el generador de video

| | Video | Carrusel |
|---|---|---|
| Output | 1 archivo WebM/MP4 | N archivos PNG en ZIP |
| Animación | Scroll o líneas | Sin animación |
| Tiempo | 15–90 seg | No aplica |
| Distribución | Maxwords en 1 video | 1 párrafo por slide |
| Aspecto | 9:16 o 1:1 | 1:1 o 4:5 |
| Uso | Reels, TikTok | Feed de Instagram |
| Dificultad de build | Ya hecho | ~6/10 |
