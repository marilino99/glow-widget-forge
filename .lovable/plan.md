

## Fix: Add-to-Cart nel widget chat

### Problema identificato

Ho analizzato l'intero flusso dati dal database al widget. Il codice sorgente delle edge functions (`chatbot-reply`, `chatbot-preview`) include correttamente `shopifyVariantId` nei metadati dei messaggi. Tuttavia, i messaggi **gia salvati** nel database (come quello delle 13:50 di oggi) **non contengono `shopifyVariantId`** nei metadati. Questo significa che:

- Quando il widget carica messaggi vecchi dalla chat, il `varId` è vuoto
- Il widget mostra un link `<a>` alla pagina prodotto invece del `<button>` cart
- Cliccando si viene reindirizzati alla pagina prodotto

### Piano di fix

**1. Fallback lato widget-loader per messaggi senza variant ID**

Nella funzione `renderMessage` del `widget-loader`, quando un prodotto nella chat non ha `shopifyVariantId` nei metadati, cercare il variant ID nella lista prodotti già caricata dal config (`products` array) facendo match per titolo. Questo risolve il problema per tutti i messaggi vecchi senza dover modificare il database.

```text
renderMessage(msg):
  per ogni prod in msg.metadata.products:
    varId = prod.shopifyVariantId
    SE varId è vuoto:
      cercare in products[] (dal config) un match per titolo
      SE trovato → usare il suo shopify_variant_id
```

**2. Stesso fallback per la sidebar search (`renderSearchResults`)**

Applicare la stessa logica di lookup anche nella funzione `renderSearchResults` del widget-loader.

**3. Verifica deployment**

Le funzioni `chatbot-reply` e `chatbot-preview` contengono già il codice corretto per salvare `shopifyVariantId` nei metadati — i nuovi messaggi saranno completi. Il fallback lato widget risolve i messaggi storici.

### File da modificare
- `supabase/functions/widget-loader/index.ts` — aggiungere lookup fallback per variant ID in `renderMessage` e `renderSearchResults`

