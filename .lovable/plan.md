

# Piano: Dashboard Admin Avanzata

## Panoramica

Trasformare la dashboard admin attuale in uno strumento decisionale completo con filtri temporali, metriche di business avanzate e una tabella utenti arricchita.

## Cosa cambia

### 1. Filtro temporale globale (header)
- Dropdown con preset: Oggi, 7 giorni, 30 giorni, 90 giorni, Tutto
- Tutte le metriche e la tabella si aggiornano in base al periodo selezionato

### 2. Metriche KPI migliorate (stat cards)
Le 6 card attuali diventano 8, aggiungendo:
- **Nuovi utenti nel periodo** (non solo totale, ma delta nel range selezionato)
- **Tasso di attivazione** (% utenti che hanno almeno 1 conversazione)
- **Media messaggi/utente** nel periodo
- **Contatti raccolti** (dalla tabella `contacts`)

### 3. Grafico signups dinamico
- Si adatta al filtro temporale (7/30/90 giorni) invece di essere fisso a 7 giorni
- Aggiunta linea di trend

### 4. Tabella utenti completa con ricerca
La tabella attuale mostra già email e website. Miglioramenti:
- **Colonna "Signup date"** per sapere quando si è registrato
- **Colonna "Last active"** (ultima conversazione)
- **Colonna "Chatbot ON/OFF"** (se ha il chatbot abilitato)
- **Colonna "Contatti raccolti"** per utente
- **Barra di ricerca** per filtrare per email o website
- **Ordinamento cliccabile** sulle colonne numeriche
- Mostra **tutti gli utenti** (non solo chi ha messaggi), così vedi anche chi si è registrato ma non usa il prodotto

### 5. Sezione "Users without activity"
- Lista utenti registrati che non hanno mai avuto una conversazione (churn risk)

## Modifiche tecniche

### Edge Function `admin-stats`
- Accetta parametro `?days=7|30|90|all` per filtrare nel periodo
- Aggiunge query per contatti (`contacts` table, count per user)
- Restituisce `signupDate` e `lastActive` per ogni utente
- Restituisce lista completa utenti (anche quelli senza messaggi)
- Filtra conversazioni/messaggi per `created_at` nel range

### Frontend `AdminDashboard.tsx`
- Stato `timeRange` con Select dropdown
- Passa `days` param alla function invoke
- Componente tabella con input di ricerca e sort state
- Nuove stat card per contatti e activation rate
- Grafico signups adattivo al periodo

## File coinvolti
1. `supabase/functions/admin-stats/index.ts` — filtro temporale, dati aggiuntivi
2. `src/pages/AdminDashboard.tsx` — UI completa con filtri, ricerca, sort

