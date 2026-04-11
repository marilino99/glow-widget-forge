

## Piano: Pannello di Gestione AI (Chat & Voice)

Una nuova pagina `/ai-manager` accessibile solo a te (stesso controllo admin dell'AdminDashboard), con un'interfaccia semplice e visuale per gestire le istruzioni del chatbot e monitorare gli errori.

---

### Cosa verrà costruito

**Pagina `/ai-manager`** con due sezioni principali:

**1. Istruzioni Chatbot**
- Un campo di testo grande e modificabile per le istruzioni della chat (quelle che ora sono nascoste dentro "Data Sources")
- Un campo separato per le istruzioni specifiche della voce
- Pulsante "Salva" per ciascun campo
- Indicatore visivo di salvataggio avvenuto

**2. Log & Errori**
- Tabella con le ultime risposte AI (conversazione, messaggio del visitatore, risposta AI, tempo di risposta)
- Filtro per vedere solo gli errori o i blocchi (risposte lente >5s, errori TTS)
- Dati presi dai log delle edge function `chatbot-preview`, `chatbot-reply`, `elevenlabs-tts`
- Refresh manuale con un pulsante

---

### Dettagli tecnici

| Componente | Dettaglio |
|---|---|
| Nuova pagina | `src/pages/AIManager.tsx` |
| Rotta | `/ai-manager` in App.tsx, protetta + check admin ID |
| Accesso | Solo `ADMIN_USER_ID` (43c72ef7...) come AdminDashboard |
| Istruzioni | Legge/scrive `widget_configurations.chatbot_instructions` e `voice_instructions` via Supabase client |
| Log | Nuova edge function `ai-logs` che usa service role per leggere i log dalle tabelle `chat_messages` (filtra `is_ai_response=true`) e dai metadata |
| Nessuna migrazione DB | I dati necessari esistono già nelle tabelle `widget_configurations` e `chat_messages` |

