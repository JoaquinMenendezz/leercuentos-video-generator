# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server on http://localhost:5173 (auto-opens browser)
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

No linting, testing, or type-checking tooling is configured.

## Architecture

Single-page React app that converts story text into animated vertical WebM videos (1080×1920, suited for Instagram Reels / TikTok). No backend — everything runs in the browser.

**Component tree (flat):**
```
index.html → main.jsx → App.jsx → StoryVideoGenerator.jsx
```

All logic lives in `StoryVideoGenerator.jsx`. There is also a `story-video-generator.jsx` at the root that appears to be a stale backup of the same component — it is not imported anywhere.

## Video generation pipeline

The core technical flow inside `StoryVideoGenerator.jsx`:

1. **Canvas setup** — creates a `<canvas>` element at 1080×1920 via `useRef`; draws background (gradient preset or solid color) + text using Canvas 2D API.
2. **Text animation** — words appear progressively with a vertical scroll effect; the scroll rate is derived from video duration. Font is Georgia 68px bold with fade overlays at top/bottom edges.
3. **Frame capture** — `canvas.captureStream(30)` feeds into a `MediaRecorder` (VP9/WebM codec).
4. **Export** — on stop, recorded `Blob` chunks are assembled and triggered as a `.webm` file download.

## Key constraints

- **Firebird SQL note from parent CLAUDE.md** does not apply here — this project has no database.
- Output format is always WebM (VP9); browser codec availability determines actual encoding quality.
- Canvas is 1080×1920 but rendered at reduced CSS size in the preview pane — do not confuse preview dimensions with output dimensions.
