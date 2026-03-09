

## Piano: Integrazione Shopify self-service per ogni utente Widjet

### Obiettivo
Permettere a ogni utente di collegare il proprio store Shopify dal pannello **Integrations** del builder, così che Widjet possa leggere automaticamente il catalogo prodotti e usarlo nelle risposte del chatbot.

### Come funziona

L'utente inserisce il proprio **Shopify store domain** (es. `mystore.myshopify.com`) e un **Storefront Access Token** (token pubblico, read-only). Widjet usa la Storefront API di Shopify per leggere i prodotti e sincronizzarli nella tabella `product_cards`.

> **Nota**: La Storefront API di Shopify richiede un access token che l'utente genera dal pannello Shopify (Settings → Apps → Storefront API). Non serve OAuth né app Shopify custom.

---

### Modifiche previste

**1. Database — nuova tabella `shopify_connections`**

| Colonna | Tipo | Note |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | NOT NULL, unique |
| store_domain | text | es. `mystore.myshopify.com` |
| storefront_token | text | Token Storefront API (crittografato lato Shopify) |
| last_synced_at | timestamptz | Nullable |
| created_at / updated_at | timestamptz | Default now() |

RLS: ogni utente vede/modifica solo la propria riga.

**2. Edge Function — `sync-shopify-products`**

- Riceve `user_id` dal JWT autenticato
- Legge `store_domain` e `storefront_token` dalla tabella `shopify_connections`
- Chiama la Storefront API GraphQL di Shopify per ottenere i primi 50 prodotti (titolo, immagine, prezzo, URL, varianti)
- Fa upsert nella tabella `product_cards` esistente (inserisce nuovi, aggiorna esistenti, rimuove quelli non più presenti)
- Aggiorna `last_synced_at`

**3. UI — IntegrationsPanel aggiornato**

- Card Shopify diventa `available: true`
- Click su "Connect" apre un dialog con:
  - Campo **Store domain** (es. `mystore.myshopify.com`)
  - Campo **Storefront Access Token**
  - Link alle istruzioni per generare il token
  - Bottone "Connect & Sync"
- Dopo la connessione: bottone diventa "Sync now" / "Disconnect"
- Stato visibile: ultimo sync, numero prodotti sincronizzati

**4. Flusso chatbot — nessuna modifica**

Il chatbot già legge da `product_cards`. Una volta sincronizzati i prodotti Shopify, il fallback e il matching funzionano automaticamente.

---

### Sicurezza

- Il `storefront_token` è un token read-only (non può modificare lo store)
- Salvato nel database con RLS, accessibile solo dal proprietario e dal service role nell'edge function
- L'edge function usa il service role per leggere il token e chiamare Shopify

