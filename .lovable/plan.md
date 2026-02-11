

# Automazione Welcome Email con Brevo

## Panoramica
Modificheremo la edge function `send-welcome-email` per aggiungere il nuovo utente a una lista contatti su Brevo (ex Sendinblue) al momento della registrazione. Brevo si occuperà di inviare l'email di benvenuto tramite un'automazione configurata sulla piattaforma.

## Come funziona

```text
Utente si registra --> Edge Function aggiunge contatto a Brevo --> Automazione Brevo invia email di benvenuto
```

## Cosa serve da te (su Brevo)

1. **API Key Brevo** - La trovi in Impostazioni > SMTP & API > Chiavi API
2. **ID Lista** - Crea o seleziona una lista in Contatti > Liste, e prendi l'ID numerico
3. **Welcome Automation** - Crea un'automazione su Brevo che si attiva quando un contatto viene aggiunto alla lista

## Modifiche tecniche

### 1. Nuovo segreto da configurare
- `BREVO_API_KEY` - chiave API v3 di Brevo

### 2. Modifica edge function `send-welcome-email/index.ts`
- Rimuovere tutta la logica Resend
- Chiamare l'API Brevo `POST https://api.brevo.com/v3/contacts` per creare/aggiornare il contatto
- Header di autenticazione: `api-key: {BREVO_API_KEY}`
- Body con `email`, `listIds` e `updateEnabled: true`
- Il contatto viene aggiunto alla lista specificata, facendo scattare l'automazione

### 3. Nessuna modifica al frontend
- `Signup.tsx` resta invariato: continua a chiamare la stessa edge function con l'email dell'utente

## Risultato finale
Ogni nuovo utente registrato viene aggiunto automaticamente alla tua lista Brevo, e l'automazione di benvenuto si occupa di inviare l'email e qualsiasi follow-up futuro.

