import React, { useState, useRef, useEffect } from 'react';

const TITLE_CARD_SECS = 2.5;
const CTA_CARD_SECS   = 3.0;
const FADE_SECS       = 0.4;

const FONTS = [
  { label: 'Georgia (elegante)',             value: 'Georgia, serif' },
  { label: 'Times New Roman (clásica)',      value: '"Times New Roman", serif' },
  { label: 'Arial (moderna)',                value: 'Arial, sans-serif' },
  { label: 'Verdana (clara)',                value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS (digital)',         value: '"Trebuchet MS", sans-serif' },
  { label: 'Palatino (literaria)',           value: '"Palatino Linotype", Palatino, serif' },
  { label: 'Comic Sans (infantil)',          value: '"Comic Sans MS", cursive' },
  { label: 'Courier New (máquina)',          value: '"Courier New", monospace' },
];

const BACKGROUNDS = {
  'Púrpura Rosa':    'linear-gradient(135deg, #667eea, #764ba2)',
  'Rosa Fuerte':     'linear-gradient(135deg, #f093fb, #f5576c)',
  'Azul Agua':       'linear-gradient(135deg, #4facfe, #00f2fe)',
  'Verde Menta':     'linear-gradient(135deg, #43e97b, #38f9d7)',
  'Atardecer':       'linear-gradient(135deg, #fa709a, #fee140)',
  'Naranja Fuego':   'linear-gradient(135deg, #f7971e, #ffd200)',
  'Cielo Profundo':  'linear-gradient(135deg, #0c3483, #a2b6df)',
  'Índigo Violeta':  'linear-gradient(135deg, #4776e6, #8e54e9)',
  'Bosque Otoñal':   'linear-gradient(135deg, #5c3d11, #d4a853)',
  'Coral Suave':     'linear-gradient(135deg, #ff9a9e, #fecfef)',
  'Aurora Boreal':   'linear-gradient(135deg, #00b4db, #0083b0)',
  'Lima Fresca':     'linear-gradient(135deg, #96fbc4, #f9f586)',
  'Océano':          'linear-gradient(135deg, #1a6b8a, #2ebcb3)',
  'Magenta Digital': 'linear-gradient(135deg, #c471ed, #12c2e9)',
  'Noche Cálida':    'linear-gradient(135deg, #c79081, #dfa579)',
  'Negro Puro':      '#1a1a1a',
  'Azul Oscuro':     '#1e3a5f',
  'Verde Bosque':    '#0d4d27',
  'Vino Tinto':      '#4a0e1c',
  'Gris Pizarra':    '#2d3748',
};

const PRESETS = [
  {
    label: 'Minimalista',
    fondo: '#1a1a1a', colorTexto: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: 64, lineSpacing: 1.5,
  },
  {
    label: 'Dramático',
    fondo: '#4a0e1c', colorTexto: '#f8e4b0',
    fontFamily: '"Times New Roman", serif', fontSize: 70, lineSpacing: 1.6,
  },
  {
    label: 'Infantil',
    fondo: 'linear-gradient(135deg, #43e97b, #38f9d7)', colorTexto: '#1a1a1a',
    fontFamily: '"Comic Sans MS", cursive', fontSize: 72, lineSpacing: 1.7,
  },
  {
    label: 'Moderno',
    fondo: 'linear-gradient(135deg, #4776e6, #8e54e9)', colorTexto: '#ffffff',
    fontFamily: 'Arial, sans-serif', fontSize: 62, lineSpacing: 1.4,
  },
  {
    label: 'Elegante',
    fondo: 'linear-gradient(135deg, #c79081, #dfa579)', colorTexto: '#1e1e1e',
    fontFamily: '"Palatino Linotype", Palatino, serif', fontSize: 68, lineSpacing: 1.6,
  },
];

const STORAGE_KEY = 'lcv_config';

function loadConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveConfig(cfg) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────

export default function StoryVideoGenerator() {
  const saved = loadConfig();

  const [cuento, setCuento]               = useState('');
  const [nombreCuento, setNombreCuento]   = useState('Cuento sin título');
  const [autor, setAutor]                 = useState(saved.autor ?? '');
  const [llamadaAccion, setLlamadaAccion] = useState(saved.llamadaAccion ?? 'Leé el cuento completo en leercuentos.online');
  const [maxWords, setMaxWords]           = useState(saved.maxWords ?? 250);
  const [duracion, setDuracion]           = useState(saved.duracion ?? 30);
  const [aspectRatio, setAspectRatio]     = useState(saved.aspectRatio ?? '9:16');

  const [fondo, setFondo]                 = useState(saved.fondo ?? 'linear-gradient(135deg, #667eea, #764ba2)');
  const [imagenFondoUrl, setImagenFondoUrl] = useState(null);
  const [imagenCargada, setImagenCargada]   = useState(false);
  const [colorTexto, setColorTexto]       = useState(saved.colorTexto ?? '#ffffff');
  const [fontSize, setFontSize]           = useState(saved.fontSize ?? 68);
  const [fontFamily, setFontFamily]       = useState(saved.fontFamily ?? 'Georgia, serif');
  const [lineSpacing, setLineSpacing]     = useState(saved.lineSpacing ?? 1.45);

  const [modoAnim, setModoAnim]           = useState(saved.modoAnim ?? 'scroll');
  const [velocidad, setVelocidad]         = useState(saved.velocidad ?? 1);
  const [tarjeta, setTarjeta]             = useState(saved.tarjeta ?? true);
  const [tarjetaPos, setTarjetaPos]       = useState(saved.tarjetaPos ?? 'inicio');

  const [partes, setPartes]               = useState(1);
  const [generando, setGenerando]         = useState(false);
  const [formatoActual, setFormatoActual] = useState('');
  const [progreso, setProgreso]           = useState(0);   // 0-100
  const [finalizando, setFinalizando]     = useState(false);
  const [preview, setPreview]             = useState(false);

  const previewRef = useRef(null);
  const animRef    = useRef(null);
  const bgImgRef   = useRef(null);

  // Persistir configuración (excluye texto del cuento e imagen)
  useEffect(() => {
    saveConfig({ llamadaAccion, autor, maxWords, duracion, aspectRatio,
      fondo, colorTexto, fontSize, fontFamily, lineSpacing,
      modoAnim, velocidad, tarjeta, tarjetaPos });
  }, [llamadaAccion, autor, maxWords, duracion, aspectRatio, fondo, colorTexto,
      fontSize, fontFamily, lineSpacing, modoAnim, velocidad, tarjeta, tarjetaPos]);

  // ── Dimensiones según aspecto ─────────────────────────────────────
  const dims = aspectRatio === '1:1'
    ? { W: 1080, H: 1080 }
    : { W: 1080, H: 1920 };

  // ── Text helpers ──────────────────────────────────────────────────

  function trimToParagraphs(texto, max) {
    const paras = texto.trim().split(/\n+/).filter(p => p.trim());
    let count = 0;
    const result = [];
    for (const p of paras) {
      const words = p.trim().split(/\s+/).filter(Boolean);
      if (count + words.length <= max) {
        result.push(words);
        count += words.length;
      } else {
        const rem = max - count;
        if (rem > 0) {
          const partial = words.slice(0, rem);
          partial[partial.length - 1] += '…';
          result.push(partial);
        }
        break;
      }
    }
    return result.length ? result : [[]];
  }

  function splitIntoSegments(texto, n) {
    const paras = texto.trim().split(/\n+/).filter(p => p.trim());
    if (n <= 1 || paras.length === 0) return [texto];
    const size  = Math.ceil(paras.length / n);
    const segs  = [];
    for (let i = 0; i < n; i++) {
      const chunk = paras.slice(i * size, (i + 1) * size);
      if (chunk.length) segs.push(chunk.join('\n'));
    }
    return segs;
  }

  function buildLines(ctx, words, maxW) {
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function buildLinesSmart(ctx, words, maxW) {
    const lines = [];
    let start = 0;
    while (start < words.length) {
      let end = start, line = '';
      while (end < words.length) {
        const test = line ? `${line} ${words[end]}` : words[end];
        if (ctx.measureText(test).width > maxW && end > start) break;
        line = test; end++;
      }
      if (end < words.length) {
        const win = Math.max(1, Math.floor((end - start) * 0.4));
        for (let i = end - 1; i >= Math.max(start, end - win); i--) {
          if (/[.!?,:;]$/.test(words[i])) { end = i + 1; line = words.slice(start, end).join(' '); break; }
        }
      }
      if (line) lines.push(line);
      start = end;
    }
    return lines;
  }

  // ── Canvas drawing ────────────────────────────────────────────────

  function drawBg(ctx, W, H) {
    if (bgImgRef.current) {
      ctx.drawImage(bgImgRef.current, 0, 0, W, H);
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.fillRect(0, 0, W, H);
    } else if (fondo.startsWith('linear-gradient')) {
      const colors = fondo.match(/#[0-9a-f]{6}/gi) || ['#667eea', '#764ba2'];
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = fondo; ctx.fillRect(0, 0, W, H);
    }
  }

  function drawEdgeFade(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0,   'rgba(0,0,0,0.45)');
    g.addColorStop(0.1, 'rgba(0,0,0,0)');
    g.addColorStop(0.9, 'rgba(0,0,0,0)');
    g.addColorStop(1,   'rgba(0,0,0,0.45)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function applyTextStyle(ctx, size) {
    ctx.fillStyle     = colorTexto;
    ctx.font          = `bold ${size}px ${fontFamily}`;
    ctx.textAlign     = 'center';
    ctx.textBaseline  = 'middle';
    ctx.shadowColor   = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur    = 14;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  function clearShadow(ctx) {
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  }

  function fadeAlpha(p) {
    if (p < 0.15) return p / 0.15;
    if (p > 0.85) return (1 - p) / 0.15;
    return 1;
  }

  // Overlay negro para fade in/out global del video
  function drawVideoFade(ctx, elapsed, totalDur, W, H) {
    let alpha = 0;
    if (elapsed < FADE_SECS)                  alpha = 1 - elapsed / FADE_SECS;
    else if (elapsed > totalDur - FADE_SECS)  alpha = (elapsed - (totalDur - FADE_SECS)) / FADE_SECS;
    if (alpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ── Title card ────────────────────────────────────────────────────

  function drawTitleCard(ctx, progress, W, H, label) {
    drawBg(ctx, W, H);
    drawEdgeFade(ctx, W, H);
    const titleSize = Math.min(fontSize + 24, 120);
    applyTextStyle(ctx, titleSize);
    ctx.globalAlpha = fadeAlpha(progress);

    const words = (label || nombreCuento).split(/\s+/);
    const lines = buildLines(ctx, words, W * 0.78);
    const lh    = titleSize * 1.4;
    const block = lines.length * lh;

    // Centrar verticalmente considerando autor y sitio debajo
    const hasAutor  = autor.trim().length > 0;
    const extraRows = hasAutor ? 2 : 1; // autor + sitio, o solo sitio
    const totalBlock = block + lh * extraRows;
    const y0 = H / 2 - totalBlock / 2;

    lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lh + lh / 2));

    clearShadow(ctx);
    let nextY = y0 + block + lh * 0.3;

    if (hasAutor) {
      ctx.font      = `italic ${Math.round(fontSize * 0.58)}px ${fontFamily}`;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.fillText(autor, W / 2, nextY + lh * 0.5);
      nextY += lh * 0.9;
    }

    ctx.font      = `${Math.round(fontSize * 0.48)}px ${fontFamily}`;
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText('leercuentos.online', W / 2, nextY + lh * 0.4);

    ctx.globalAlpha = 1;
    clearShadow(ctx);
  }

  // ── CTA card (siempre al final) ───────────────────────────────────

  function drawCTACard(ctx, progress, W, H) {
    drawBg(ctx, W, H);
    drawEdgeFade(ctx, W, H);
    ctx.globalAlpha = fadeAlpha(progress);

    const ctaSize = Math.round(fontSize * 0.82);
    applyTextStyle(ctx, ctaSize);
    const words = llamadaAccion.trim().split(/\s+/).filter(Boolean);
    const lines = buildLines(ctx, words, W * 0.78);
    const lh    = ctaSize * 1.5;
    const block = lines.length * lh;
    const y0    = H / 2 - block / 2;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lh + lh / 2));

    ctx.globalAlpha = 1;
    clearShadow(ctx);
  }

  // ── Content frame ─────────────────────────────────────────────────

  function drawContent(ctx, t, dur, W, H, textoSeg) {
    drawBg(ctx, W, H);
    applyTextStyle(ctx, fontSize);
    const paras   = trimToParagraphs(textoSeg || cuento, maxWords);
    const maxW    = W * 0.83;
    const lh      = fontSize * lineSpacing;
    const paraGap = lh * 0.7;

    if (modoAnim === 'scroll') {
      const items = [];
      paras.forEach((words, pi) => {
        buildLinesSmart(ctx, words, maxW).forEach(l => items.push({ text: l }));
        if (pi < paras.length - 1) items.push({ isGap: true });
      });
      const totalH = items.reduce((s, it) => s + (it.isGap ? paraGap : lh), 0);
      const dist   = totalH + H;
      let y        = H - (t / dur) * dist;
      for (const it of items) {
        if (it.isGap) { y += paraGap; continue; }
        if (y > -lh && y < H + lh) ctx.fillText(it.text, W / 2, y + lh / 2);
        y += lh;
      }
    } else {
      const pages = []; let page = [];
      for (const words of paras) {
        for (const line of buildLinesSmart(ctx, words, maxW)) {
          page.push(line);
          if (page.length >= 3) { pages.push(page); page = []; }
        }
        if (page.length > 0) { pages.push(page); page = []; }
      }
      if (!pages.length) return;
      const pd = dur / pages.length;
      const pi = Math.min(Math.floor(t / pd), pages.length - 1);
      const tp = (t - pi * pd) / pd;
      ctx.globalAlpha = fadeAlpha(tp);
      const chunk  = pages[pi];
      const blockH = chunk.length * lh;
      const y0     = H / 2 - blockH / 2;
      chunk.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lh + lh / 2));
      ctx.globalAlpha = 1;
    }
    clearShadow(ctx);
    drawEdgeFade(ctx, W, H);
  }

  // ── Render dispatcher ─────────────────────────────────────────────
  // Orden: [TitleCard inicio?] → Contenido → [TitleCard fin?] → CTA

  function calcDurs() {
    const efDur    = duracion / velocidad;
    const titleDur = tarjeta ? TITLE_CARD_SECS : 0;
    const totalDur = efDur + titleDur + CTA_CARD_SECS;
    return { efDur, titleDur, totalDur };
  }

  function renderAt(ctx, elapsed, W, H, textoSeg, totalDur) {
    const { efDur, titleDur } = calcDurs();
    const ctaStart = efDur + titleDur; // CTA siempre al final

    if (elapsed >= ctaStart) {
      drawCTACard(ctx, (elapsed - ctaStart) / CTA_CARD_SECS, W, H);
    } else if (tarjeta && tarjetaPos === 'inicio') {
      if (elapsed < titleDur) drawTitleCard(ctx, elapsed / titleDur, W, H);
      else drawContent(ctx, Math.min(elapsed - titleDur, efDur), efDur, W, H, textoSeg);
    } else if (tarjeta && tarjetaPos === 'fin') {
      if (elapsed < efDur) drawContent(ctx, elapsed, efDur, W, H, textoSeg);
      else drawTitleCard(ctx, (elapsed - efDur) / titleDur, W, H);
    } else {
      drawContent(ctx, Math.min(elapsed, efDur), efDur, W, H, textoSeg);
    }

    if (totalDur) drawVideoFade(ctx, elapsed, totalDur, W, H);
  }

  // ── Animated preview loop ─────────────────────────────────────────

  useEffect(() => {
    if (!preview) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    const { W, H } = dims;
    const scale = canvas.width / W;
    const { totalDur: total } = calcDurs();
    const t0    = Date.now();

    const tick = () => {
      const elapsed = ((Date.now() - t0) / 1000) % total;
      ctx.save(); ctx.scale(scale, scale);
      renderAt(ctx, elapsed, W, H, cuento, total);
      ctx.restore();
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [preview, cuento, fondo, imagenCargada, colorTexto, fontSize, fontFamily,
      lineSpacing, modoAnim, velocidad, duracion, maxWords, tarjeta, tarjetaPos,
      nombreCuento, autor, llamadaAccion, aspectRatio]);

  // ── Video export (WebM) ───────────────────────────────────────────
  // Usa setInterval a exactamente 30fps para evitar el bug de velocidad
  // que ocurría con requestAnimationFrame (60fps en monitores de 60Hz → video 2× rápido).
  // Limitación: setInterval se frena en pestañas ocultas — quedarse en la pestaña.

  async function generarWebM(textoSeg) {
    const { W, H } = dims;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx    = canvas.getContext('2d');
    const stream = canvas.captureStream(0);
    const track  = stream.getVideoTracks()[0];

    const { totalDur } = calcDurs();
    const totalFrames  = Math.round(totalDur * 30);

    return new Promise((resolve, reject) => {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      const chunks   = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      recorder.onerror = reject;
      recorder.start();

      let frame = 0;
      const interval = setInterval(() => {
        renderAt(ctx, frame / 30, W, H, textoSeg, totalDur);
        track.requestFrame();
        frame++;
        setProgreso(Math.round((frame / totalFrames) * 100));
        if (frame >= totalFrames) {
          clearInterval(interval);
          setTimeout(() => recorder.stop(), 200);
        }
      }, 1000 / 30); // exactamente 30fps
    });
  }

  // ── Video export (MP4 via WebCodecs + mp4-muxer) ──────────────────
  // Usa MessageChannel como pump: no se throttlea en pestañas ocultas.
  // Los timestamps son explícitos → velocidad siempre correcta.

  async function generarMP4(textoSeg) {
    const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
    const { W, H } = dims;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx    = canvas.getContext('2d');

    const { totalDur } = calcDurs();
    const totalFrames  = Math.round(totalDur * 30);

    const target = new ArrayBufferTarget();
    const muxer  = new Muxer({
      target,
      video: { codec: 'avc', width: W, height: H },
      fastStart: 'in-memory',
    });

    return new Promise((resolve, reject) => {
      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: reject,
      });
      encoder.configure({
        codec: 'avc1.640028', // High Profile Level 4.0 — hasta 2M px (1080×1920 ok)
        width: W, height: H,
        bitrate: 8_000_000,
        framerate: 30,
      });

      let frame = 0;
      const ch = new MessageChannel();
      ch.port1.onmessage = async () => {
        renderAt(ctx, frame / 30, W, H, textoSeg, totalDur);
        const vf = new VideoFrame(canvas, { timestamp: Math.round((frame / 30) * 1_000_000) });
        encoder.encode(vf, { keyFrame: frame % 60 === 0 });
        vf.close();
        frame++;
        setProgreso(Math.round((frame / totalFrames) * 100));
        if (frame < totalFrames) { ch.port2.postMessage(null); return; }
        setFinalizando(true);
        await encoder.flush();
        muxer.finalize();
        setFinalizando(false);
        resolve(new Blob([target.buffer], { type: 'video/mp4' }));
      };
      ch.port2.postMessage(null);
    });
  }

  function downloadBlob(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement('a'), { href: url, download: nombre });
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // Timestamp en el nombre para evitar colisiones con archivos existentes
  function nombreConFecha(base) {
    const now = new Date();
    const ts  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    return `${base}_${ts}`;
  }

  const generarVideo = async (formato) => {
    if (!cuento.trim()) { alert('Pegá el cuento primero'); return; }
    if (formato === 'mp4' && typeof VideoEncoder === 'undefined') {
      alert('Tu navegador no soporta exportar MP4.\nUsá Chrome o Edge para esta opción.');
      return;
    }
    setGenerando(true);
    setFormatoActual(formato);
    setProgreso(0);
    try {
      const segs = splitIntoSegments(cuento, partes);
      for (let i = 0; i < segs.length; i++) {
        const sufijo = segs.length > 1 ? `_parte${i + 1}` : '';
        const base   = nombreConFecha(nombreCuento.replace(/\s+/g, '_') + sufijo);
        const blob   = formato === 'mp4'
          ? await generarMP4(segs[i])
          : await generarWebM(segs[i]);
        downloadBlob(blob, `${base}.${formato}`);
        setProgreso(0);
      }
    } catch (err) {
      console.error(err);
      alert('Error generando video: ' + err.message);
    } finally {
      setGenerando(false);
      setProgreso(0);
    }
  };

  // ── Image upload ──────────────────────────────────────────────────

  function handleImg(e) {
    const file = e.target.files[0]; if (!file) return;
    if (imagenFondoUrl) URL.revokeObjectURL(imagenFondoUrl);
    const url = URL.createObjectURL(file);
    setImagenFondoUrl(url); setImagenCargada(false); bgImgRef.current = null;
    const img  = new Image();
    img.onload = () => { bgImgRef.current = img; setImagenCargada(true); };
    img.src    = url;
  }

  function quitarImg() {
    if (imagenFondoUrl) URL.revokeObjectURL(imagenFondoUrl);
    setImagenFondoUrl(null); setImagenCargada(false); bgImgRef.current = null;
  }

  function aplicarPreset(p) {
    setFondo(p.fondo); setColorTexto(p.colorTexto);
    setFontFamily(p.fontFamily); setFontSize(p.fontSize);
    setLineSpacing(p.lineSpacing);
    quitarImg();
  }

  // ── Preview canvas size ───────────────────────────────────────────
  const prevW = 270;
  const prevH = aspectRatio === '1:1' ? 270 : 480;

  const wc = cuento.split(/\s+/).filter(Boolean).length;

  // ── JSX ───────────────────────────────────────────────────────────
  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <h1 style={s.h1}>Generador de Videos · leercuentos.online</h1>
        <p style={s.sub}>Videos verticales para Instagram Reels y TikTok</p>
      </header>

      <div style={s.layout}>
        {/* ── Formulario ── */}
        <div style={s.card}>

          {/* Presets */}
          <Row label="Presets de estilo">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => aplicarPreset(p)}
                  style={{ ...s.presetBtn, background: p.fondo.startsWith('linear') ? p.fondo : p.fondo }}>
                  <span style={{ color: p.colorTexto, fontWeight: 700, fontSize: '0.78rem',
                    textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </Row>

          <Divider />

          <div style={s.g2}>
            <Row label="Nombre del cuento">
              <input value={nombreCuento} onChange={e => setNombreCuento(e.target.value)}
                placeholder="ej: La Casa en el Árbol" style={s.inp} />
            </Row>
            <Row label="Autor (opcional)">
              <input value={autor} onChange={e => setAutor(e.target.value)}
                placeholder="ej: Joaquin Menendez" style={s.inp} />
            </Row>
          </div>

          <Row label={`Texto del cuento (${wc} palabras)`}>
            <textarea value={cuento} onChange={e => setCuento(e.target.value)}
              placeholder="Pegá el texto completo del cuento aquí…" style={s.ta} />
          </Row>

          <div style={s.g2}>
            <Row label="Máx. palabras">
              <NumInput value={maxWords} onChange={setMaxWords} min={50} max={1000} fallback={250} style={s.inp} />
            </Row>
            <Row label="Duración (seg)">
              <NumInput value={duracion} onChange={setDuracion} min={15} max={90} fallback={30} style={s.inp} />
              <small style={s.sm}>15–90 seg (sin tarjeta)</small>
            </Row>
          </div>

          <div style={s.g2}>
            <Row label="Partes del cuento">
              <NumInput value={partes} onChange={setPartes} min={1} max={10} fallback={1} style={s.inp} />
              <small style={s.sm}>Genera N archivos separados</small>
            </Row>
            <Row label="Formato de video">
              <div style={s.tog}>
                <TogBtn active={aspectRatio === '9:16'} onClick={() => setAspectRatio('9:16')} first>9:16 Reels</TogBtn>
                <TogBtn active={aspectRatio === '1:1'}  onClick={() => setAspectRatio('1:1')}  last>1:1 Feed</TogBtn>
              </div>
            </Row>
          </div>

          <Divider />

          <div style={s.g2}>
            <Row label="Tipografía">
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} style={s.inp}>
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Row>
            <Row label={`Tamaño: ${fontSize}px`}>
              <input type="range" min="40" max="120" value={fontSize}
                onChange={e => setFontSize(+e.target.value)} style={s.range} />
              <small style={s.sm}>40–120 px</small>
            </Row>
          </div>

          <div style={s.g2}>
            <Row label={`Espaciado: ${lineSpacing.toFixed(2)}×`}>
              <input type="range" min="1.1" max="2.5" step="0.05" value={lineSpacing}
                onChange={e => setLineSpacing(+e.target.value)} style={s.range} />
              <small style={s.sm}>1.1 compacto — 2.5 aireado</small>
            </Row>
            <Row label={`Velocidad: ${velocidad.toFixed(1)}×`}>
              <input type="range" min="0.5" max="3" step="0.1" value={velocidad}
                onChange={e => setVelocidad(+e.target.value)} style={s.range} />
              <small style={s.sm}>0.5× lento — 3× rápido</small>
            </Row>
          </div>

          <Row label="Modo de animación">
            <div style={s.tog}>
              <TogBtn active={modoAnim === 'scroll'} onClick={() => setModoAnim('scroll')} first>Texto sube</TogBtn>
              <TogBtn active={modoAnim === 'lineas'} onClick={() => setModoAnim('lineas')} last>Líneas</TogBtn>
            </div>
          </Row>

          <Divider />

          <Row label="Color del texto">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={colorTexto} onChange={e => setColorTexto(e.target.value)} style={s.colorPick} />
              <code style={{ fontSize: '0.85rem', color: '#555' }}>{colorTexto}</code>
            </div>
          </Row>

          <Row label="Fondo">
            <div style={s.bgGrid}>
              {Object.entries(BACKGROUNDS).map(([name, val]) => (
                <button key={name} title={name}
                  onClick={() => { setFondo(val); quitarImg(); }}
                  style={{ ...s.bgBtn, background: val,
                    outline: fondo === val && !imagenFondoUrl ? '3px solid #667eea' : 'none',
                    outlineOffset: 2 }} />
              ))}
            </div>
          </Row>

          <Row label="Imagen de fondo (opcional)">
            <input type="file" accept="image/*" onChange={handleImg} style={s.inp} />
            {imagenFondoUrl && (
              <button onClick={quitarImg}
                style={{ ...s.secBtn, marginTop: 6, fontSize: '0.8rem', padding: '5px 14px' }}>
                Quitar imagen
              </button>
            )}
          </Row>

          <Divider />

          <Row label="Tarjeta de título (2.5 seg)">
            <label style={{ display: 'flex', gap: 8, alignItems: 'center',
              cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={tarjeta} onChange={e => setTarjeta(e.target.checked)} />
              Mostrar tarjeta con nombre del cuento
            </label>
            {tarjeta && (
              <div style={{ ...s.tog, marginTop: 8 }}>
                <TogBtn active={tarjetaPos === 'inicio'} onClick={() => setTarjetaPos('inicio')} first>Al inicio</TogBtn>
                <TogBtn active={tarjetaPos === 'fin'}    onClick={() => setTarjetaPos('fin')}    last>Al final</TogBtn>
              </div>
            )}
          </Row>

          <Row label="Llamada a acción (aparece al final del video)">
            <input value={llamadaAccion} onChange={e => setLlamadaAccion(e.target.value)} style={s.inp} />
            <small style={s.sm}>También usala como descripción del post en Instagram</small>
          </Row>

          {/* Barra de progreso */}
          {generando && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: '0.82rem', color: '#555', marginBottom: 4 }}>
                <span>
                  {finalizando
                    ? 'Finalizando archivo… (puede demorar)'
                    : `Generando ${formatoActual.toUpperCase()}…`}
                </span>
                <span>{finalizando ? '⏳' : `${progreso}%`}</span>
              </div>
              <div style={{ height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: finalizando ? '100%' : `${progreso}%`,
                  background: finalizando
                    ? 'linear-gradient(90deg, #11998e, #38ef7d)'
                    : 'linear-gradient(90deg, #667eea, #764ba2)',
                  transition: 'width 0.1s', borderRadius: 4,
                  animation: finalizando ? 'pulse 1s ease-in-out infinite alternate' : 'none' }} />
              </div>
              {formatoActual === 'webm' && (
                <div style={{ marginTop: 6, padding: '6px 10px', background: '#fff8e1',
                  border: '1px solid #ffe082', borderRadius: 6,
                  fontSize: '0.78rem', color: '#7a5f00' }}>
                  No cambies de pestaña mientras se genera el WebM.
                </div>
              )}
            </div>
          )}

          <div style={s.btnRow}>
            <button onClick={() => setPreview(p => !p)} style={s.secBtn} disabled={generando}>
              {preview ? 'Cerrar preview' : 'Ver preview animado'}
            </button>
            <button onClick={() => generarVideo('webm')} disabled={generando || !cuento.trim()}
              style={{ ...s.priBtn, opacity: generando || !cuento.trim() ? 0.55 : 1,
                cursor: generando || !cuento.trim() ? 'not-allowed' : 'pointer' }}>
              {generando ? `Generando… ${progreso}%` : `WebM${partes > 1 ? ` (${partes} partes)` : ''}`}
            </button>
            <button onClick={() => generarVideo('mp4')} disabled={generando || !cuento.trim()}
              style={{ ...s.priBtn, opacity: generando || !cuento.trim() ? 0.55 : 1,
                cursor: generando || !cuento.trim() ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
              {`MP4${partes > 1 ? ` (${partes} partes)` : ''}`}
            </button>
          </div>
          <small style={{ ...s.sm, display: 'block', textAlign: 'center', marginTop: 4 }}>
            MP4 requiere Chrome o Edge
          </small>

        </div>

        {/* ── Preview animado ── */}
        {preview && (
          <div style={s.card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 600 }}>
              Preview animado ({aspectRatio}) — en loop
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <canvas ref={previewRef} width={prevW} height={prevH}
                style={{ borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Micro-componentes ──────────────────────────────────────────────

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#222', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '18px 0' }} />;
}

function NumInput({ value, onChange, min, max, fallback, style }) {
  const [draft, setDraft] = React.useState(String(value));
  React.useEffect(() => setDraft(String(value)), [value]);
  return (
    <input
      type="number"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => {
        const v = Math.min(max, Math.max(min, parseInt(draft) || fallback));
        onChange(v);
        setDraft(String(v));
      }}
      style={style}
    />
  );
}

function TogBtn({ children, active, onClick, first, last }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '9px 0', fontSize: '0.84rem', cursor: 'pointer',
      border: '2px solid #e0e0e0', fontFamily: 'inherit',
      borderRadius: first ? '7px 0 0 7px' : last ? '0 7px 7px 0' : 0,
      background: active ? '#667eea' : '#fff',
      color:      active ? '#fff'    : '#555',
      fontWeight: active ? 600 : 400,
      transition: 'all 0.15s',
    }}>
      {children}
    </button>
  );
}

