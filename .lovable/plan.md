

# Fix: Timestamp non visibile nella lista conversazioni

## Problema
Il componente `ScrollArea` di Radix non propaga correttamente i vincoli di larghezza al suo viewport interno. Il contenuto si espande oltre i 288px (w-72) del container, spingendo il timestamp fuori dallo schermo.

## Soluzione
Aggiungere `className="w-full"` al viewport della ScrollArea, oppure forzare `max-w-full` / `overflow-hidden` sul div interno alla ScrollArea, in modo che il layout `grid-cols-[1fr_auto]` funzioni correttamente entro i limiti del container.

## Dettagli tecnici

**File: `src/components/builder/ConversationsPanel.tsx`**

1. Aggiungere `overflow-hidden` al div `space-y-0.5 p-1.5` che contiene la lista delle conversazioni, per forzare il contenuto a rispettare la larghezza del parent.

2. Aggiungere `overflow-hidden` anche al singolo `button` di ogni conversazione, in modo che il layout grid interno non possa espandersi oltre.

3. In alternativa (o in aggiunta), sovrascrivere lo stile del viewport della ScrollArea passando una classe custom che forza `overflow-x: hidden` e `max-width: 100%`.

Queste modifiche garantiscono che il testo del titolo venga troncato (`truncate`) e il timestamp resti sempre visibile a destra.

