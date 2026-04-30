import React, { useState, useRef, useEffect } from 'react';

export default function StoryVideoGenerator() {
  const [cuento, setCuento] = useState('');
  const [maxWords, setMaxWords] = useState(250);
  const [duracion, setDuracion] = useState(30);
  const [fondo, setFondo] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const [colorTexto, setColorTexto] = useState('#ffffff');
  const [llamadaAccion, setLlamadaAccion] = useState('Leé el cuento completo en leerxuentos.online');
  const [nombreCuento, setNombreCuento] = useState('Cuento sin título');
  const [generando, setGenerando] = useState(false);
  const [preview, setPreview] = useState(false);
  const canvasRef = useRef(null);

  const fondoOpciones = {
    'Púrpura Rosa': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Rosa Fuerte': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Azul Agua': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'Verde Menta': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'Atardecer': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'Negro Puro': '#1a1a1a',
    'Azul Oscuro': '#1e3a5f',
    'Verde Bosque': '#0d4d27',
  };

  const cortarTexto = (texto, maxPalabras) => {
    const palabras = texto.trim().split(/\s+/);
    if (palabras.length <= maxPalabras) return texto;
    return palabras.slice(0, maxPalabras).join(' ') + '...';
  };

  const generarVideo = async () => {
    if (!cuento.trim()) {
      alert('Pegá el cuento primero');
      return;
    }

    setGenerando(true);

    try {
      const textoCortado = cortarTexto(cuento, maxWords);
      
      // Crear canvas para el video
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // Función para dibujar fondo
      const dibujarFondo = () => {
        if (fondo.startsWith('linear-gradient')) {
          // Extrae colores del gradiente (simplificado)
          const colores = fondo.match(/#[0-9a-f]{6}/gi) || ['#667eea', '#764ba2'];
          const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
          gradient.addColorStop(0, colores[0] || '#667eea');
          gradient.addColorStop(1, colores[1] || '#764ba2');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = fondo;
        }
        ctx.fillRect(0, 0, 1080, 1920);
      };

      // Función para dibujar overlay de fade en bordes
      const dibujarOverlay = () => {
        const gradientOverlay = ctx.createLinearGradient(0, 0, 0, 1920);
        gradientOverlay.addColorStop(0, 'rgba(0,0,0,0.3)');
        gradientOverlay.addColorStop(0.1, 'rgba(0,0,0,0)');
        gradientOverlay.addColorStop(0.9, 'rgba(0,0,0,0)');
        gradientOverlay.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = gradientOverlay;
        ctx.fillRect(0, 0, 1080, 1920);
      };

      // Captura el stream del canvas
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreCuento.replace(/\s+/g, '_')}_video.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setGenerando(false);
      };

      const palabras = textoCortado.split(/\s+/);
      const tiempoTotal = duracion * 1000;
      const tiempoXPalabra = tiempoTotal / palabras.length;

      mediaRecorder.start();

      let tiempoActual = 0;
      let frameCount = 0;
      const totalFrames = (duracion * 30);

      const animarFrame = () => {
        // Limpiar y dibujar fondo
        dibujarFondo();

        // Configurar texto
        ctx.fillStyle = colorTexto;
        ctx.font = 'bold 68px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 2;

        // Calcular qué palabras mostrar
        const palabraIndex = Math.floor(tiempoActual / tiempoXPalabra);
        const offset = (tiempoActual % tiempoXPalabra) / tiempoXPalabra;

        // Construir líneas para texto wrapping
        const lineas = [];
        let lineaActual = '';
        const maxAncho = 900;

        for (let i = 0; i <= palabraIndex && i < palabras.length; i++) {
          const palabra = palabras[i];
          const testLinea = lineaActual ? `${lineaActual} ${palabra}` : palabra;

          if (ctx.measureText(testLinea).width > maxAncho) {
            if (lineaActual) lineas.push(lineaActual);
            lineaActual = palabra;
          } else {
            lineaActual = testLinea;
          }
        }
        if (lineaActual) lineas.push(lineaActual);

        // Dibujar texto con movimiento de scroll
        const alturaLinea = 100;
        const yOffset = offset * alturaLinea;
        const yInicio = 1920 / 2 - (lineas.length * alturaLinea) / 2;

        lineas.forEach((linea, idx) => {
          ctx.fillText(linea, 540, yInicio + idx * alturaLinea - yOffset);
        });

        // Dibujar overlay
        dibujarOverlay();

        // Incrementar tiempo
        tiempoActual += 1000 / 30;
        frameCount++;

        if (frameCount < totalFrames) {
          requestAnimationFrame(animarFrame);
        } else {
          mediaRecorder.stop();
        }
      };

      requestAnimationFrame(animarFrame);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generando video: ' + error.message);
      setGenerando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>📖 Generador de Videos de Cuentos</h1>
        <p style={styles.subtitulo}>Para Instagram Reels y TikTok</p>
      </div>

      <div style={styles.content}>
        <div style={styles.formulario}>
          <div style={styles.seccion}>
            <label style={styles.label}>Nombre del cuento</label>
            <input
              type="text"
              value={nombreCuento}
              onChange={(e) => setNombreCuento(e.target.value)}
              placeholder="ej: La Casa en el Árbol"
              style={styles.input}
            />
          </div>

          <div style={styles.seccion}>
            <label style={styles.label}>Pegá el cuento acá</label>
            <textarea
              value={cuento}
              onChange={(e) => setCuento(e.target.value)}
              placeholder="Pegá el texto completo del cuento..."
              style={styles.textarea}
            />
            <div style={styles.contador}>
              {cuento.split(/\s+/).filter(w => w).length} palabras totales
            </div>
          </div>

          <div style={styles.grilla}>
            <div style={styles.seccion}>
              <label style={styles.label}>Máximo de palabras</label>
              <input
                type="number"
                min="50"
                max="1000"
                value={maxWords}
                onChange={(e) => setMaxWords(Math.max(50, parseInt(e.target.value) || 250))}
                style={styles.input}
              />
              <small style={styles.ayuda}>Fragmento a mostrar</small>
            </div>

            <div style={styles.seccion}>
              <label style={styles.label}>Duración (segundos)</label>
              <input
                type="number"
                min="15"
                max="60"
                value={duracion}
                onChange={(e) => setDuracion(Math.max(15, parseInt(e.target.value) || 30))}
                style={styles.input}
              />
              <small style={styles.ayuda}>15-60 seg</small>
            </div>
          </div>

          <div style={styles.seccion}>
            <label style={styles.label}>Fondo</label>
            <div style={styles.gridFondos}>
              {Object.entries(fondoOpciones).map(([nombre, valor]) => (
                <button
                  key={nombre}
                  onClick={() => setFondo(valor)}
                  style={{
                    ...styles.botonFondo,
                    background: valor,
                    border: fondo === valor ? '4px solid #fff' : '2px solid #ccc',
                    boxShadow: fondo === valor ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
                  }}
                  title={nombre}
                />
              ))}
            </div>
          </div>

          <div style={styles.seccion}>
            <label style={styles.label}>Color del texto</label>
            <div style={styles.colorPicker}>
              <input
                type="color"
                value={colorTexto}
                onChange={(e) => setColorTexto(e.target.value)}
                style={styles.inputColor}
              />
              <span style={styles.colorValue}>{colorTexto}</span>
            </div>
          </div>

          <div style={styles.seccion}>
            <label style={styles.label}>Llamada a acción</label>
            <input
              type="text"
              value={llamadaAccion}
              onChange={(e) => setLlamadaAccion(e.target.value)}
              placeholder="ej: Leé el cuento completo en..."
              style={styles.input}
            />
            <small style={styles.ayuda}>Esto va en la descripción del post</small>
          </div>

          <div style={styles.botones}>
            <button
              onClick={() => setPreview(!preview)}
              style={styles.botonSecundario}
              onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.background = '#fff'}
            >
              {preview ? '✕ Cerrar' : '👁️ Preview'}
            </button>
            <button
              onClick={generarVideo}
              disabled={generando || !cuento.trim()}
              style={{
                ...styles.botonPrimario,
                opacity: generando || !cuento.trim() ? 0.6 : 1,
                cursor: generando || !cuento.trim() ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => !generando && !cuento.trim() === false && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {generando ? '⏳ Generando...' : '🎬 Generar Video'}
            </button>
          </div>
        </div>

        {preview && (
          <div style={styles.previsualizacion}>
            <h3 style={styles.tituloPreview}>Preview (9:16 vertical)</h3>
            <div style={styles.canvasContainer}>
              <div
                ref={canvasRef}
                style={{
                  ...styles.previewFrame,
                  background: fondo,
                }}
              >
                <div style={styles.previewTexto}>
                  {cortarTexto(cuento, maxWords)}
                </div>
                <div style={styles.previewLeyenda}>{llamadaAccion}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
    padding: '40px 20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 40px',
    textAlign: 'center',
  },
  titulo: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0 0 10px 0',
  },
  subtitulo: {
    fontSize: '1.1rem',
    color: '#666',
    margin: 0,
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(400px, 1fr) minmax(350px, 1fr)',
    gap: '40px',
  },
  formulario: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  seccion: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    minHeight: '150px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  contador: {
    fontSize: '0.85rem',
    color: '#999',
    marginTop: '6px',
  },
  ayuda: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#999',
    marginTop: '4px',
  },
  grilla: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  gridFondos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  botonFondo: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    padding: 0,
  },
  colorPicker: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  inputColor: {
    width: '50px',
    height: '50px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  colorValue: {
    fontSize: '0.95rem',
    color: '#666',
    fontWeight: '500',
  },
  botones: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '30px',
  },
  botonPrimario: {
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  botonSecundario: {
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    background: '#fff',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  previsualizacion: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tituloPreview: {
    margin: '0 0 20px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  previewFrame: {
    width: '250px',
    aspectRatio: '9/16',
    borderRadius: '20px',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    textAlign: 'center',
  },
  previewTexto: {
    color: '#fff',
    fontSize: '1.2rem',
    lineHeight: '1.6',
    fontWeight: '600',
    marginBottom: '40px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  previewLeyenda: {
    marginTop: 'auto',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.9)',
    borderTop: '1px solid rgba(255,255,255,0.3)',
    paddingTop: '15px',
  },
};