// ── Estilos ────────────────────────────────────────────────────────

const s = {
  wrap:      { minHeight: '100vh', background: '#f4f6fa', padding: '32px 20px',
               fontFamily: '"Segoe UI", system-ui, sans-serif' },
  header:    { maxWidth: 1200, margin: '0 auto 28px', textAlign: 'center' },
  h1:        { fontSize: '1.9rem', fontWeight: 700, color: '#111', margin: '0 0 6px' },
  sub:       { fontSize: '0.95rem', color: '#666', margin: 0 },
  layout:    { maxWidth: 1200, margin: '0 auto', display: 'grid',
               gridTemplateColumns: 'minmax(440px, 1fr) auto', gap: 28, alignItems: 'start' },
  card:      { background: '#fff', padding: 28, borderRadius: 14,
               boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  inp:       { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0',
               borderRadius: 7, fontSize: '0.9rem', fontFamily: 'inherit',
               boxSizing: 'border-box', background: '#fff' },
  ta:        { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0',
               borderRadius: 7, fontSize: '0.9rem', fontFamily: 'inherit',
               minHeight: 140, resize: 'vertical', boxSizing: 'border-box' },
  sm:        { fontSize: '0.76rem', color: '#999', marginTop: 3 },
  g2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  range:     { width: '100%', marginTop: 4 },
  tog:       { display: 'flex' },
  colorPick: { width: 46, height: 46, border: 'none', borderRadius: 7, cursor: 'pointer', padding: 0 },
  bgGrid:    { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 },
  bgBtn:     { aspectRatio: '1', borderRadius: 7, cursor: 'pointer', padding: 0,
               border: '2px solid rgba(255,255,255,0.15)', transition: 'all 0.15s' },
  presetBtn: { padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
               minWidth: 90, textAlign: 'center' },
  btnRow:    { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 },
  priBtn:    { padding: '12px 6px', fontSize: '0.9rem', fontWeight: 700, border: 'none',
               borderRadius: 8, background: 'linear-gradient(135deg, #667eea, #764ba2)',
               color: '#fff', cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: 'inherit' },
  secBtn:    { padding: '12px 6px', fontSize: '0.9rem', fontWeight: 600,
               border: '2px solid #e0e0e0', borderRadius: 8, background: '#fff',
               color: '#555', cursor: 'pointer', fontFamily: 'inherit' },
};
