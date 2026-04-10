

## Piano: Sostituzione del blob 3D Three.js con il video .mov di After Effects

### Cosa viene fatto
Sostituire l'attuale blob Three.js (`VoiceBlob3D.tsx`) con il video `.mov` esportato da After Effects, convertendolo prima in formato **WebM con canale alpha** (trasparenza) per il web.

### Passaggi

1. **Convertire il file `.mov` in WebM con trasparenza**
   - Copiare il file `.mov` uploadato nel sandbox
   - Usare `ffmpeg` per convertirlo in WebM VP9 con canale alpha: `ffmpeg -i input.mov -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -auto-alt-ref 0 -an voice-blob.webm`
   - Verificare dimensione e qualità del file risultante

2. **Aggiungere il file WebM al progetto**
   - Copiare `voice-blob.webm` in `public/videos/`

3. **Riscrivere `VoiceBlob3D.tsx`**
   - Rimuovere tutto il codice Three.js (Canvas, shader, geometria)
   - Sostituire con un semplice elemento `<video>` HTML che:
     - Carica il file WebM da `/videos/voice-blob.webm`
     - Riproduce in loop automatico, senza audio, inline
     - Ha sfondo trasparente (garantito dal canale alpha del WebM)
     - Mantiene la stessa interfaccia props (`status`, `muted`, `baseColor`)
   - Mantenere l'effetto glow colorato attorno al video (già presente)
   - Regolare velocità di riproduzione (`playbackRate`) in base allo stato vocale

4. **Nessuna modifica a `WidgetPreviewPanel.tsx`**
   - L'interfaccia del componente resta identica

### Dettaglio tecnico
- **Formato WebM VP9 con alpha**: supportato da Chrome, Edge, Firefox — i browser principali per i widget
- **Fallback Safari**: Safari non supporta WebM con alpha; se necessario in futuro si può aggiungere un video HEVC `.mov` come fallback
- **Playback rate per stato**: `connecting` = 0.5x, `listening` = 1x, `processing` = 2x — per dare dinamicità in base allo stato vocale
- **Rimozione dipendenze**: si possono rimuovere `@react-three/fiber` e `three` se non usati altrove

### File coinvolti
- `public/videos/voice-blob.webm` — nuovo file video (convertito da .mov)
- `src/components/builder/VoiceBlob3D.tsx` — riscrittura completa (video HTML al posto di Three.js)

