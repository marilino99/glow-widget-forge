

## Piano: Allineare stile discovery chips nel widget live alla preview

### Problema
I chip delle categorie (discovery chips) nel widget live sono troppo grandi perché ereditano lo stile `.wj-chat-chip` pensato per i chip iniziali (padding 10px 16px, font 14px). Nella preview sono molto più compatti: font 11px, padding ~6px 10px, gap 5px.

### Modifiche

**`supabase/functions/widget-loader/index.ts`** — 2 modifiche:

1. **Riga ~1844** — Aggiornare lo stile inline del container dei discovery chips:
   - Cambiare `gap:6px` → `gap:5px`

2. **Riga ~1846** — Aggiungere una classe separata `wj-dynamic-chip` con override di stile per i discovery chips, oppure applicare stile inline sui chip dinamici per renderli compatti:
   - `font-size:11px` (invece di 14px ereditato)
   - `padding:6px 10px` (invece di 10px 16px ereditato)
   - `white-space:nowrap` mantenuto

3. **Nel blocco CSS** (righe ~488-489) — Aggiungere regola per `.wj-dynamic-chip` che sovrascrive `.wj-chat-chip`:
   ```css
   .wj-dynamic-chip {
     font-size: 11px !important;
     padding: 6px 10px !important;
   }
   ```

Questo renderà i discovery chips identici alla preview: compatti, 3 per riga, allineati alla larghezza della bolla del messaggio.

