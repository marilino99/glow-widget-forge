
## Ricreare l'effetto aurora Hostinger

L'immagine di riferimento mostra un effetto molto specifico: il viola scuro in alto sfuma attraverso una "nebulosa" viola brillante laterale (concentrata a sinistra) per poi dissolversi in bianco puro in basso. La chiave e' che il viola non e' centrato ma si espande asimmetricamente dai lati.

### Analisi del riferimento

- **Top**: Blu notte solido (`#110c29`) -- deve combaciare con la sezione Features
- **Centro**: Una grande nuvola viola brillante, piu' intensa sul lato sinistro, che si estende orizzontalmente
- **Bottom**: Sfumatura morbida verso bianco puro, con il viola che si dissolve gradualmente
- Il viola e' molto saturo e luminoso al centro, non opaco/scuro

### Cosa cambiare

**File: `src/components/landing/DashboardPreview.tsx`**

Riscrivere il background gradient con questi layer:

1. **Layer superiore** (linear-gradient): `#110c29` solido in alto che sfuma in trasparente -- garantisce la continuita' con Features
2. **Nebula centrale-sinistra** (radial-gradient): Un grande alone viola brillante (`#7c3aed` con alta opacita') posizionato a circa 30% orizzontale e 25% verticale, molto largo (180% width) per creare l'effetto "nuvola" che si estende
3. **Nebula centrale-destra** (radial-gradient): Un secondo alone viola piu' tenue posizionato a destra (~70%) per bilanciare ma mantenere l'asimmetria
4. **Glow viola intenso** (radial-gradient): Un piccolo nucleo molto brillante al centro-alto per dare profondita'
5. **Fade bianco** (linear-gradient): Da trasparente a bianco nella meta' inferiore

### Dettagli tecnici

```text
Layer 1: linear-gradient(180deg, #110c29 0%, #110c29 8%, rgba(17,12,41,0.85) 18%, transparent 45%)
Layer 2: radial-gradient(ellipse 180% 80% at 30% 20%, rgba(124,58,237,0.5) 0%, rgba(109,40,217,0.2) 40%, transparent 70%)
Layer 3: radial-gradient(ellipse 150% 70% at 75% 30%, rgba(139,92,246,0.3) 0%, transparent 65%)
Layer 4: radial-gradient(ellipse 80% 50% at 50% 15%, rgba(91,33,182,0.4) 0%, transparent 60%)
Layer 5: linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.6) 55%, #ffffff 70%)
backgroundColor: '#ffffff'
```

- Nessun altro file viene modificato
- Il padding e il contenuto restano invariati
