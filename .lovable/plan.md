

## Piano: Chip di azione rapida personalizzabili per ogni business

### Problema
I 3 chip ("Find the right product for me", "Track my order", "I need more information") sono hardcoded nel widget-loader e uguali per tutti. Un ristorante, uno studio legale o un hotel vedono chip pensati per e-commerce.

### Soluzione
Aggiungere 3 campi personalizzabili nella configurazione widget. Il business può scrivere i propri testi, e se non li imposta, vengono generati automaticamente dall'AI in base al contesto del business (FAQ, prodotti, istruzioni chatbot).

### Modifiche

**1. Database — nuova colonna `custom_chips`**
Aggiungere una colonna `custom_chips` (jsonb, nullable) alla tabella `widget_configurations`:
```sql
ALTER TABLE widget_configurations ADD COLUMN custom_chips jsonb DEFAULT NULL;
```
Formato: `["Prenota un tavolo", "Vedi il menù", "Orari di apertura"]`

**2. Widget-config edge function**
Esporre `custom_chips` nella risposta JSON della configurazione.

**3. Widget-loader**
Nel render, se `cfg.custom_chips` è un array con almeno 1 elemento, usare quei testi. Altrimenti, usare i fallback tradotti correnti (`chipFind`, `chipTrack`, `chipInfo`).

**4. Builder — nuovo pannello nel builder**
Aggiungere una sezione "Quick Action Chips" (dentro la sidebar, ad esempio sotto "Contact Card") dove il business può:
- Vedere i 3 chip attuali
- Modificare il testo di ciascuno
- Opzionale: bottone "Genera con AI" che analizza FAQ + prodotti + istruzioni chatbot e suggerisce 3 chip pertinenti

**5. Hook useWidgetConfiguration**
Mappare `custom_chips` nel config load/save.

### Flusso utente
1. Business apre il builder → sezione "Quick Chips"
2. Vede 3 input con placeholder dei default tradotti
3. Può personalizzare (es. "Prenota una consulenza", "Listino prezzi", "Dove siamo")
4. Oppure clicca "Genera con AI" → l'AI suggerisce chip basati sul contesto
5. Salva → il widget live mostra i chip personalizzati

### File coinvolti
- Migration SQL (1 colonna)
- `supabase/functions/widget-config/index.ts`
- `supabase/functions/widget-loader/index.ts`
- `src/hooks/useWidgetConfiguration.ts`
- Nuovo componente builder (es. `src/components/builder/QuickChipsPanel.tsx`)
- `src/components/builder/BuilderSidebar.tsx` (aggiungere voce menu)

