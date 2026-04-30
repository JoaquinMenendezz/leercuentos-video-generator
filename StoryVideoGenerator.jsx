import React, { useState, useRef, useEffect } from 'react';

const TITLE_CARD_SECS = 2.5;

const FONTS = [
  { label: 'Georgia (elegante)',              value: 'Georgia, serif' },
  { label: 'Times New Roman (clásica)',       value: '"Times New Roman", serif' },
  { label: 'Arial (moderna)',                 value: 'Arial, sans-serif' },
  { label: 'Verdana (clara)',                 value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS (digital)',          value: '"Trebuchet MS", sans-serif' },
  { label: 'Palatino (literaria)',            value: '"Palatino Linotype", Palatino, serif' },
  { label: 'Comic Sans (infantil)',           value: '"Comic Sans MS", cursive' },
  { label: 'Courier New (máquina escribir)', value: '"Courier New", monospace' },
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

export default function StoryVideoGenerator() {
  const [cuento, setCuento]                   = useState('');
  const [nombreCuento, setNombreCuento]       = useState('Cuento sin título');
  const [llamadaAccion, setLlamadaAccion]     = useState('Leé el cuento completo en leercuentos.online');
  const [maxWords, setMaxWords]               = useState(250);
  const [duracion, setDuracion]               = useState(30);
  const [fondo, setFondo]                     = useState('linear-gradient(135deg, #667eea, #764ba2)');
  const [imagenFondoUrl, setImagenFondoUrl]   = useState(null);
  const [imagenCargada, setImagenCargada]     = useState(false);
  const [colorTexto, setColorTexto]           = useState('#ffffff');
  const [fontSize, setFontSize]               = useState(68);
  const [fontFamily, setFontFamily]           = useState('Georgia, serif');
  const [modoAnim, setModoAnim]               = useState('scroll');
  const [velocidad, setVelocidad]             = useState(1);
  const [tarjeta, setTarjeta]                 = useState(true);
  const [tarjetaPos, setTarjetaPos]           = useState('inicio');
  const [generando, setGenerando]             = useState(false);
  const [preview, setPreview]                 = useState(false);

  const previewRef = useRef(null);
  const animRef    = useRef(null);
  const bgImgRef   = useRef(null);

  // ── Text helpers ──────────────────────────────────────────────────

  // Respeta saltos de línea del original. Devuelve array de arrays de palabras.
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

  // Word-wrap simple, para títulos.
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

  // Word-wrap inteligente: prefiere cortar en puntuación (. , ; ! ?) antes de
  // cortar en cualquier palabra. Vuelve a corte normal si no hay puntuación cerca.
  function buildLinesSmart(ctx, words, maxW) {
    const lines = [];
    let start = 0;
    while (start < words.length) {
      let end = start;
      let line = '';
      while (end < words.length) {
        const test = line ? `${line} ${words[end]}` : words[end];
        if (ctx.measureText(test).width > maxW && end > start) break;
        line = test;
        end++;
      }
      // Si no llegamos al final, buscar última puntuación en ventana del 40%
      if (end < words.length) {
        const window = Math.max(1, Math.floor((end - start) * 0.4));
        for (let i = end - 1; i >= Math.max(start, end - window); i--) {
          if (/[.!?,:;]$/.test(words[i])) {
            end = i + 1;
            line = words.slice(start, end).join(' ');
            break;
          }
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
      g.addColorStop(0, colors[0]);
      g.addColorStop(1, colors[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = fondo;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawEdgeFade(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0,    'rgba(0,0,0,0.45)');
    g.addColorStop(0.1,  'rgba(0,0,0,0)');
    g.addColorStop(0.9,  'rgba(0,0,0,0)');
    g.addColorStop(1,    'rgba(0,0,0,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function applyTextStyle(ctx, size) {
    ctx.fillStyle      = colorTexto;
    ctx.font           = `bold ${size}px ${fontFamily}`;
    ctx.textAlign      = 'center';
    ctx.textBaseline   = 'middle';
    ctx.shadowColor    = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur     = 14;
    ctx.shadowOffsetX  = 2;
    ctx.shadowOffsetY  = 2;
  }

  function clearShadow(ctx) {
    ctx.shadowColor   = 'transparent';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  function fadeAlpha(p) {
    if (p < 0.15) return p / 0.15;
    if (p > 0.85) return (1 - p) / 0.15;
    return 1;
  }

  // ── Title card ────────────────────────────────────────────────────

  function drawTitleCard(ctx, progress, W, H) {
    drawBg(ctx, W, H);
    drawEdgeFade(ctx, W, H);

    const titleSize = Math.min(fontSize + 24, 120);
    applyTextStyle(ctx, titleSize);
    ctx.globalAlpha = fadeAlpha(progress);

    const words = nombreCuento.split(/\s+/);
    const lines = buildLines(ctx, words, W * 0.78);
    const lh    = titleSize * 1.4;
    const block = lines.length * lh;
    const y0    = H / 2 - block / 2;

    lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lh + lh / 2));

    clearShadow(ctx);
    ctx.font      = `${Math.round(fontSize * 0.55)}px ${fontFamily}`;
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.fillText('leercuentos.online', W / 2, y0 + block + lh * 0.9);

    ctx.globalAlpha = 1;
    clearShadow(ctx);
  }

  // ── Content frame ─────────────────────────────────────────────────

  function drawContent(ctx, t, dur, W, H) {
    drawBg(ctx, W, H);
    applyTextStyle(ctx, fontSize);

    const paras  = trimToParagraphs(cuento, maxWords);
    const maxW   = W * 0.83;
    const lh     = fontSize * 1.45;
    const paraGap = lh * 0.7; // espacio extra entre párrafos

    if (modoAnim === 'scroll') {
      // Construir lista plana de items: {text} o {isGap}
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
      // Agrupar en páginas respetando párrafos (salto de párrafo = nueva página)
      const pages = [];
      let page    = [];
      for (const words of paras) {
        for (const line of buildLinesSmart(ctx, words, maxW)) {
          page.push(line);
          if (page.length >= 3) { pages.push(page); page = []; }
        }
        // salto de párrafo fuerza nueva página
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

  function renderAt(ctx, elapsed, W, H) {
    const efDur    = duracion / velocidad;
    const titleDur = tarjeta ? TITLE_CARD_SECS : 0;

    if (tarjeta && tarjetaPos === 'inicio') {
      if (elapsed < titleDur)
        drawTitleCard(ctx, elapsed / titleDur, W, H);
      else
        drawContent(ctx, Math.min(elapsed - titleDur, efDur), efDur, W, H);
    } else if (tarjeta && tarjetaPos === 'fin') {
      if (elapsed < efDur)
        drawContent(ctx, elapsed, efDur, W, H);
      else
        drawTitleCard(ctx, (elapsed - efDur) / titleDur, W, H);
    } else {
      drawContent(ctx, Math.min(elapsed, efDur), efDur, W, H);
    }
  }

  // ── Animated preview loop ─────────────────────────────────────────

  useEffect(() => {
    if (!preview) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const canvas = previewRef.current;
    if (!canvas) return;

    const ctx    = canvas.getContext('2d');
    const W      = 1080;
    const H      = 1920;
    const scale  = canvas.width / W;
    const efDur  = duracion / velocidad;
    const total  = efDur + (tarjeta ? TITLE_CARD_SECS : 0);
    const t0     = Date.now();

    const tick = () => {
      const elapsed = ((Date.now() - t0) / 1000) % total;
      ctx.save();
      ctx.scale(scale, scale);
      renderAt(ctx, elapsed, W, H);
      ctx.restore();
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [
    preview, cuento, fondo, imagenCargada, colorTexto,
    fontSize, fontFamily, modoAnim, velocidad, duracion,
    maxWords, tarjeta, tarjetaPos, nombreCuento,
  ]);

  // ── Video export ──────────────────────────────────────────────────

  const generarVideo = async () => {
    if (!cuento.trim()) { alert('Pegá el cuento primero'); return; }
    setGenerando(true);
    try {
      const W = 1080, H = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      const efDur      = duracion / velocidad;
      const totalDur   = efDur + (tarjeta ? TITLE_CARD_SECS : 0);
      const totalFrames = Math.round(totalDur * 30);

      const recorder = new MediaRecorder(canvas.captureStream(30), {
        mimeType: 'video/webm;codecs=vp9',
      });
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${nombreCuento.replace(/\s+/g, '_')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setGenerando(false);
      };

      recorder.start();
      let frame = 0;
      const next = () => {
        renderAt(ctx, frame / 30, W, H);
        frame++;
        if (frame < totalFrames) requestAnimationFrame(next);
        else recorder.stop();
      };
      requestAnimationFrame(next);
    } catch (err) {
      console.error(err);
      alert('Error generando video: ' + err.message);
      setGenerando(false);
    }
  };

  // ── Image upload ──────────────────────────────────────────────────

  function handleImg(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (imagenFondoUrl) URL.revokeObjectURL(imagenFondoUrl);
    const url = URL.createObjectURL(file);
    setImagenFondoUrl(url);
    setImagenCargada(false);
    bgImgRef.current = null;
    const img   = new Image();
    img.onload  = () => { bgImgRef.current = img; setImagenCargada(true); };
    img.src     = url;
  }

  function quitarImg() {
    if (imagenFondoUrl) URL.revokeObjectURL(imagenFondoUrl);
    setImagenFondoUrl(null);
    setImagenCargada(false);
    bgImgRef.current = null;
  }

  // ── JSX ───────────────────────────────────────────────────────────

  const wc = cuento.split(/\s+/).filter(Boolean).length;

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <h1 style={s.h1}>Generador de Videos · leercuentos.online</h1>
        <p style={s.sub}>Videos verticales para Instagram Reels y TikTok</p>
      </header>

      <div style={s.layout}>
        {/* ── Formulario ── */}
        <div style={s.card}>

          <Row label="Nombre del cuento">
            <input value={nombreCuento}
              onChange={e => setNombreCuento(e.target.value)}
              placeholder="ej: La Casa en el Árbol" style={s.inp} />
          </Row>

          <Row label={`Texto del cuento (${wc} palabras)`}>
            <textarea value={cuento}
              onChange={e => setCuento(e.target.value)}
              placeholder="Pegá el texto completo del cuento aquí…"
              style={s.ta} />
          </Row>

          <div style={s.g2}>
            <Row label="Máx. palabras">
              <input type="number" min="50" max="1000" value={maxWords}
                onChange={e => setMaxWords(Math.max(50, +e.target.value || 250))}
                style={s.inp} />
            </Row>
            <Row label="Duración (seg)">
              <input type="number" min="15" max="90" value={duracion}
                onChange={e => setDuracion(Math.max(15, +e.target.value || 30))}
                style={s.inp} />
              <small style={s.sm}>15–90 seg (sin tarjeta)</small>
            </Row>
          </div>

          <Divider />

          {/* Tipografía */}
          <div style={s.g2}>
            <Row label="Tipografía">
              <select value={fontFamily}
                onChange={e => setFontFamily(e.target.value)} style={s.inp}>
                {FONTS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </Row>
            <Row label={`Tamaño de letra: ${fontSize}px`}>
              <input type="range" min="40" max="120" value={fontSize}
                onChange={e => setFontSize(+e.target.value)} style={s.range} />
              <small style={s.sm}>40–120 px</small>
            </Row>
          </div>

          {/* Animación */}
          <div style={s.g2}>
            <Row label="Modo de animación">
              <div style={s.tog}>
                <TogBtn active={modoAnim === 'scroll'}
                  onClick={() => setModoAnim('scroll')} first>
                  Texto sube
                </TogBtn>
                <TogBtn active={modoAnim === 'lineas'}
                  onClick={() => setModoAnim('lineas')} last>
                  Líneas
                </TogBtn>
              </div>
            </Row>
            <Row label={`Velocidad: ${velocidad.toFixed(1)}×`}>
              <input type="range" min="0.5" max="3" step="0.1" value={velocidad}
                onChange={e => setVelocidad(+e.target.value)} style={s.range} />
              <small style={s.sm}>0.5× lento — 3× rápido</small>
            </Row>
          </div>

          <Divider />

          {/* Color texto */}
          <Row label="Color del texto">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={colorTexto}
                onChange={e => setColorTexto(e.target.value)}
                style={s.colorPick} />
              <code style={{ fontSize: '0.85rem', color: '#555' }}>{colorTexto}</code>
            </div>
          </Row>

          {/* Fondo */}
          <Row label="Fondo (20 opciones)">
            <div style={s.bgGrid}>
              {Object.entries(BACKGROUNDS).map(([name, val]) => (
                <button key={name} title={name}
                  onClick={() => { setFondo(val); quitarImg(); }}
                  style={{
                    ...s.bgBtn,
                    background: val,
                    outline: fondo === val && !imagenFondoUrl
                      ? '3px solid #667eea' : 'none',
                    outlineOffset: 2,
                  }} />
              ))}
            </div>
          </Row>

          {/* Imagen de fondo */}
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

          {/* Tarjeta de título */}
          <Row label="Tarjeta de título (2.5 seg)">
            <label style={{ display: 'flex', gap: 8, alignItems: 'center',
              cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={tarjeta}
                onChange={e => setTarjeta(e.target.checked)} />
              Mostrar tarjeta con nombre del cuento
            </label>
            {tarjeta && (
              <div style={{ ...s.tog, marginTop: 8 }}>
                <TogBtn active={tarjetaPos === 'inicio'}
                  onClick={() => setTarjetaPos('inicio')} first>
                  Al inicio
                </TogBtn>
                <TogBtn active={tarjetaPos === 'fin'}
                  onClick={() => setTarjetaPos('fin')} last>
                  Al final
                </TogBtn>
              </div>
            )}
          </Row>

          <Row label="Llamada a acción (descripción del post)">
            <input value={llamadaAccion}
              onChange={e => setLlamadaAccion(e.target.value)}
              style={s.inp} />
          </Row>

          <div style={s.btnRow}>
            <button onClick={() => setPreview(p => !p)} style={s.secBtn}>
              {preview ? 'Cerrar preview' : 'Ver preview animado'}
            </button>
            <button onClick={generarVideo}
              disabled={generando || !cuento.trim()}
              style={{
                ...s.priBtn,
                opacity: generando || !cuento.trim() ? 0.55 : 1,
                cursor:  generando || !cuento.trim() ? 'not-allowed' : 'pointer',
              }}>
              {generando ? 'Generando…' : 'Generar Video .webm'}
            </button>
          </div>
        </div>

        {/* ── Preview animado ── */}
        {preview && (
          <div style={s.card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 600, color: '#111' }}>
              Preview animado (9:16) — en loop
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <canvas ref={previewRef} width={270} height={480}
                style={{ borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }} />
            </div>
            <p style={{ ...s.sm, textAlign: 'center', marginTop: 10 }}>
              Vista real de la animación
            </p>
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
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem',
        color: '#222', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '18px 0' }} />;
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
               minHeight: 130, resize: 'vertical', boxSizing: 'border-box' },
  sm:        { display: 'block', fontSize: '0.76rem', color: '#999', marginTop: 3 },
  g2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  range:     { width: '100%', marginTop: 4 },
  tog:       { display: 'flex' },
  colorPick: { width: 46, height: 46, border: 'none', borderRadius: 7,
               cursor: 'pointer', padding: 0 },
  bgGrid:    { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 },
  bgBtn:     { aspectRatio: '1', borderRadius: 7, cursor: 'pointer', padding: 0,
               border: '2px solid rgba(255,255,255,0.15)', transition: 'all 0.15s' },
  btnRow:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 },
  priBtn:    { padding: 13, fontSize: '0.95rem', fontWeight: 700, border: 'none',
               borderRadius: 8, background: 'linear-gradient(135deg, #667eea, #764ba2)',
               color: '#fff', cursor: 'pointer', transition: 'opacity 0.2s',
               fontFamily: 'inherit' },
  secBtn:    { padding: 13, fontSize: '0.95rem', fontWeight: 600,
               border: '2px solid #e0e0e0', borderRadius: 8, background: '#fff',
               color: '#555', cursor: 'pointer', fontFamily: 'inherit' },
};
