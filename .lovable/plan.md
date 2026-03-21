
Obiettivo: fare un fix mirato perché oggi il widget risultava installato ma ora non compare più sullo store live.

Cosa ho verificato
- La configurazione del widget esiste ed è pubblicamente leggibile (`widget-config` risponde correttamente per il widget `c13254e4...`).
- Il loader pubblico esiste ed è raggiungibile (`widget-loader` risponde correttamente).
- Le funzioni pubbliche usate dal widget sono configurate come accessibili anche ai visitatori.
- La connessione Shopify è valida e il controllo installazione risponde ancora `alreadyInstalled: true`.
- Nel database ci sono eventi reali del widget su `https://dalilly.myshopify.com/` oggi alle 11:02–11:03, quindi il widget ha funzionato davvero poco prima.
- Però gli snapshot attuali del sito non mostrano il widget, e non stanno generando nuove impression.

Diagnosi probabile
Il problema non sembra nel widget in sé, ma nel modo in cui verifichiamo l’installazione su Shopify:
- oggi la piattaforma considera “installato” il widget se trova uno ScriptTag lato Shopify;
- però lo store live attuale non sta eseguendo davvero quel loader nella pagina che l’utente vede;
- quindi abbiamo un falso positivo: “installato” a livello API, ma non realmente visibile sul frontend.

Piano di implementazione
1. Rafforzare la verifica di installazione in `shopify-install-widget`
- Non fermarsi a “esiste uno ScriptTag”.
- Validare anche che lo ScriptTag punti esattamente al loader corretto con il `widgetId` corretto.
- Aggiungere log espliciti con:
  - dominio store usato
  - URL dello ScriptTag trovato
  - metodo usato (`script_tag` o `theme_liquid`)
  - esito finale

2. Rendere l’installazione più resiliente
- Se lo ScriptTag esiste ma il check non è affidabile, fare cleanup degli eventuali tag Widjet non coerenti e ricrearli.
- Se dopo il controllo avanzato non c’è certezza, forzare il fallback su `theme.liquid` invece di restituire “already installed”.
- Così evitiamo il caso in cui Shopify tenga un tag “presente” ma non effettivamente utile.

3. Aggiungere un controllo reale lato widget-loader
- Inviare un evento/heartbeat solo quando il bottone viene davvero montato nel DOM, non solo quando il file JS viene richiesto.
- Distinguere nei log:
  - loader richiesto
  - config caricata
  - widget renderizzato
- Questo ci permetterà di capire subito se il problema è:
  - installazione Shopify
  - caricamento JS
  - fetch config
  - render UI

4. Migliorare la diagnostica del builder
- Nel dialog “Add to website” mostrare uno stato più accurato:
  - “Tag trovato”
  - “Widget confermato live”
  - “Installazione da riparare”
- Oggi il builder dice solo “installed”, che in questo caso è fuorviante.

5. Rieseguire una reinstallazione pulita
- Dopo il fix:
  - rimuovere gli script Widjet esistenti
  - reinstallare con verifica avanzata
  - confermare che il loader corretto venga applicato al dominio live

Dettagli tecnici
File principali da toccare:
- `supabase/functions/shopify-install-widget/index.ts`
  - fix della logica `checkOnly`
  - cleanup + reinstallazione robusta
  - logging migliore
- `supabase/functions/widget-loader/index.ts`
  - heartbeat/render confirmation
  - diagnostica più chiara quando il widget viene davvero montato
- `src/components/builder/AddToWebsiteDialog.tsx`
  - stato di installazione più affidabile nel builder

Perché questa è la strada giusta
- Il backend del widget risponde.
- Il widget ha funzionato davvero sullo store poco prima.
- L’anomalia è tra “Shopify dice che c’è” e “frontend non lo mostra”.
- Quindi il fix va fatto sulla verifica/installazione, non sulla UI del widget.

Nessuna modifica database necessaria
- Non servono nuove tabelle o policy per questo fix.

Risultato atteso
Dopo il fix, il sistema non potrà più segnare come “installed” un widget che in realtà non appare sul sito, e la reinstallazione sullo store collegato tornerà affidabile.
