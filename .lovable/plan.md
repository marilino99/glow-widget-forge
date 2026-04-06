

## Piano: Blob 3D ultra-fluido stile video di riferimento

### Analisi del video
Il video mostra un blob metallico astratto su sfondo nero con:
- **Forme molto ampie e asimmetriche** — non è una sfera leggermente deformata, ma si allunga e contorce in forme quasi organiche/ameboidi
- **Movimenti lentissimi e viscosi** — come mercurio pesante che si muove nello spazio zero-G
- **Pulsazione ritmica** — espansione e contrazione lenta e marcata
- **Superficie ultra-riflettente** con forti contrasti luce/ombra

### Differenze dal blob attuale
Il blob attuale ha noise troppo uniforme e veloce. Sembra una sfera "tremolante", non un fluido che si deforma pesantemente. Serve:
1. Deformazioni **molto più ampie** (il blob deve perdere la forma sferica)
2. Movimenti **più lenti** e pesanti
3. **Asimmetria** — diverse direzioni di deformazione con noise separati
4. Breathing più **marcato e lento**

### Modifiche a `VoiceBlob3D.tsx`

**Vertex shader**:
- Layer 0: frequenza bassissima (0.15), peso enorme (3.0+), velocità lentissima (0.04) — crea le grandi protuberanze asimmetriche
- Layer 1: frequenza 0.4, peso 1.2, velocità 0.1 — forme organiche secondarie
- Layer 2: frequenza 1.0, peso 0.15 — appena un accenno di dettaglio superficiale
- Rimuovere layer 3 e 4 — troppo rumore
- Aggiungere **deformazione direzionale**: moltiplicare il displacement per `(1.0 + 0.3 * sin(position.y * 2.0 + uTime * 0.15))` per creare allungamenti asimmetrici
- Pulsazione breathing più ampia: `sin(uTime * 0.3) * 0.25` (era 0.15 a 0.5)
- Ridurre perturbazione normali (fattore 2.0) per riflessi più lisci

**Fragment shader**:
- Environment map più morbida con transizioni graduali
- Una sola banda specular larga e soft
- Valley darkening più morbido (0.65-1.0)
- Specular highlight primario con esponente 30 (era 80) — più largo e diffuso

**Animazione (useFrame)**:
- Target intensity: muted 0.03, connecting 0.08, listening 0.2, processing 0.5
- Target speed: muted 0.1, connecting 0.2, listening 0.35, processing 0.7
- Lerp lentissimo: `delta * 0.6` (era 1.5) per transizioni graduali
- Rotazione ridotta: 0.06 (era 0.15)
- Breathing scale: `sin(uTime * 0.4) * 0.06` (era 0.03)
- Aggiungere oscillazione asse Z: `meshRef.current.rotation.z = sin(uTime * 0.15) * 0.08`

### File coinvolto
`src/components/builder/VoiceBlob3D.tsx` — unico file

### Risultato atteso
Un blob che si deforma in forme ampie e asimmetriche, come una goccia di mercurio che fluttua in assenza di gravità — lento, pesante, viscoso, con riflessi cromati che scivolano sulla superficie.

