

## Piano: Ridurre dimensioni blob e prevenire clipping

### Problema
Il blob con le deformazioni ampie (noise layer 0 con peso 3.0) si espande oltre i bordi del contenitore 160x160, causando un effetto "tagliato". La sfera base ha raggio 1 ma le deformazioni aggiungono fino a ~3.0+ unità di displacement.

### Modifiche a `VoiceBlob3D.tsx`

1. **Ridurre il raggio base della sfera** da 1.0 a 0.7 — lascia più margine per le deformazioni
2. **Allontanare la camera** da 2.8 a 3.5 — inquadra il blob con più spazio attorno
3. **Ridurre i pesi del noise** per contenere l'espansione massima:
   - Layer 0: da 3.0 a 1.8
   - Layer 1: da 1.2 a 0.7
   - Pulse breathing: da 0.25 a 0.15
4. **Ridurre il fattore direzionale** da 0.3 a 0.15 — meno allungamento estremo
5. **Ridurre targetIntensity** per ogni stato (~60% dei valori attuali):
   - listening: 0.15 (era 0.2)
   - processing: 0.35 (era 0.5)
6. **Breathing scale** ridotto: da 0.06 a 0.03

### Risultato
Il blob mantiene le stesse forme organiche e movimenti viscosi ma resta sempre contenuto nel riquadro senza clipping ai bordi.

