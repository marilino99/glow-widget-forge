

## Piano: Fix "Link products" — mostrare lista prodotti cliccabile

### Problema
Cliccando "Link products" sotto un video nella sezione Inspire Me, non succede nulla visibilmente. Due cause:

1. Se `productCards` è vuoto (nessun prodotto nell'e-commerce), il dropdown non si apre perché la condizione `productCards.length > 0` lo blocca — e non c'è messaggio di fallback.
2. Se `linkedProductIds` non è presente nell'oggetto video (undefined), il check `.includes()` potrebbe fallire silenziosamente.

### Modifiche

**File: `src/components/builder/AppearancePanel.tsx`**

1. **Aggiungere fallback quando non ci sono prodotti**: sotto il bottone "Link products", se `expandedInspireVideoId === video.id` ma `productCards.length === 0`, mostrare un messaggio tipo "No products available. Add products in the Product Carousel section first."

2. **Migliorare la UI della lista prodotti**: quando ci sono prodotti, mostrare anche l'immagine del prodotto (thumbnail) e il prezzo accanto al titolo, per rendere la selezione più chiara — stesso pattern già presente in `InspireMePanel.tsx` (righe 147-165).

3. **Assicurarsi che `linkedProductIds` sia sempre un array**: aggiungere un fallback `video.linkedProductIds || []` nel rendering per evitare errori se la proprietà è undefined.

### Risultato
Cliccando "Link products" si espande un dropdown con la lista dei prodotti (con immagine, titolo, prezzo) selezionabili tramite checkbox per collegare i prodotti al video. Se non ci sono prodotti, appare un messaggio guida.

