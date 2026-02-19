

## Fix: Angoli arrotondati stabili durante lo scroll del widget

### Problema
Quando si scorre il contenuto del widget live, gli angoli superiori perdono la forma arrotondata e diventano quadrati. Rilasciando il mouse tornano normali. Questo e' un problema noto di rendering del browser legato al compositing GPU durante lo scroll.

### Soluzione
Forzare la composizione GPU sul container `#wj-pop` con `transform: translateZ(0)` e aggiungere `border-radius` ereditato al container di scroll `#wj-scroll`. Questo garantisce che il browser mantenga il clipping degli angoli anche durante lo scroll attivo.

### Dettagli tecnici

Modifiche in `supabase/functions/widget-loader/index.ts`:

1. **`#wj-pop` (riga 243, CSS non-iframe)**: aggiungere `transform:translateZ(0)` per forzare il layer compositing GPU, impedendo al browser di "dimenticare" il border-radius durante lo scroll.

2. **`#wj-pop` (riga 138, CSS iframe)**: stessa correzione per la versione iframe.

3. **`#wj-scroll` (riga 246, CSS non-iframe e riga 141 iframe)**: aggiungere `border-radius:inherit` cosi' il container di scroll rispetta gli angoli del parent.

Queste proprieta' CSS sono standard e non hanno effetti collaterali sulle performance o sul layout esistente.

