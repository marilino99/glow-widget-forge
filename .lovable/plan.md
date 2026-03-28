

## Piano: Generazione automatica dei Quick Action Chips tramite AI

### Idea
Invece di lasciare all'utente la responsabilità di scrivere i chip, il sistema li genera automaticamente al momento del primo caricamento del widget-config, basandosi sui dati già disponibili (FAQ, prodotti, istruzioni chatbot, custom links). I chip vengono salvati nel DB e serviti nelle richieste successive senza rigenerarli ogni volta.

### Come funziona

1. **Nel `widget-config` edge function**: quando un widget viene richiesto e `custom_chips` è `null` (mai impostato), la funzione:
   - Raccoglie il contesto disponibile: titoli prodotti, domande FAQ, nomi custom links, chatbot instructions
   - Chiama il Lovable AI Gateway con un prompt che chiede 3 chip pertinenti nella lingua del widget
   - Salva i chip generati nella colonna `custom_chips` del DB (così non li rigenera ad ogni richiesta)
   - Li restituisce nella risposta

2. **Se i dati cambiano**: l'utente può sempre rigenerare dal builder con "Generate with AI", oppure scriverli manualmente

3. **Fallback**: se la generazione AI fallisce (rate limit, errore), si usano i chip tradotti di default (`chipFind`, `chipTrack`, `chipInfo`)

### Modifiche tecniche

**File: `supabase/functions/widget-config/index.ts`**
- Dopo aver caricato config, FAQ, prodotti e custom links, se `custom_chips` è null:
  - Costruire un contesto testuale (max ~500 chars) da FAQ titles + product titles + chatbot instructions
  - Chiamare `https://ai.gateway.lovable.dev/v1/chat/completions` con `LOVABLE_API_KEY`
  - Parsare la risposta JSON array di 3 stringhe
  - Salvare nel DB con un update su `widget_configurations`
  - Restituire i chip generati nel payload
- Se `custom_chips` è già valorizzato, comportamento invariato

### Vantaggi
- Zero sforzo per il business: i chip sono rilevanti dal primo momento
- Il business può comunque personalizzarli dal builder se vuole
- La generazione avviene una sola volta, non ad ogni page view

### Rischi mitigati
- **Latenza**: la generazione avviene solo la prima volta, poi i chip sono cached nel DB
- **Errori AI**: fallback ai chip tradotti di default
- **Costi**: una sola chiamata AI per widget, mai ripetuta

