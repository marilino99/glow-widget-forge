

## Problema

Il tema Horizon interpreta l'evento `cart:update` con `source: 'product-form-component'` come una **nuova operazione di aggiunta al carrello**, e di conseguenza esegue a sua volta una chiamata `/cart/add.js`. Questo causa un effetto a cascata: ogni click aggiunge il prodotto una volta (dal widget) + una volta extra (dal tema), e il contatore cresce progressivamente.

Inoltre, l'evento `cart:refresh` può triggerare ulteriori fetch interni del tema che a loro volta possono re-dispatchare eventi.

## Soluzione

### Modificare `supabase/functions/widget-loader/index.ts`

1. **Cambiare la strategia di sync UI**: invece di emettere eventi che il tema può interpretare come nuove azioni, usare **solo** `refreshThemeSections()` + `applyCartCount()` per aggiornare la UI. Questi metodi sostituiscono direttamente l'HTML delle sezioni senza triggerare logica di business del tema.

2. **Rimuovere `emitThemeEvents()` completamente** (o sostituirla con un evento read-only come `cart:rendered` che i temi non interpretano come azione).

3. **Mantenere solo**:
   - `applyCartCount(cart.item_count)` — aggiorna i badge direttamente via DOM
   - `refreshThemeSections()` — re-fetcha l'HTML delle sezioni dal server e lo inietta

Questo approccio è compatibile con tutti i temi perché il Section Rendering API restituisce l'HTML già renderizzato con il conteggio corretto.

