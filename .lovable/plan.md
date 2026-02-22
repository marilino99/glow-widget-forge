
# Fix: Animazione apertura bottom bar senza movimento laterale

## Problema
L'animazione di apertura della bottom bar usa `scale()` su un elemento centrato con `left:50%; transform:translateX(-50%)`. Il cambio di scala combinato con il centramento causa uno spostamento orizzontale visibile (va a destra e torna a sinistra).

## Soluzione
Rimuovere il `scale()` dall'animazione e usare solo un fade-in con un leggero slide-up. Risultato: apertura fluida e diretta, senza movimenti laterali.

**Nuova animazione:**
- 0%: opacity 0, translateY(8px)
- 100%: opacity 1, translateY(0)
- Durata: 0.35s, easing smooth

## File da modificare

### 1. `supabase/functions/widget-loader/index.ts`
- Linea ~155 (popup iframe): aggiornare `@keyframes wj-expand` rimuovendo scale
- Linea ~276 (popup standard): stessa modifica
- Linea ~422: aggiornare durata animazione su `#wj-bb-expanded.open`

Nuovo keyframe:
```
@keyframes wj-expand{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
```
Animazione: `.35s cubic-bezier(0.16,1,0.3,1)`

### 2. `tailwind.config.ts`
- Aggiornare il keyframe `widget-expand` rimuovendo scale
- Aggiornare la durata dell'animazione

### 3. `src/components/builder/WidgetPreviewPanel.tsx`
- Nessuna modifica necessaria (usa le classi Tailwind che verranno aggiornate)

## Dettagli tecnici
Il problema nasce perche `transform: scale(0.98) translateY(12px)` sovrascrive il `translateX(-50%)` usato per centrare l'elemento. Senza scale, il `translateX(-50%)` resta invariato durante l'animazione e non c'e nessun movimento orizzontale.
