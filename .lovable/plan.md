

## Posizione Widget (Left/Right) - Preview e Sito

### Cosa faremo

Collegheremo la selezione Left/Right nel pannello "Widget position & visibility" sia alla preview nel builder sia al widget installato sul sito, salvando il valore nel database.

### Passaggi

**1. Aggiungere colonna `widget_position` al database**
- Nuova colonna `widget_position` di tipo `text` con default `'right'` nella tabella `widget_configurations`

**2. Aggiornare `useWidgetConfiguration.ts`**
- Aggiungere `widgetPosition: "left" | "right"` all'interfaccia `WidgetConfiguration`
- Leggere e salvare il campo `widget_position` dal/nel database

**3. Collegare `SizePositionPanel` alla configurazione**
- Rimuovere lo stato locale `position` dal pannello
- Ricevere `widgetPosition` e `onWidgetPositionChange` come props
- Chiamare `saveConfig` quando l'utente cambia posizione

**4. Aggiornare la catena di props**
- `Builder.tsx` passa `widgetPosition` e `onWidgetPositionChange` a `BuilderSidebar`
- `BuilderSidebar` li passa a `SizePositionPanel`
- `Builder.tsx` passa `widgetPosition` a `WidgetPreviewPanel`

**5. Aggiornare `WidgetPreviewPanel.tsx`**
- Ricevere la nuova prop `widgetPosition`
- Cambiare il posizionamento del widget container da `right-5` a `left-5` o `right-5` in base al valore
- Aggiornare anche `origin-bottom-right` / `origin-bottom-left` per la vista mobile
- Posizionare il bottone collassato e le notifiche Google Reviews di conseguenza (da `items-end` a `items-start`)

**6. Aggiornare `widget-loader` (edge function)**
- Leggere `widget_position` dalla configurazione via `widget-config`
- Posizionare il widget `#wj-root` con `left` o `right` in base al valore

**7. Aggiornare `widget-config` (edge function)**
- Includere `widget_position` nella risposta JSON

### Dettagli tecnici

- **Database**: `ALTER TABLE widget_configurations ADD COLUMN widget_position text NOT NULL DEFAULT 'right';`
- **Preview (WidgetPreviewPanel)**: Il div alla riga 755 cambiera' da `bottom-5 right-5` a `bottom-5 ${widgetPosition === 'left' ? 'left-5' : 'right-5'}`
- **Widget loader**: Il CSS di `#wj-root` usera' `left:20px` o `right:20px` in base alla config
- **Bottone collassato**: Da `items-end` a `items-start`/`items-end` dinamico

