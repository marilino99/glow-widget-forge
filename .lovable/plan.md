

# Widget Layout Types - Scegli il tipo di widget

## Panoramica
Aggiungere il concetto di "Widget Type" (layout) al progetto, permettendo all'utente di scegliere tra diversi stili di widget. Il tipo attuale diventa "Popup" (default), e il nuovo tipo e una "Bottom Bar" -- una barra orizzontale fissa in basso alla pagina con un campo di input, icona sparkle, microfono, espandi/comprimi, e chiudi.

## Come funziona per l'utente
1. Nella sezione **Templates** della sidebar, in alto appare un selettore "Widget Type" con due opzioni: **Popup** (attuale) e **Bottom Bar** (nuovo)
2. Selezionando "Bottom Bar", l'anteprima nel builder cambia mostrando la barra orizzontale in basso
3. I template di colore/tema sotto continuano a funzionare per entrambi i tipi
4. Il tipo "Bottom Bar" e una feature **Pro**
5. Il tipo scelto viene salvato nel database e usato dal widget-loader in produzione

## Design della Bottom Bar
Basato sullo screenshot di riferimento:
- Barra orizzontale fissa in basso alla pagina, full-width con padding laterale
- Bordi arrotondati (pill shape), sfondo bianco/chiaro con ombra leggera
- A sinistra: icona sparkle + testo placeholder (es. "Curious how we could help? - ask me anything!")
- A destra: icona microfono, icona espandi/comprimi, icona chiudi (X)
- Cliccando si espande in una chat completa (simile al popup attuale ma ancorata in basso)

## Dettagli tecnici

### Modifica al database
Aggiungere la colonna `widget_type` alla tabella `widget_configurations`:
```sql
ALTER TABLE widget_configurations
ADD COLUMN widget_type TEXT NOT NULL DEFAULT 'popup';
```

### File modificati

**`src/hooks/useWidgetConfiguration.ts`**:
- Aggiungere `widgetType: "popup" | "bottom-bar"` all'interfaccia `WidgetConfiguration`
- Mappare da/verso la colonna `widget_type` nel database

**`src/components/builder/TemplatesPanel.tsx`**:
- Aggiungere in cima al pannello un selettore per il tipo di widget (due card grandi: "Popup" e "Bottom Bar")
- Aggiungere `widgetType` all'interfaccia `WidgetTemplate`
- Il tipo "Bottom Bar" mostra un badge PRO se l'utente non e Pro
- Aggiungere la prop `widgetType` e `onWidgetTypeChange` alle props del pannello

**`src/components/builder/WidgetPreviewPanel.tsx`**:
- Accettare la nuova prop `widgetType`
- Se `widgetType === "bottom-bar"`, renderizzare l'anteprima come barra orizzontale in basso al pannello di preview, invece del popup classico
- La bottom bar mostra: icona sparkle, testo del `sayHello`, icone microfono/espandi/chiudi
- Al click sulla barra, si espande in una chat (riutilizzando la logica chat esistente)

**`src/components/builder/BuilderSidebar.tsx`**:
- Passare `widgetType` e `onWidgetTypeChange` al `TemplatesPanel`
- Aggiungere handler per salvare il tipo nel database

**`src/pages/Builder.tsx`**:
- Passare `widgetType` dal config al preview e alla sidebar

**`supabase/functions/widget-loader/index.ts`**:
- Leggere `cfg.widget_type` dalla configurazione
- Se `widget_type === "bottom-bar"`, renderizzare HTML/CSS completamente diverso: una barra orizzontale in basso al posto del bottone circolare + popup
- La barra si espande in chat al click

**`supabase/functions/widget-config/index.ts`**:
- Includere `widget_type` nella risposta della configurazione

### Flusso
1. L'utente apre Templates e seleziona "Bottom Bar" come tipo
2. L'anteprima nel builder si aggiorna immediatamente mostrando la barra
3. Il tipo viene salvato nel database
4. Il widget-loader in produzione legge il tipo e renderizza la barra invece del popup

