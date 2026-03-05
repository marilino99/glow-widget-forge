

## Piano: Lead Collection tramite AI Chatbot → Contacts

### Cosa faremo

L'AI chatbot chiederà in modo naturale nome e email al visitatore durante la conversazione. Quando il visitatore li fornisce, i dati vengono estratti e salvati in una nuova tabella `contacts` nel database. La sezione Contacts nel builder mostrerà questi contatti.

### Flusso

1. L'AI, dopo qualche scambio o quando il visitatore chiede aiuto specifico, chiede naturalmente nome e email
2. Quando il visitatore risponde, il sistema analizza la risposta dell'AI per individuare se ha raccolto i dati
3. Una nuova edge function `extract-contact` analizza i messaggi e salva il contatto
4. La ContactsPanel legge dalla tabella `contacts` e li mostra

### Modifiche tecniche

#### 1. Database: Nuova tabella `contacts`
```sql
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id uuid REFERENCES conversations(id),
  name text,
  email text NOT NULL,
  channel text DEFAULT 'chatbot',
  country text,
  language text,
  created_at timestamptz DEFAULT now()
);
-- RLS: owner può leggere/cancellare i propri contatti
-- Unique constraint su (user_id, email) per evitare duplicati
```

#### 2. Edge Function: `chatbot-reply/index.ts`
- Aggiungere al system prompt istruzioni per raccogliere nome e email in modo naturale
- Dopo aver ricevuto la risposta AI, chiamare una funzione di estrazione contatto
- L'estrazione usa un secondo prompt AI breve: "Da questa conversazione, estrai nome e email se presenti. Rispondi in JSON."
- Se trovati, inserire nella tabella `contacts` (upsert su user_id + email)

#### 3. `src/components/builder/ContactsPanel.tsx`
- Collegare alla tabella `contacts` con query Supabase
- Mostrare i dati reali con ricerca e paginazione funzionanti
- Aggiungere conteggio totale e export CSV

### Dettagli del prompt AI

Aggiunta al system instruction:
```
LEAD COLLECTION:
- During the conversation, naturally ask for the visitor's name and email.
- Do this after answering their first question, not immediately.
- Be natural: "By the way, can I get your name and email so we can follow up if needed?"
- If they provide it, thank them and continue helping.
- Do not ask more than once per conversation.
```

Dopo ogni risposta AI, un check rapido via regex + secondo prompt AI breve estrae i dati dalla conversazione completa e li salva.

### File modificati
- **Migration SQL**: crea tabella `contacts` con RLS
- **`supabase/functions/chatbot-reply/index.ts`**: prompt aggiornato + estrazione contatto post-risposta
- **`src/components/builder/ContactsPanel.tsx`**: collegamento a dati reali

