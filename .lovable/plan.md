

# Bottom Bar: Chiudi e Riapri con il Tondolino

## Cosa cambia
Quando il widget e impostato su "Bottom Bar":
- Cliccando la **X** sulla barra, questa si chiude e appare il **tondolino** (bottone circolare) identico a quello del widget Popup
- Cliccando il **tondolino**, la bottom bar riappare
- Le animazioni di chiusura/apertura sono le stesse del popup (collapse + button pop)

## Dettagli tecnici

### File modificato: `src/components/builder/WidgetPreviewPanel.tsx`

1. **Bottom bar**: collegare il pulsante X alla funzione `handleCollapse()` gia esistente
2. **Condizionare la visibilita della bottom bar** allo stato `isCollapsed`:
   - Se `isCollapsed === false`: mostra la bottom bar
   - Se `isCollapsed === true`: mostra il tondolino (stesso bottone circolare del popup)
3. **Il tondolino nel bottom-bar** chiama `handleExpand()` al click, che resetta `isCollapsed` a `false` e riporta la bottom bar visibile
4. Il tondolino usa lo stesso stile del popup: colore del widget, logo personalizzato o icona `?`, animazione pop

### Struttura nel codice

Il blocco `widgetType === "bottom-bar"` diventa:

```text
if bottom-bar:
  if isCollapsed:
    -> mostra tondolino (stessa logica del popup collapsed)
  else:
    -> mostra la barra orizzontale
       -> X chiama handleCollapse()
```

Nessuna modifica al database, nessun nuovo file. Solo logica UI nel `WidgetPreviewPanel`.
