

## Piano: Espandere "Inspire Me" inline nell'AppearancePanel

### Problema
Attualmente cliccando su "Inspire Me" si apre un pannello separato. L'utente vuole che si espanda verso il basso inline, come fanno le altre sezioni (FAQ, Instagram UGC, Custom Links).

### Modifiche

**File: `src/components/builder/AppearancePanel.tsx`**

1. **Rimuovere la navigazione al pannello separato**: Togliere `onOpenInspireMe` e il `ChevronRight`. Il click sulla riga header non fa più navigare.

2. **Aggiungere espansione inline**: Quando `inspireEnabled` è true, mostrare sotto la riga header un blocco espanso (come Instagram UGC) con:
   - Bottone "Upload Video" con input file nascosto
   - Lista dei video caricati con thumbnail, bottone elimina, e link prodotti
   - Bottone "Add video" per aggiungerne altri

3. **Aggiungere props necessari**: Il componente ha già `inspireEnabled` e `onInspireToggle`. Servono anche: `inspireVideos`, `onAddInspireVideo`, `onDeleteInspireVideo`, `onUpdateInspireLinkedProducts`, `productCards` (quest'ultimo già presente).

**File: `src/pages/Builder.tsx`**
- Passare le props aggiuntive (`inspireVideos`, `onAddInspireVideo`, `onDeleteInspireVideo`, `onUpdateInspireLinkedProducts`) all'`AppearancePanel`.

**File: `src/components/builder/BuilderSidebar.tsx`**
- Rimuovere la logica del pannello separato `InspireMePanel` dalla sidebar (non più necessario come pannello standalone).

### Pattern di riferimento
Stessa struttura usata per Instagram UGC (righe 1240-1297): wrapper `rounded-lg border`, header con toggle, e blocco espanso condizionale sotto `border-t`.

