

## Piano: Uniformare gli spazi tra le sezioni nel widget live

### Problema
Lo spazio tra la box "Contact us on WhatsApp" e "Discover More" è ~32px (16px di padding-bottom della contact card + 16px di margin-top della sezione inspire), mentre lo spazio tra "Discover More" e "Quick Answers" è solo ~16px (margin-top del FAQ, senza padding-bottom sulla sezione inspire).

### Soluzione
Rendere tutti gli spazi tra le sezioni uniformi a 16px, come appare nel widget preview:

**`supabase/functions/widget-loader/index.ts`**:

1. **Ridurre il padding-bottom della contact card** — cambiare `#wj-contact` da `padding:16px` a `padding:16px 16px 8px 16px` (meno spazio sotto il WhatsApp button)
2. **Oppure (approccio più pulito)**: ridurre il `margin-top` delle sezioni che seguono immediatamente la contact card, o uniformare il padding di tutte le sezioni wrapper

L'approccio più semplice e coerente:
- `#wj-contact`: mantenere `padding:16px` ma aggiungere `margin-bottom:-8px` per compensare lo spazio visivo extra
- Assicurarsi che `#wj-inspire-section`, `#wj-faq`, `#wj-links` abbiano tutti lo stesso `margin-top:16px` e `padding-bottom:0` nella versione popup

In pratica, modificare il CSS della contact card per avere padding-bottom più ridotto (es. `padding:16px 16px 8px`) così che il gap totale con la prima sezione sia ~24px, uguale allo spazio visivo tra le altre sezioni (16px margin + 8px di visual breathing).

### File coinvolto
- `supabase/functions/widget-loader/index.ts` — riga 280 (popup CSS) e righe corrispondenti nel bottom-bar CSS

### Risultato
Spazi uniformi tra tutte le sezioni della home del widget: Contact → Inspire → FAQ → Links.

