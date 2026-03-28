

## Piano: Aggiornamento batch dei chip per tutti i widget attivi

### Situazione
- Tutti i widget hanno `custom_chips = null`
- La logica di auto-generazione nel `widget-config` li genererà al prossimo caricamento, ma il user vuole aggiornarli **adesso** proattivamente
- Bisogna distinguere e-commerce (hanno prodotti o Shopify) da non-e-commerce

### Approccio
Creare un **edge function one-off** (`batch-generate-chips`) che:

1. Carica tutti i widget con `custom_chips IS NULL`
2. Per ogni widget, controlla se è e-commerce (`product_cards > 0` oppure `shopify_connections` presente)
3. **Se e-commerce**: imposta i chip tradotti di default (es. "Find the right product for me", "Track my order", "I need more information" — nella lingua del widget)
4. **Se non e-commerce**: raccoglie contesto (chatbot_instructions, FAQ, training_chunks) e chiama l'AI per generare 3 chip pertinenti
5. Salva i chip generati nel DB

### File coinvolti
- **Nuovo**: `supabase/functions/batch-generate-chips/index.ts` — edge function che esegue il batch
- Nessuna modifica ad altri file

### Dettagli tecnici
- Rate limiting: delay di 500ms tra chiamate AI per evitare 429
- Batch size: processa max 20 widget per invocazione (per evitare timeout 60s)
- Fallback: se AI fallisce per un widget, salta e continua col prossimo
- I chip e-commerce di default vengono mappati dalla lingua del widget (en/it/es/fr/de/pt)
- Dopo il deploy, lo invochiamo una volta per aggiornare tutti i widget esistenti

