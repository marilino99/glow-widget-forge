

# Tracciamento Analytics del Widget

## Panoramica
Per tracciare quante persone cliccano sul widget e interagiscono con esso, serve un sistema di analytics composto da tre parti:

1. **Database** - Una tabella per salvare ogni evento (click sul bottone, apertura widget, click su prodotti, ecc.)
2. **Backend** - Una funzione che riceve gli eventi dal widget sui siti esterni
3. **Widget** - Aggiornare lo script del widget per inviare gli eventi automaticamente
4. **Dashboard** - Collegare il pannello Metrics ai dati reali

---

## Cosa verra tracciato
- **Impressions**: Ogni volta che il widget viene caricato su una pagina
- **Clicks**: Ogni volta che un visitatore clicca sul bottone per aprire il widget
- **CTR**: Calcolato automaticamente come Clicks / Impressions

---

## Dettagli tecnici

### 1. Nuova tabella `widget_events`
Campi principali:
- `id` (uuid)
- `widget_id` (uuid) - collegato alla configurazione
- `event_type` (text) - es. "impression", "click", "product_click"
- `visitor_id` (text) - ID anonimo del visitatore
- `page_url` (text) - pagina dove si trova il widget
- `created_at` (timestamp)

Con policy RLS per permettere a chiunque di inserire eventi (il widget gira su siti esterni senza autenticazione) e ai proprietari di leggere solo i propri dati.

### 2. Nuova Edge Function `track-widget-event`
- Endpoint pubblico (senza JWT) che riceve gli eventi dal widget
- Valida i dati e li salva nella tabella `widget_events`
- Accetta POST con `widget_id`, `event_type`, `visitor_id`

### 3. Aggiornamento del Widget Loader
Lo script che viene iniettato nei siti esterni inviera automaticamente:
- Un evento "impression" quando il widget viene caricato
- Un evento "click" quando il visitatore clicca sul bottone del widget

### 4. Aggiornamento del Pannello Metrics
Il componente `MetricsPanel` leggera i dati reali dalla tabella `widget_events` invece di mostrare valori statici, con filtro sugli ultimi 30 giorni.

### 5. Configurazione
- Aggiunta di `track-widget-event` al `config.toml` con `verify_jwt = false`

