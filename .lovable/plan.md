

## Piano: Nuovo Blob 3D con colore utente e reattività vocale

### Cosa viene fatto
Riscrivere completamente `VoiceBlob3D.tsx` con un nuovo blob 3D che:
1. Prende il colore scelto dall'utente come colore dominante e solido
2. Reagisce in tempo reale alla voce tramite gli stati (`connecting`, `listening`, `processing`)
3. Ha un aspetto moderno, pulito, con effetto glossy/vetroso

### Approccio: Blob sferico con distorsione noise + effetto glossy colorato

Invece dell'attuale approccio "cromo metallico grigio", il nuovo blob sarà:
- **Colore solido saturo** dell'utente come base dominante (~90%)
- **Effetto glossy/vetro** con riflessi bianchi sottili (non cromo grigio)
- **Deformazioni organiche** tramite simplex noise (mantenute, funzionano bene)
- **Reattività vocale più marcata**: `processing` causa deformazioni molto più evidenti e veloci, `listening` è calmo con breathing, `connecting` è quasi fermo
- **Glow esterno** con un alone colorato attorno al blob che pulsa con lo stato

### Dettaglio tecnico

**Fragment shader — nuovo approccio colore:**
- `baseColor` usato direttamente come colore principale (~85-90% del colore finale)
- Fresnel bianco puro per effetto vetro/glossy sui bordi
- Un singolo specular highlight bianco per il riflesso lucido
- Darkening nelle valli per profondità 3D
- Nessun environment map grigio — il colore è il protagonista

**Vertex shader — reattività migliorata:**
- Aggiungere uniform `uAudioReactivity` (0-1) che varia con lo stato
- `processing`: reactivity alta (0.8) → deformazioni ampie e veloci
- `listening`: reactivity media (0.4) → movimento calmo organico
- `connecting`: reactivity bassa (0.1) → quasi sferico, leggero breathing

**Wrapper — glow effect:**
- Aggiungere un `div` dietro il Canvas con `box-shadow` radiale colorato che pulsa
- Il colore del glow segue `baseColor`
- L'intensità del glow segue lo stato vocale

### File coinvolti
- `src/components/builder/VoiceBlob3D.tsx` — riscrittura completa
- `src/components/builder/WidgetPreviewPanel.tsx` — nessuna modifica (già passa `baseColor` e `status`)

### Risultato atteso
Un blob 3D sferico con il colore forte e saturo scelto dall'utente, aspetto glossy/vetroso moderno, che si deforma visibilmente quando riceve e processa la voce, con un alone luminoso colorato che pulsa.

