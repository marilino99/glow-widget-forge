

## Piano: Blob 3D con React Three Fiber

### Situazione attuale
Il blob vocale attuale è fatto con SVG animati (3 path con `<animate>`) — è piatto, 2D, e poco impressionante.

### Soluzione
Creare un componente `VoiceBlob3D` usando **@react-three/fiber** + **@react-three/drei** che renderizza una sfera 3D deformata con shader personalizzati, simile ai blob che si vedono su Siri/ChatGPT voice mode.

### Come funziona
- Una `SphereGeometry` con vertex shader che deforma i vertici usando **noise** (simplex/perlin) basato sul tempo
- Il blob pulsa e si muove organicamente
- Gradiente di colore arancio (come l'attuale) applicato via fragment shader
- Lo stato `voiceStatus` (connecting/listening/processing) controlla l'intensità dell'animazione:
  - **connecting**: movimento lento e piccolo
  - **listening**: movimento medio, reattivo
  - **processing**: movimento più intenso e veloce

### Modifiche

1. **Installare dipendenze**: `@react-three/fiber@^8.18` + `@react-three/drei@^9.122.0` + `three@^0.160`

2. **Nuovo file `src/components/builder/VoiceBlob3D.tsx`**:
   - Componente con `<Canvas>` di R3F
   - Sfera con custom shader material (vertex displacement con noise)
   - Colori gradient arancio (#FF8C42 → #FF6B35)
   - Props: `status` ("connecting" | "listening" | "processing"), `muted` (boolean)
   - Animazione fluida con `useFrame`

3. **Aggiornare `WidgetPreviewPanel.tsx`** (righe 3117-3158):
   - Sostituire il blocco SVG con `<VoiceBlob3D status={voiceStatus} muted={voiceMuted} />`
   - Mantenere stesso contenitore (160x160)

### File coinvolti
- `package.json` — nuove dipendenze
- `src/components/builder/VoiceBlob3D.tsx` — nuovo componente
- `src/components/builder/WidgetPreviewPanel.tsx` — sostituire SVG con componente 3D

