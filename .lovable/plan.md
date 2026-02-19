

## Fix: Allineare la posizione del widget live con la preview

### Problema
Nel sito live, il popup del widget si apre troppo in alto rispetto all'icona del bottone. Nella preview del builder, il popup si apre esattamente dalla stessa posizione del bottone (lo sostituisce visivamente). Nel loader live invece c'e' un gap di 14px che spinge il popup piu' in alto del dovuto.

### Soluzione
Cambiare il posizionamento di `#wj-pop` nel widget-loader da `bottom:calc(100% + 14px)` a `bottom:0`, cosi' il bordo inferiore del popup si allinea al bordo inferiore del container (dove si trova il bottone), esattamente come accade nella preview.

### Dettagli tecnici

**File**: `supabase/functions/widget-loader/index.ts`

1. **CSS non-iframe (riga 249)**: cambiare `bottom:calc(100% + 14px)` in `bottom:0` per `#wj-pop`
2. **CSS iframe (riga 139)**: verificare che anche la versione iframe sia coerente (attualmente non ha bottom, solo centering)

Questo allineera' il popup del widget live esattamente alla stessa altezza della preview nel builder.

