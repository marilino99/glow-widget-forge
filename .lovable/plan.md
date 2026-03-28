

## Piano: Debug widget invisibile sullo store connesso

### Analisi della situazione

Dalla diagnostica nel tuo screenshot:
- **Admin tag**: ✓ Installato (il codice è nel tema)
- **Live storefront**: ✓ Confermato (il codice appare nell'HTML pubblico dello store)
- **Loader boot**: ✓ Sì (lo script si carica)
- **Impressions**: 0 (il widget non completa il render)
- **Warning**: Il widget è attivo su `dalilly.myshopify.com` ma NON sul tuo store connesso `wkrgbz-jm.myshopify.com`

Questo significa che il **loader parte** ma il **render crasha** sul tuo store. Il fix precedente (creazione del `btn`) è presente nel codice sorgente ma potrebbe non essere stato deployato correttamente, oppure c'è un altro errore runtime.

### Problemi identificati nel codice

Ho verificato il `widget-loader/index.ts` attuale e il launcher `btn` è correttamente creato (riga 1309). Tuttavia ci sono due problemi residui:

1. **Cache del browser/CDN**: Lo store Shopify potrebbe ancora servire la versione cached del widget-loader (quella senza il `btn`). Il `cacheBust` viene aggiunto solo al momento dell'installazione, non quando il widget viene caricato dal visitatore.

2. **Il `loader_boot` non è filtrato per dominio**: La diagnostica mostra "Loader boot: Yes" ma non distingue se il boot è avvenuto sullo store connesso o su `dalilly.myshopify.com`.

### Modifiche proposte

**File: `supabase/functions/shopify-install-widget/index.ts`**
- Aggiungere un parametro `&_t=timestamp` al loader URL nel `theme.liquid` per forzare il bypass della cache ogni volta che si reinstalla
- Questo garantisce che lo store carichi sempre l'ultima versione del widget-loader

**File: `src/components/builder/AddToWebsiteDialog.tsx`**  
- Filtrare anche l'evento `loader_boot` per dominio dello store connesso (attualmente controlla tutti gli eventi)
- Se il loader non ha bootato sullo store connesso, mostrare chiaramente "Loader boot not detected on your store"
- Aggiungere un bottone "Force Reinstall" che rimuove e reinstalla il widget, forzando un nuovo cache-bust

**File: `supabase/functions/widget-loader/index.ts`**
- Nessuna modifica strutturale necessaria — il codice del launcher è già corretto
- Il problema è solo che la versione deployata potrebbe non corrispondere al codice sorgente

### Azione principale
La reinstallazione con `forceReinstall: true` dovrebbe generare un nuovo URL con cache-bust, costringendo lo store a caricare la versione aggiornata del widget-loader. Il piano include rendere questo processo più affidabile e diagnosticabile.

