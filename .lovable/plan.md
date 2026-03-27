

## Piano: Product card a mazzo con animazione

### Concetto
Le product card appaiono dal basso con animazione e sono impilate/sovrapposte come un mazzo di carte (solo la prima visibile, le altre dietro sfalsate). Cliccando, si espandono tutte con animazione fan-out.

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`** (righe 2456-2507)

1. **Stato locale**: aggiungere `inspireCardsExpanded` (Record<number, boolean>) per tracciare quale slide ha le card espanse.

2. **Layout "a mazzo" (chiuso)**: quando le card non sono espanse, sovrapporre le card con `position: absolute` e offset progressivo (`bottom: 0, 4px, 8px`) + leggera scala decrescente (`scale(0.95)`, `scale(0.90)`). Solo la card in primo piano è completamente visibile, le altre spuntano dietro con un piccolo offset. Il wrapper ha un'altezza fissa contenuta.

3. **Layout "espanso" (aperto)**: al click sul mazzo, le card si espandono in colonna verticale (`flex-col gap-2`) con transizione animata (`transition-all duration-300`). Ogni card entra con un leggero delay progressivo (via `transition-delay`).

4. **Animazione ingresso dal basso**: il container ha un'animazione CSS di slide-up al montaggio (`@keyframes slideUpCards` in style inline: `translateY(20px) → translateY(0)` + `opacity 0 → 1`).

5. **Click per chiudere**: cliccando di nuovo, le card tornano a mazzo con transizione inversa.

6. **Badge conteggio**: quando chiuso, mostrare un piccolo badge con il numero di prodotti (es. "3 products").

### Risultato
Le card appaiono dal basso con animazione, si presentano sovrapposte a mazzo, e si espandono a ventaglio al click dell'utente.

