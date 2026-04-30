# Generador de Videos de Cuentos

## Setup

1. **Descargar todos los archivos** de la carpeta `/outputs`

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```
   
   Esto abre automáticamente `http://localhost:5173` en tu navegador.

4. **Editar en VS Code:**
   - Abrí la carpeta en VS Code
   - Los archivos principales están en `src/`
   - Guardá y se recarga automáticamente

## Estructura de archivos

```
project/
├── index.html              # Página HTML raíz
├── package.json            # Dependencias
├── vite.config.js          # Config de Vite
├── src/
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # Wrapper
│   └── StoryVideoGenerator.jsx  # Componente principal
```

## Para editar

- El componente principal está en `src/StoryVideoGenerator.jsx`
- Cualquier cambio se refleja al instante en el navegador
- Si querés agregar componentes nuevos, creá archivos en `src/` e importalos en `App.jsx`

## Para producción

```bash
npm run build
```

Genera los archivos optimizados en `dist/`.
