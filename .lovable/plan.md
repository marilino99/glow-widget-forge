

## Piano: correggere il falso “installed” e ripristinare davvero il widget live

### Problema trovato
Dai controlli fatti emerge un problema preciso:

- lo store **attualmente connesso** è `wkrgbz-jm.myshopify.com`
- però gli **ultimi eventi live del widget** per questo widget arrivano da **un altro dominio**: `dalilly.myshopify.com`
- quindi oggi il builder può mostrare uno stato fuorviante: sembra “installato”, ma in realtà sta leggendo attività di un altro storefront o di una vecchia installazione

In più, il flusso di reinstall attuale ha due punti deboli:
1. `shopify-install-widget` considera riuscita l’installazione anche senza verificare davvero che lo snippet sia finito nel tema
2. `checkOnly` controlla solo `theme.liquid`, ma non verifica bene anche la presenza reale del `ScriptTag`

### File da aggiornare
- `src/components/builder/AddToWebsiteDialog.tsx`
- `supabase/functions/shopify-install-widget/index.ts`
- `supabase/functions/widget-loader/index.ts`

### Modifiche da fare

#### 1. Rendere i diagnostics affidabili nel builder
In `AddToWebsiteDialog.tsx`:
- filtrare i `widget_events` in base allo **store realmente connesso**
- distinguere chiaramente:
  - “widget visto sullo store connesso”
  - “widget visto su un altro dominio”
- mostrare un warning esplicito se c’è **mismatch di dominio**
- non mostrare più uno stato rassicurante basato su eventi provenienti da altri siti

#### 2. Rendere la reinstallazione realmente verificata
In `shopify-install-widget/index.ts`:
- dopo l’iniezione in `theme.liquid`, rileggere il file e verificare che lo snippet sia davvero presente
- se il `replace("</body>", ...)` non inserisce nulla, restituire **errore esplicito**, non `success: true`
- dopo la creazione del `ScriptTag`, fare una verifica reale che il tag esista e punti al `widgetId` corretto
- fare in modo che `checkOnly` controlli **sia** `theme.liquid` **sia** `ScriptTag`

#### 3. Aggiungere diagnostica visiva anche per il popup live
In `widget-loader/index.ts`:
- aggiungere un controllo reale di visibilità del launcher popup dopo il mount
- tracciare eventi tipo:
  - `launcher_visible`
  - `launcher_hidden`
- così il builder potrà distinguere:
  - script non caricato
  - widget caricato ma nascosto/coperto
  - widget visibile correttamente

#### 4. Migliorare il messaggio di stato nel builder
Nel pannello Shopify:
- se lo store connesso non ha eventi recenti, mostrare chiaramente che il widget **non sta girando su quello store**
- se esistono eventi da un altro dominio, mostrarlo come informazione diagnostica
- se la verifica post-install fallisce, mostrare “installazione non confermata” invece di “reinstalled”

### Risultato atteso
Dopo queste modifiche:
- il builder smetterà di dare falsi positivi
- la reinstallazione dirà la verità sullo stato reale dello store connesso
- sapremo se il problema è:
  - installazione non applicata
  - widget caricato ma nascosto
  - mismatch tra store connesso e store controllato
- il widget live potrà essere ripristinato con una diagnosi chiara, invece di continuare a risultare “installato” senza apparire davvero

### Dettagli tecnici
- Nessuna modifica al database
- Nessuna modifica all’autenticazione
- Il focus è su:
  - verifica post-install
  - diagnostica per-store
  - telemetria di visibilità del launcher popup

