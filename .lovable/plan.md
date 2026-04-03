

## Piano: Blob metallico pulsante con morphing fluido

### Differenze dal video vs attuale
Il video mostra un blob metallico su **sfondo nero** che:
- Ha deformazioni molto più **ampie e fluide** — il blob cambia forma drasticamente, non solo piccole ondulazioni
- **Pulsa** — si espande e contrae ritmicamente
- Superficie altamente **riflettente/speculare** con riflessi che si muovono
- Movimenti di morphing **lenti e pesanti** — effetto viscoso marcato

### Modifiche a `VoiceBlob3D.tsx`

**Sfondo nero**: Cambiare il Canvas background da trasparente a `#000000`

**Vertex shader — morphing più aggressivo**:
- Aumentare l'ampiezza del noise layer 0 (da 1.4 a 2.0+) per deformazioni molto più ampie
- Aggiungere una **pulsazione sinusoidale** globale: `sin(uTime * 0.5) * 0.15` che espande/contrae l'intera sfera ritmicamente
- Ridurre le frequenze del noise per movimenti più larghi e lenti (0.3 invece di 0.4, 0.8 invece di 1.2)
- Mantenere i layer di dettaglio fine per la texture superficiale

**Fragment shader — riflessi più intensi**:
- Aumentare la riflessività dell'environment map (mix factor da 0.6 a 0.8)
- Environment map più contrastata: bande luminose più forti, più variazione
- Specular highlights più brillanti e ampi
- Fresnel più pronunciato per bordi ultra-luminosi

**Animazione**:
- Aumentare i target di intensità per ogni stato (listening: 0.25, processing: 0.45)
- Rotazione leggermente più veloce per far muovere i riflessi
- Aggiungere leggero "breathing" scale con `sin(uTime)`

### File coinvolto
`src/components/builder/VoiceBlob3D.tsx` — unico file

### Risultato
Un blob che sembra mercurio liquido che fluttua nel buio, con morphing ampio e pulsazioni ritmiche, molto più vicino al video di riferimento.

