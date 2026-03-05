

# Fix: Timestamp troncato nella lista conversazioni

## Problema
Il viewport interno di Radix ScrollArea usa `overflow: scroll` inline, ignorando le classi CSS applicate dall'esterno. Il contenuto si espande oltre la larghezza della sidebar e il timestamp sparisce.

## Soluzione

### 1. Modificare `src/components/ui/scroll-area.tsx`
Aggiungere al viewport la classe `[overflow-x:hidden!important]` per impedire lo scroll orizzontale e forzare il contenuto a rispettare la larghezza del parent.

```tsx
<ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] [overflow-x:hidden!important]">
```

### 2. Pulire `src/components/builder/ConversationsPanel.tsx`
Rimuovere il selettore CSS hack `[&>div[data-radix-scroll-area-viewport]]:!overflow-x-hidden` dalla ScrollArea, dato che il fix e ora nel componente base.

Queste due modifiche risolvono il problema alla radice: il viewport non permettera piu al contenuto di espandersi orizzontalmente, e il layout `grid-cols-[1fr_auto]` funzionera correttamente troncando il titolo e mostrando il timestamp.

