

## Problema

Il widget non appare sullo store Shopify perché lo script `widget-loader` contiene un bug che causa un crash JavaScript nel browser del visitatore.

## Causa principale

Alla riga 259-260 di `widget-loader/index.ts`, il CSS usa una variabile `lt` che **non è mai definita** nella funzione `render()`:

```
background:${lt?'#f1f5f9':'rgba(255,255,255,0.1)'}
```

Questo causa un `ReferenceError: lt is not defined` nel browser, che blocca l'esecuzione dell'intera funzione `render()` e impedisce la creazione del widget. La variabile `lt` dovrebbe essere `!dark` (light theme mode).

Il widget funziona nel builder preview perché lì il pannello usa componenti React, non il `widget-loader` edge function.

## Piano

### 1. Fix variabile `lt` nel widget-loader

In `supabase/functions/widget-loader/index.ts`, riga 259-260:
- Aggiungere `var lt = !dark;` nella funzione `render()`, subito dopo la definizione di `var dark = ...` (riga 152)
- Oppure sostituire tutte le occorrenze di `lt` con `!dark`

### 2. Re-deploy del widget-loader

Deploy della edge function aggiornata.

### 3. Verifica

Non serve reinstallare lo snippet: la URL dello script è la stessa, quindi al prossimo caricamento della pagina Shopify il widget comparirà.

