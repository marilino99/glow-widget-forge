

## Piano: Mostrare i post Instagram nel widget preview

### Problema
Quando aggiungi un URL di Instagram, nel widget preview appare solo un'icona Instagram generica invece del contenuto del post. Questo perché:

1. La funzione `instagram-oembed` esiste ma **non viene mai chiamata** durante l'aggiunta di un post — il hook `addInstagramPost` salva solo l'URL senza recuperare alcuna thumbnail
2. Instagram blocca l'embedding diretto delle immagini (CORS), quindi senza thumbnail il preview mostra un placeholder vuoto

### Soluzione
Chiamare automaticamente l'edge function `instagram-oembed` quando l'utente aggiunge un post, per recuperare la thumbnail e l'autore. Se la chiamata fallisce (token non configurato o errore API), mostrare un fallback visivo migliore.

### Modifiche

**File: `src/hooks/useInstagramPosts.ts`**
1. Dopo l'inserimento nel database (riga 100), chiamare `supabase.functions.invoke("instagram-oembed", { body: { url } })` per ottenere `thumbnail_url` e `author_name`
2. Se la risposta contiene una thumbnail, aggiornare sia lo state locale che il database con `thumbnail_url` e `author_name`
3. Gestire il fallimento silenziosamente (il post resta salvato con il placeholder)

**File: `src/components/builder/WidgetPreviewPanel.tsx`**
1. Migliorare il fallback quando non c'è thumbnail (righe 2756-2759): invece dell'icona Instagram generica, mostrare un placeholder con gradiente animato (shimmer) e l'icona Instagram, così l'utente capisce che il contenuto sta caricando o non è disponibile

### Dettagli tecnici
- L'edge function `instagram-oembed` usa l'API Graph di Facebook, che richiede un `INSTAGRAM_ACCESS_TOKEN`. Se il token non è configurato, la funzione ritorna `thumbnail_url: null` — il post resta salvato ma senza anteprima visiva
- Il fetch della thumbnail è asincrono e non blocca l'aggiunta del post (l'utente vede subito il post nella lista, la thumbnail appare dopo qualche secondo)

