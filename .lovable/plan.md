

## Problema

Il campo `product_carousel_enabled` **non è incluso nella query SELECT** della Edge Function `widget-config`. La query alla riga 34 elenca esplicitamente le colonne da selezionare, ma `product_carousel_enabled` è assente. Questo significa che `config.product_carousel_enabled` è sempre `undefined`, e il fallback `?? true` lo rende sempre attivo.

## Soluzione

**File: `supabase/functions/widget-config/index.ts`**

Aggiungere `product_carousel_enabled` alla stringa di colonne nella query `.select(...)` alla riga 34.

Da:
```
.select("user_id, widget_color, ... , cta_text")
```

A:
```
.select("user_id, widget_color, ... , cta_text, product_carousel_enabled")
```

Dopo la modifica, la Edge Function verrà ricaricata automaticamente. Sarà necessario refreshare la pagina del sito per vedere il cambiamento.

