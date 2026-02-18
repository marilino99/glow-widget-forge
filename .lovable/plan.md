

# Tracciamento Silenzioso Attivita Utente

## Obiettivo

Tracciare in background, senza alcuna notifica o indicazione visibile all'utente:
1. Ogni login effettuato
2. Ogni volta che l'utente copia il codice embed (pubblicazione widget)
3. Il sito su cui viene pubblicato (dal campo `website_url` della configurazione)

L'utente non vedra nessun cambiamento nell'interfaccia.

## Cosa viene tracciato

| Evento | Quando scatta | Dati salvati |
|--------|---------------|--------------|
| login | Dopo un login riuscito | metodo (email/Google), timestamp |
| widget_publish | Quando clicca "Copy code" | widget_id, website_url, piattaforma |

## Implementazione

### 1. Nuova tabella `user_activity_logs`

Creazione tramite migrazione SQL con RLS che permette solo INSERT (l'utente non potra nemmeno leggere i propri log). Solo il service role potra fare SELECT per le tue analisi.

### 2. Modifiche al codice

- **`src/hooks/useAuth.tsx`**: Aggiunta di un insert silenzioso (fire-and-forget, senza await) quando `onAuthStateChange` rileva un evento `SIGNED_IN`
- **`src/components/builder/AddToWebsiteDialog.tsx`**: Nella funzione `handleCopy`, aggiunta di un insert silenzioso subito dopo la copia, senza modificare il comportamento visibile (nessun toast aggiuntivo, nessun ritardo)

### 3. Nessun hook separato

Per semplicita e per non lasciare tracce evidenti nel codice, le chiamate saranno inline e minimali -- una singola riga `supabase.from("user_activity_logs").insert(...)` senza gestione errori visibile.

---

## Dettagli Tecnici

### Migrazione SQL

```sql
CREATE TABLE public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Solo INSERT permesso, niente SELECT per l'utente
CREATE POLICY "Users can insert own logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_activity_logs_user ON public.user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.user_activity_logs(event_type);
CREATE INDEX idx_activity_logs_created ON public.user_activity_logs(created_at);
```

### File modificati

1. **`src/hooks/useAuth.tsx`** -- Aggiunta nel blocco `onAuthStateChange`, quando l'evento e `SIGNED_IN`:
   ```typescript
   supabase.from("user_activity_logs").insert({
     user_id: session.user.id,
     event_type: "login",
     metadata: { method: session.user.app_metadata?.provider || "email" }
   });
   ```

2. **`src/components/builder/AddToWebsiteDialog.tsx`** -- Nella funzione `handleCopy`, dopo la copia negli appunti, aggiunta silenziosa (richiede accesso a `user` da `useAuth` e al `widgetId` gia presente come prop):
   ```typescript
   if (user) {
     supabase.from("user_activity_logs").insert({
       user_id: user.id,
       event_type: "widget_publish",
       metadata: { widget_id: widgetId }
     });
   }
   ```

### Come consultare i dati

Potrai interrogare la tabella direttamente dal backend (Cloud View > Run SQL) con query come:

```sql
-- Tutti i login degli ultimi 7 giorni
SELECT * FROM user_activity_logs
WHERE event_type = 'login'
ORDER BY created_at DESC;

-- Chi ha pubblicato il widget
SELECT * FROM user_activity_logs
WHERE event_type = 'widget_publish'
ORDER BY created_at DESC;

-- Conteggio per utente
SELECT user_id, event_type, COUNT(*)
FROM user_activity_logs
GROUP BY user_id, event_type;
```

