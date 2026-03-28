
## Piano: correggere il falso “installed” e far riapparire davvero il widget sullo store giusto

### Do I know what the issue is?
Sì.

Il problema non è solo “il widget non si vede”: oggi il sistema sta mescolando **stato admin** e **stato live storefront**.

Dalle verifiche fatte emerge che:
- lo store collegato in backend è `wkrgbz-jm.myshopify.com`
- per questo widget gli eventi live arrivano invece da `dalilly.myshopify.com`
- il controllo attuale considera “Installed (theme_liquid)” anche quando questo **non prova** che il widget stia davvero girando sullo storefront che ti aspetti di vedere

Quindi il builder ti mostra uno stato verde, ma in realtà manca una conferma reale che:
1. lo script sia attivo sullo storefront pubblico corretto
2. il loader parta davvero
3. il render arrivi fino in fondo sul dominio giusto

### File da aggiornare
- `src/components/builder/AddToWebsiteDialog.tsx`
- `supabase/functions/shopify-install-widget/index.ts`
- `supabase/functions/widget-loader/index.ts`
- `supabase/functions/track-widget-event/index.ts`

### Modifiche da fare

#### 1. Separare “installato in admin” da “attivo sul sito live”
In `shopify-install-widget/index.ts`:
- rendere `checkOnly` più rigoroso
- distinguere chiaramente:
  - `themeLiquidInstalled`
  - `scriptTagInstalled`
  - `adminInstalled`
  - `liveConfirmed`
- non usare più come prova sufficiente un semplice `alreadyInstalled=true`

In pratica:
- la verifica `theme.liquid` dovrà controllare la presenza del **loader atteso**, non solo marker/commenti generici
- la verifica ScriptTag dovrà confermare che il tag punti al `widgetId` corretto
- la response dovrà restituire diagnostica strutturata, non solo `method`

#### 2. Aggiungere una vera verifica storefront
Sempre in `shopify-install-widget/index.ts`:
- fare una fetch del storefront pubblico dello store collegato
- raccogliere segnali diagnostici utili:
  - URL/host effettivamente osservato
  - eventuale mismatch di dominio
  - presenza/assenza del loader nella pagina pubblica, quando rilevabile
- se admin dice “installato” ma storefront non conferma, restituire stato tipo:
  - `installed_in_admin_not_confirmed_live`
  invece di successo pieno

Questo elimina il falso positivo che oggi ti fa vedere “installed” anche se sul sito non appare nulla.

#### 3. Tracciare un evento ancora più precoce del render
In `widget-loader/index.ts` e `track-widget-event/index.ts`:
- aggiungere un evento tipo `loader_boot`
- inviarlo appena il loader parte, prima del render completo
- mantenere `widget_rendered`, `launcher_visible`, `launcher_hidden`

Così il builder potrà distinguere meglio:
- loader mai eseguito
- loader eseguito ma config/render falliti
- render completato ma launcher nascosto/coperto
- widget davvero visibile

#### 4. Rendere il pannello Shopify onesto e diagnostico
In `AddToWebsiteDialog.tsx`:
- non mostrare più il box verde “Widget installed!” come stato rassicurante se manca conferma live
- sostituirlo con stati più precisi, ad esempio:
  - “Installato in admin, ma non confermato sul sito live”
  - “Widget attivo su un altro dominio”
  - “Loader avviato ma widget non renderizzato”
  - “Widget renderizzato ma launcher nascosto”
- mostrare il dominio collegato e il dominio dove il widget è stato davvero visto
- se c’è mismatch (`wkrgbz...` vs `dalilly...`), evidenziarlo come problema principale

#### 5. Rendere il reinstall coerente con la realtà
Nel flusso reinstall:
- usare i nuovi campi diagnostici per aggiornare il messaggio finale
- se la post-verifica live fallisce, non dire più “Installed!” o “Verified!” in verde
- mostrare invece un messaggio esplicito che l’installazione admin è presente ma il widget non è ancora confermato sullo storefront

### Risultato atteso
Dopo queste modifiche:
- il builder smetterà di mostrarti un “installed” ingannevole
- sapremo se il widget:
  - non viene caricato affatto
  - parte ma crasha prima del render
  - è attivo su un dominio diverso da quello collegato
  - è renderizzato ma nascosto dal tema
- il pannello Shopify ti dirà finalmente **la verità sullo stato live**
- sarà molto più semplice ripristinare il widget sul sito corretto

### Nota tecnica importante
Non prevedo modifiche al database né all’autenticazione.
Il fix è tutto su:
- diagnostica installazione
- conferma storefront reale
- telemetria loader/render
- UI di stato nel builder
