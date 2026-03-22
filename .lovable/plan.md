

## Piano: Product card a larghezza piena del widget

### Problema
Le product card sono dentro il wrapper del messaggio bot che ha `max-w-[70%]`, quindi vengono tagliate. I chip devono restare dentro quel wrapper, ma le product card devono estendersi fino al bordo del widget.

### Soluzione
Spostare il rendering delle product card **fuori** dal wrapper `max-w-[70%]` del messaggio bot, rendendole un elemento separato a larghezza piena sotto il messaggio.

### Modifiche

**`src/components/builder/WidgetPreviewPanel.tsx`** (2 punti: riga ~1064 e ~1589)
- Spostare il blocco `{msg.metadata?.products && ...}` fuori dal `<div className="flex w-fit max-w-[70%]...">`, posizionandolo dopo la chiusura di quel div ma ancora dentro il `<div className="flex items-start gap-2 mt-3">` del messaggio bot.
- Rimuovere il vincolo di larghezza: le card occupano `w-full` del container chat.
- Aggiungere un `pl-8` (padding-left uguale all'avatar + gap) per allineare l'inizio delle card con la bolla.

**`supabase/functions/widget-loader/index.ts`**
- Stessa logica: nel rendering HTML del messaggio bot, spostare il div dei prodotti fuori dal wrapper con `max-width:70%`.
- Dare al container prodotti `width:100%` e un `padding-left` coerente con l'avatar.

### Risultato
- I chip restano allineati alla message box (max-w-[70%]).
- Le product card si estendono fino al bordo destro del widget, senza tagli.

