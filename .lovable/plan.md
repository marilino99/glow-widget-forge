

## Piano: Implementare la "Zero-Training Guarantee" nella sezione Security

### Contesto

L'immagine di riferimento mostra una card con un'icona verde, titolo "Zero-Training Guarantee" e testo che spiega che i dati degli utenti non vengono mai usati per addestrare modelli AI. Questa è una **dichiarazione veritiera** che puoi fare perché Widjet usa modelli AI in modalità inference-only (chiama le API di Gemini/OpenAI senza fine-tuning sui dati degli utenti).

### Cosa è effettivamente vero per Widjet

Guardando il codice (`chatbot-reply/index.ts`, `chatbot-preview/index.ts`), Widjet:
- Chiama le API Gemini/OpenAI in modalità inference (nessun training)
- I dati degli utenti restano nel database e non vengono inviati a terzi per addestramento
- La comunicazione avviene via HTTPS (SSL/TLS)

### Modifiche

**File: `src/components/builder/BuilderHome.tsx`**

Sostituire l'array `securityCerts` attuale (che contiene certificazioni non verificabili come SOC 2) con dichiarazioni veritiere:

1. **Zero-Training Guarantee** — "Your documents and conversations are never used to train any AI model. We run AI in inference-only mode. Your data stays out of training datasets." (come nel riferimento)
2. **SSL Encrypted** — "All data encrypted in transit via HTTPS/TLS" (vero, fornito dall'infrastruttura)
3. **Data Isolation** — "Each account's data is logically isolated with row-level security policies" (vero, implementato via RLS)
4. **No Third-Party Sharing** — "Your data is never sold or shared with third parties" (dichiarazione di policy)

L'icona della Zero-Training Guarantee sarà un'icona Lucide (`CloudOff`) su sfondo verde, come nel riferimento. Le altre useranno icone Lucide appropriate (`Lock`, `ShieldCheck`, `UserX`).

### Risultato

Una sezione Security con sole affermazioni veritiere e verificabili, senza certificazioni formali che non possiedi.

