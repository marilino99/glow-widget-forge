
Obiettivo: correggere la diagnostica e il loader perché oggi le impressioni vengono conteggiate, ma questo non prova che il widget sia davvero visibile.

Cosa ho verificato
- Il widget live collegato allo store è `c13254e4-5650-4868-bb2b-535c6187a5a2`.
- La configurazione reale è:
  - `widget_type: popup`
  - `widget_position: right`
  - nessun `custom_css`
  - nessun `custom_js`
- Quindi il widget non è invisibile per colpa di codice personalizzato inserito nel builder.
- Ho trovato il problema più importante nel file `supabase/functions/widget-loader/index.ts`:
  - oggi `impression` e `widget_rendered` vengono inviati prima di `d.body.appendChild(root)`.
  - quindi i contatori attuali dimostrano solo che lo script è partito e ha caricato la config, non che il launcher sia comparso davvero sul sito.
- Inoltre una fetch pubblica dello store restituisce ancora il template “Opening soon / password page”, quindi va distinta anche la visibilità pubblica reale da quella vista dentro una sessione admin.

Diagnosi probabile
Ci sono due problemi sovrapposti:
1. Diagnostica falsa positiva
- il builder ti mostra segnali “buoni” anche quando il widget potrebbe non essere ancora nel DOM o non essere visibile.

2. Problema reale di visibilità sul storefront
- il launcher popup viene probabilmente montato ma resta:
  - fuori viewport
  - coperto da un altro layer del tema
  - nascosto da stile effettivo del tema host
  - oppure la pagina pubblica che vede un visitatore non è la stessa che genera gli eventi.

Piano di implementazione
1. Sistemare il tracciamento nel loader
- In `supabase/functions/widget-loader/index.ts`:
  - spostare `widget_rendered` dopo il vero `appendChild` nel DOM
  - mantenere `impression` come “script caricato”, ma separarlo da “widget visibile”
  - aggiungere nuovi eventi diagnostici nell’attuale tabella eventi, senza cambiare database:
    - `launcher_visible`
    - `launcher_hidden`
    - `storefront_blocked` (se rileviamo pagina non realmente pubblica o stato bloccato)

2. Aggiungere una verifica reale di visibilità
- Sempre nel loader, dopo il mount:
  - leggere `getComputedStyle`
  - leggere `getBoundingClientRect`
  - controllare se il bottone ha dimensioni > 0
  - controllare se è dentro il viewport
  - usare `elementFromPoint` al centro del launcher per capire se è coperto da un overlay del tema
- Se il launcher risulta nascosto o coperto:
  - forzare un secondo pass di stile inline più aggressivo
  - registrare l’evento diagnostico corretto invece di segnare falsamente “rendered”

3. Rendere la diagnostica Shopify davvero affidabile
- In `src/components/builder/AddToWebsiteDialog.tsx`:
  - separare chiaramente questi stati:
    - Tag installato
    - Script eseguito
    - Launcher visibile
    - Storefront pubblico bloccato/non raggiungibile
  - mostrare warning chiaro quando ci sono impression ma nessun `launcher_visible`
  - non usare più `widget_rendered` come prova di visibilità finché non è tracciato nel punto giusto

4. Aggiungere un probe storefront pubblico
- Nel builder aggiungere un controllo che provi la pagina pubblica reale dello store e segnali se sta ancora servendo la pagina password / opening soon / contenuto diverso.
- Questo serve a distinguere:
  - “tu lo vedi da admin”
  - “un visitatore pubblico lo vede davvero”

5. Rieseguire la validazione finale del flusso
- Dopo il fix:
  - verificare installazione Shopify
  - verificare che il launcher popup risulti `launcher_visible`
  - verificare che il builder non mostri più falsi positivi
  - usare la nuova diagnostica per capire subito se il problema residuo è:
    - CSS del tema
    - overlay del tema
    - storefront pubblico non realmente aperto

File da toccare
- `supabase/functions/widget-loader/index.ts`
- `supabase/functions/track-widget-event/index.ts`
- `src/components/builder/AddToWebsiteDialog.tsx`

Dettaglio tecnico importante
Il punto chiave è questo: oggi il sistema sta contando eventi troppo presto. Quindi il messaggio “il widget c’è ma è invisibile” è coerente con il codice attuale, perché i log non stanno ancora misurando la visibilità reale, ma solo l’avvio dello script.

Modifiche database
- Nessuna migrazione necessaria.
- Uso solo nuovi `event_type` nella tabella `widget_events` già esistente.

Risultato atteso
Dopo questo fix sapremo con precisione se:
- il widget è davvero visibile,
- è montato ma coperto dal tema,
- oppure la pagina pubblica dello store non è quella che stiamo assumendo.
In pratica smetteremo di affidarci a impressioni “fuorvianti” e avremo finalmente un check reale di visibilità live.
