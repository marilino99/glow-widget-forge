

## Piano: Aggiungere barra di ricerca nella lista prodotti "Link products"

### Modifica

**File: `src/components/builder/AppearancePanel.tsx`**

1. Aggiungere uno stato locale `inspireProductSearch` (stringa) per il testo di ricerca.
2. Dentro il blocco espanso (riga 1370), prima della lista prodotti, inserire un `<input>` di ricerca con placeholder "Search products..." e icona Search.
3. Filtrare `inspireStoreProducts` per titolo (case-insensitive match con il testo di ricerca) prima del `.map()`.
4. Resettare il campo di ricerca quando si cambia video espanso (`expandedInspireVideoId`).
5. Aumentare leggermente `max-h` del contenitore per compensare lo spazio della barra di ricerca.

### Risultato
L'utente può digitare per filtrare i prodotti nella lista, utile quando il catalogo è grande.

