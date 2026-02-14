

## Semplificazione Aurora — 3 strati netti

Il problema attuale: ci sono troppi layer sovrapposti con gradienti radiali posizionati ai lati, che creano un effetto confuso. La soluzione e' semplificare drasticamente a **3 strati chiari e concentrici**, tutti centrati orizzontalmente, che creano una progressione netta dall'esterno verso il centro.

### Struttura visiva (dall'alto/esterno verso il centro)

```text
+------------------------------------------+
|          #110c29 (scuro solido)           |  <-- Strato 1: base scura
|                                          |
|   ~~~~ viola scuro #3b1d8e ~~~~          |  <-- Strato 2: anello viola
|                                          |
|      ===== bianco puro =====             |  <-- Strato 3: centro bianco
|        "One place for everything"        |
|                                          |
+------------------------------------------+
```

### Cosa cambia in `DashboardPreview.tsx`

Si rimuovono tutti i 6 layer attuali e si sostituiscono con **3 layer semplici**, tutti con gradienti centrati (`at 50% 50%`):

1. **Strato 1 — Base scura**: `#110c29` solido in alto, sfuma verso il basso con un `linear-gradient`. Copre la parte superiore della sezione, uguale al colore di Features.

2. **Strato 2 — Alone viola**: Un singolo `radial-gradient` ellittico centrato che va da `#5b21b6` (viola intenso) a trasparente. Crea un anello/alone viola attorno alla zona centrale. Niente blur eccessivo, cosi' il confine e' visibile.

3. **Strato 3 — Centro bianco**: Un `radial-gradient` ellittico centrato che va da `#ffffff` solido al centro a trasparente verso l'esterno. Questo copre la zona delle scritte con bianco puro.

### Dettagli tecnici

- Niente piu' gradienti posizionati ai lati (6%/94%, 14%/86% ecc.) — tutto centrato
- Blur ridotto (max 20-25px) per mantenere i confini netti tra gli strati
- Il testo resta bianco (`text-white`) perche' lo sfondo bianco e' dietro/sotto, ma il testo e' nella zona di transizione dove il viola e' ancora visibile. Se necessario si aggiustera' il colore del testo dopo il test visivo
- Nessuna modifica al contenuto (testo, immagine, animazioni)

