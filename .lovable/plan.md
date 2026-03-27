

## Piano: Collegare "Link products" allo store invece che al Product Carousel

### Problema
Attualmente la lista prodotti nella sezione "Inspire Me" dipende dalla variabile `productCards`, che viene filtrata a riga 96 di `Builder.tsx`:
```
const productCards = shopifyConnection ? rawProductCards : [];
```
Se non c'è un collegamento Shopify, `productCards` è un array vuoto e il messaggio dice "Add products in the Product Carousel section first" — che e' sbagliato. I prodotti devono venire dallo store connesso (Shopify), non dal Product Carousel manuale.

### Modifiche

**File: `src/pages/Builder.tsx`**
1. Creare una variabile separata `storeProducts` che contiene i prodotti dello store (da `rawProductCards` filtrati per quelli con `shopify_product_id` non null), indipendentemente dal toggle del Product Carousel.
2. Passare `storeProducts` come prop dedicata (`inspireStoreProducts`) all'AppearancePanel e alla Sidebar, separata da `productCards`.

**File: `src/components/builder/AppearancePanel.tsx`**
1. Usare la nuova prop `inspireStoreProducts` invece di `productCards` nella sezione "Link products" dei video Inspire Me.
2. Cambiare il messaggio di fallback da "Add products in the Product Carousel section first" a "No store connected. Connect your Shopify store in the Integrations section to link products to videos."
3. Se lo store e' connesso ma non ci sono prodotti sincronizzati, mostrare "No products found. Sync your store catalog in the Integrations section."

**File: `src/components/builder/BuilderSidebar.tsx`**
- Aggiungere la prop `inspireStoreProducts` e passarla all'AppearancePanel.

### Risultato
La lista prodotti collegabili ai video dipende esclusivamente dalla connessione allo store (Shopify). Se non c'e' uno store connesso, appare un messaggio che guida l'utente a collegarlo. Il Product Carousel resta indipendente.

