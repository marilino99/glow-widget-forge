

# Piano: Prenotazione Osteopata via Calendly nel Widget

## Panoramica
Integreremo Calendly nel widget per permettere ai visitatori di visualizzare gli slot disponibili e prenotare una sessione direttamente dalla chat o da una sezione dedicata. Dopo la prenotazione, verrà inviata un'email di conferma.

## Architettura

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Widget UI  │────▶│ Edge Functions    │────▶│ Calendly API│
│ (loader.ts) │     │ calendly-slots    │     │   v2        │
│             │◀────│ calendly-book     │◀────│             │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ Email conf. │
                    │ (Resend)    │
                    └─────────────┘
```

## Step 1: Configurazione Calendly nel Builder

**Tabella DB** — Aggiungere colonne a `widget_configurations`:
- `calendly_enabled` (boolean, default false)
- `calendly_event_url` (text, nullable) — URL dell'event type Calendly (es. `https://calendly.com/osteopata/sessione`)

**Builder UI** — Creare un nuovo pannello `CalendlyPanel.tsx` accessibile dalla sidebar (icona Calendar), dove l'osteopata:
- Attiva/disattiva la prenotazione
- Incolla il link del suo event type Calendly

**Widget Config** — Aggiornare `widget-config/index.ts` per includere `calendly_enabled` e `calendly_event_url`.

## Step 2: Secret Calendly API Key

Calendly richiede un **Personal Access Token** per le API v2 (disponibile in Calendly → Integrations → API). Lo salveremo come secret `CALENDLY_API_KEY` tramite il tool `add_secret`.

## Step 3: Edge Function `calendly-slots`

Nuova edge function che:
1. Riceve `event_type_url` dal widget
2. Chiama `GET /event_type_available_times` dell'API Calendly v2 con range di date (es. prossimi 7 giorni)
3. Ritorna gli slot disponibili al widget

Endpoint: `GET /calendly-slots?widget_id=xxx&start=2026-03-14&end=2026-03-21`

## Step 4: Edge Function `calendly-book`

Nuova edge function che:
1. Riceve nome, email, slot selezionato dal visitatore
2. Chiama `POST /scheduled_events` (o Scheduling API di Calendly) per creare la prenotazione
3. Invia email di conferma al cliente via Resend (usando `RESEND_API_KEY` già configurato)
4. Ritorna conferma al widget

## Step 5: UI nel Widget (widget-loader)

Aggiungere una nuova sezione nel widget (simile a FAQ/Products):
1. **Pulsante "Prenota sessione"** nella home del widget (se `calendly_enabled`)
2. **Vista calendario** — griglia dei prossimi giorni con slot orari disponibili
3. **Form prenotazione** — nome, email, selezione slot → conferma
4. **Stato conferma** — messaggio di successo con riepilogo

Il flusso: Pulsante → Selezione giorno → Selezione orario → Form dati → Conferma

## Step 6: Email di Conferma

Utilizzare l'edge function `calendly-book` per inviare un'email transazionale via Resend al cliente con:
- Data e ora dell'appuntamento
- Nome dell'osteopata
- Eventuale indirizzo/istruzioni

## File da creare/modificare

| File | Azione |
|------|--------|
| DB migration | Aggiungere `calendly_enabled`, `calendly_event_url` a `widget_configurations` |
| `src/components/builder/CalendlyPanel.tsx` | Nuovo pannello builder |
| `src/components/builder/BuilderSidebar.tsx` | Aggiungere voce sidebar |
| `src/hooks/useWidgetConfiguration.ts` | Aggiungere campi Calendly |
| `supabase/functions/calendly-slots/index.ts` | Nuova edge function |
| `supabase/functions/calendly-book/index.ts` | Nuova edge function |
| `supabase/functions/widget-config/index.ts` | Includere campi Calendly |
| `supabase/functions/widget-loader/index.ts` | UI prenotazione nel widget |
| `supabase/config.toml` | Registrare le 2 nuove funzioni (verify_jwt=false) |

## Prerequisiti utente
- Account Calendly con almeno un Event Type configurato
- Personal Access Token Calendly (verrà richiesto come secret)

