

## Piano: Blob 3D liquido e cromato

### Cosa cambia
Migliorare il `VoiceBlob3D` esistente per ottenere un effetto **metallo liquido cromato** con movimenti più fluidi e organici.

### Modifiche al fragment shader
- Sostituire il gradiente arancio piatto con un **environment map riflettente** simulato via shader (cubemap fake con colori ambiente)
- Aggiungere **riflessi Fresnel** più pronunciati — i bordi della sfera riflettono più luce, dando l'effetto cromato
- Calcolare una **normal perturbata** dal noise per riflessi che si muovono con la deformazione
- Palette: toni metallici argento/grigio con riflessi arancio del brand (#FF8C42) come accento caldo

### Modifiche al vertex shader
- Aggiungere un **4° livello di noise** a frequenza molto bassa per movimenti lenti e "pesanti" — effetto liquido viscoso
- Smoothare le transizioni tra stati con un lerp più lento (delta * 1.5 invece di delta * 3)
- Aumentare la risoluzione della sfera da 128 a 256 segmenti per superficie più liscia

### Dettagli tecnici
**File**: `src/components/builder/VoiceBlob3D.tsx` (unico file da modificare)

Fragment shader nuovo:
- Calcolo `reflect` direction dalla normal perturbata e view direction
- Matcap-style shading: mappa la normal a colori metallici (grigio chiaro → grigio scuro con riflessi)
- Fresnel edge glow con tinta arancio sottile
- Specular highlight mobile basato su `uTime`

Vertex shader:
- Noise aggiuntivo a frequenza 0.4 con peso 0.7 per ondulazioni grandi e lente
- Passare `vViewPosition` al fragment per calcolo riflessi

Nessuna dipendenza aggiuntiva — tutto via shader custom GLSL esistente.

### Risultato atteso
Un blob che sembra **mercurio liquido** / cromo fuso, con riflessi che scivolano sulla superficie mentre si deforma organicamente. Movimento più lento e viscoso, meno "rumoroso".

