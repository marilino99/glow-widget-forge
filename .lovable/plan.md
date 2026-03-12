

## Problema

Lo snippet iniettato in `theme.liquid` tramite l'Assets API viene sovrascritto quando un tema custom (costruito su un'altra piattaforma) viene ri-deployato su Shopify. Questo perché il file `theme.liquid` viene completamente sostituito ad ogni deploy esterno, eliminando lo snippet del widget.

## Soluzione: ScriptTag API

Shopify offre la **ScriptTag API**, che registra script a livello di app (non nel tema). Gli script creati tramite ScriptTag:
- Sopravvivono ai deploy/aggiornamenti del tema
- Vengono caricati automaticamente su tutte le pagine dello store
- Vengono rimossi automaticamente quando l'app viene disinstallata

Il widget-loader supporta già la lettura del `widgetId` dal query string (`?widgetId=xxx`), quindi non serve modificare il loader.

## Piano

### 1. Aggiungere lo scope `write_script_tags` all'OAuth

In `supabase/functions/shopify-oauth-start/index.ts`, aggiungere `write_script_tags` alla lista degli scope OAuth. Gli utenti esistenti dovranno riconnettere lo store per ottenere il nuovo permesso.

### 2. Aggiornare `shopify-install-widget` per usare ScriptTag API

Invece di modificare `theme.liquid`, la funzione:
- Chiama `GET /admin/api/2024-01/script_tags.json` per verificare se esiste già uno ScriptTag Widjet
- Se non esiste, chiama `POST /admin/api/2024-01/script_tags.json` con:
  ```json
  {
    "script_tag": {
      "event": "onload",
      "src": "https://.../functions/v1/widget-loader?widgetId=<ID>"
    }
  }
  ```
- Per `checkOnly`, verifica la presenza dello ScriptTag senza crearlo

### 3. Aggiornare `shopify-uninstall-widget` per rimuovere lo ScriptTag

Invece di modificare `theme.liquid`:
- Lista gli ScriptTag esistenti
- Elimina quelli che contengono `widget-loader` nell'URL

### 4. Fallback per temi con snippet legacy

Se il tema contiene ancora il vecchio snippet iniettato in `theme.liquid`, la funzione di uninstall lo rimuove anche da lì per pulizia.

## Impatto

- Gli utenti con temi custom non perderanno più il widget dopo un redeploy del tema
- Gli utenti esistenti con temi nativi Shopify continueranno a funzionare normalmente
- Serve riconnettere lo store per ottenere il nuovo scope `write_script_tags`

