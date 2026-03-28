

## Piano: Sezioni collassabili nel pannello Home Screen

### Concetto
Ogni sezione (FAQ, Custom Links, Product Carousel, Inspire Me) diventa collassabile con una freccia (ChevronDown). Quando chiusa, mostra solo l'header compatto (icona + titolo + descrizione + toggle), come nello screenshot. Quando aperta, mostra il contenuto di configurazione sotto.

### Modifiche

**File: `src/components/builder/AppearancePanel.tsx`**

1. Aggiungere uno stato `expandedSections: Set<string>` (default: tutte espanse, o tutte chiuse — meglio tutte chiuse per facilitare il riordino)

2. Separare ogni sezione in due parti:
   - **Header** (sempre visibile): icona, titolo, descrizione, grip handle a sinistra, toggle/info a destra, **più una ChevronDown** che ruota quando espansa
   - **Content** (visibile solo se la sezione è in `expandedSections`): il contenuto di configurazione attuale (FAQ items, link items, product cards, video)

3. Click sull'header (escluso toggle e grip) togga l'espansione della sezione

4. Quando collassata, la sezione ha esattamente la forma dello screenshot: una riga compatta con icona, titolo, descrizione e toggle

5. Aggiungere una `ChevronDown` nell'header che ruota a 180° quando espansa (transizione CSS `rotate-180`)

### Dettagli tecnici
- Stato locale `expandedSections` gestito con `useState<Set<string>>`
- Il toggle Switch resta cliccabile indipendentemente dallo stato di espansione (stopPropagation sul click del toggle)
- La ChevronDown va posizionata tra il testo e il toggle, o a sinistra del toggle
- Transizione smooth sull'espansione con `overflow-hidden` e animazione altezza opzionale

