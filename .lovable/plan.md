

## Piano: Limite widget per piano con conteggio

### Contesto
Dalla pagina pricing:
- **Free**: 1 widget
- **Starter (Plus)**: 3 widget  
- **Business (Pro)**: 10 widget

Attualmente esiste una sola riga `widget_configurations` per utente. Per supportare il limite, il sistema deve contare quanti widget ha l'utente e bloccare la creazione di nuovi se il limite del piano è raggiunto.

### Modifiche

**1. `check-subscription` edge function** — Aggiungere il conteggio dei widget dell'utente nella risposta, insieme al limite del piano:
- Query: `widget_configurations` count dove `user_id = userId`
- Aggiungere `widget_count` e `widget_limit` alla risposta JSON
- Limiti: free=1, starter=3, pro=10

**2. `useSubscription` hook** — Esporre `widgetCount` e `widgetLimit` dal risultato della edge function. Aggiungere `canCreateWidget` (boolean: `widgetCount < widgetLimit`).

**3. `Builder.tsx`** — Passare `canCreateWidget` e `plan` alla `AllChannelsOverlay` invece del semplice `isPro`. La logica diventa: se `!canCreateWidget`, mostra upgrade overlay.

**4. `AllChannelsOverlay.tsx`** — Cambiare la prop `isPro` in qualcosa come `canChooseTemplate` (boolean). In `handleChoose`, se `!canChooseTemplate` → chiama `onUpgrade()`.

### Risultato
- Utente Free con 1 widget: bloccato, deve fare upgrade
- Utente Starter con <3 widget: può scegliere
- Utente Starter con 3 widget: bloccato
- Utente Business con <10 widget: può scegliere

### File coinvolti
- `supabase/functions/check-subscription/index.ts`
- `src/hooks/useSubscription.ts`
- `src/pages/Builder.tsx`
- `src/components/builder/AllChannelsOverlay.tsx`

