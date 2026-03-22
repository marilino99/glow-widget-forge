
Obiettivo: rendere i chip dinamici come “Clothing” identici alla widget preview e far sì che restino sempre allineati alla message box sopra, senza rompersi di nuovo quando tocchiamo gli altri chip.

### Causa probabile
Nel live i chip discovery stanno ancora appoggiandosi allo stile generico dei quick chips (`.wj-chat-chip` + override parziale `.wj-dynamic-chip`). Questo li rende fragili: ogni modifica ai chip iniziali può alterare di nuovo dimensioni, larghezza e allineamento.

### Piano
1. **Separare definitivamente i discovery chips dai quick chips**
   - In `supabase/functions/widget-loader/index.ts` creare classi dedicate solo per i chip generati dalle risposte AI, invece di riutilizzare `.wj-chat-chip`.
   - Esempio concettuale:
     - wrapper messaggio AI
     - container chip discovery
     - bottone chip discovery

2. **Far combaciare il blocco chip con la bolla sopra**
   - Rendere il wrapper del messaggio AI uguale alla struttura della preview: un contenitore unico che include bolla + chip.
   - Dare al container dei chip una larghezza e un comportamento coerenti con la bolla, così “Clothing” parte esattamente sotto il bordo della message box e non si sposta.

3. **Blindare lo stile contro CSS del sito ospitante**
   - Sui discovery chips aggiungere reset completi e regole forti (`display`, `width:auto`, `max-width`, `font-family`, `line-height`, `letter-spacing`, `text-transform`, `appearance`, `box-sizing`, `margin`, `padding`, `font-size`) per evitare che il CSS del sito live li deformi.
   - Mantenere lo stile compatto della preview: font piccolo, padding compatto, gap da 5px.

4. **Aggiornare l’HTML renderizzato**
   - Nel punto in cui vengono renderizzati `msg.metadata.chips`, sostituire l’attuale markup con il nuovo markup dedicato.
   - Tenere separati:
     - chip iniziali del welcome flow
     - chip dinamici di discovery/category/goal

5. **Applicare la stessa logica in entrambe le varianti CSS del loader**
   - Aggiornare sia il blocco CSS normale sia quello “hardened” con `!important`, così il comportamento resta identico in tutti i contesti di embed e non si rompe più tra preview/live.

### File coinvolto
- `supabase/functions/widget-loader/index.ts`

### Risultato atteso
- “Clothing” e gli altri discovery chips saranno visivamente uguali alla widget preview.
- Il primo chip combacerà con la larghezza/allineamento della message box sopra.
- Le future modifiche ai quick chips non romperanno più i discovery chips, perché avranno stile e struttura separati.

### Dettagli tecnici
Intervento principale:
- decoupling da `.wj-chat-chip`
- nuovo wrapper stabile per messaggio AI + chips
- nuovo set di classi dedicate per i discovery chips
- reset CSS più aggressivo per proteggere il live dal CSS esterno
- nessuna modifica database o backend necessaria
