

## Piano: Blob vocale creato in After Effects

### Formato richiesto: Lottie (JSON)

Lottie è il formato ideale perché:
- Leggero (JSON vettoriale, pochi KB)
- Controllabile via codice (velocità, segmenti, direzione)
- Qualità perfetta a qualsiasi risoluzione
- Supporto nativo React con `lottie-react`

### Guida passo passo in After Effects

**1. Installa il plugin Bodymovin**
- Vai su Window → Extensions → Bodymovin (se non l'hai, scaricalo da [aescripts.com/bodymovin](https://aescripts.com/bodymovin/) o cercalo su Adobe Exchange)

**2. Crea la composizione**
- Dimensioni: **400×400 px** (quadrato)
- Frame rate: **30 fps**
- Sfondo: **trasparente** (NO sfondo nero)

**3. Crea 3 animazioni (segmenti) nella stessa composizione**
Dividi la timeline in 3 segmenti consecutivi:

```text
Frame 0–90 (3s)    → "connecting"  — blob quasi fermo, leggero respiro
Frame 91–180 (3s)  → "listening"   — movimento calmo, organico
Frame 181–270 (3s) → "processing"  — deformazioni intense, rapide
```

Ogni segmento deve essere **loopabile** (ultimo frame = primo frame del segmento).

**4. Regole per compatibilità Lottie**
- Usa SOLO shape layers (no immagini raster, no video)
- NO effetti After Effects (blur, glow, ecc.) — non supportati
- Usa gradienti, maschere, e trasformazioni (posizione, scala, rotazione, opacità)
- Per l'effetto glossy/lucido: usa gradienti radiali bianchi semitrasparenti sopra la forma
- Per il colore: usa un colore placeholder (es. `#3B82F6`) — lo sostituiremo via codice con il colore scelto dall'utente

**5. Esporta con Bodymovin**
- Window → Extensions → Bodymovin
- Seleziona la composizione
- Settings: Standard, NO assets
- Clicca Render → ottieni un file `.json`

**6. Testa l'animazione**
- Vai su [lottiefiles.com](https://lottiefiles.com) e trascina il JSON per verificare che funzioni

### Cosa farò io dopo

Una volta che carichi il file `.json` su Lovable:

1. Installo `lottie-react` nel progetto
2. Riscrivo `VoiceBlob3D.tsx` → `VoiceBlobLottie.tsx`
3. Implemento il cambio segmento in base allo stato vocale (`connecting`/`listening`/`processing`)
4. Sostituisco il colore placeholder con il colore scelto dall'utente (modificando il JSON a runtime)
5. Rimuovo le dipendenze Three.js non più necessarie

### Riepilogo formati

| Cosa | Valore |
|------|--------|
| Formato export | Lottie JSON (Bodymovin) |
| Dimensioni comp | 400×400 px |
| Frame rate | 30 fps |
| Sfondo | Trasparente |
| Segmenti | 3 (connecting, listening, processing) |
| Durata per segmento | 3 secondi (90 frame) |
| Solo shape layers | Sì |
| Colore base placeholder | #3B82F6 |

