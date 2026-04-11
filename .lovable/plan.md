

## Piano: Fix doppia voce — speakText chiamato ad ogni poll

### Problema trovato

Nel polling dei messaggi (ogni 3 secondi), il codice chiama `speakText` per ogni messaggio bot ricevuto, **anche se il messaggio è già stato renderizzato**. Il motivo:

```text
res.messages.forEach(function(msg) {
  renderMessage(msg);       // ← ritorna silenziosamente se msg.id già visto
  if (msg.sender_type !== 'visitor' && msg.content) {
    speakText(msg.content); // ← viene eseguito SEMPRE, anche se già parlato
  }
});
```

`renderMessage` ha un guard (`renderedMessageIds`), ma `speakText` è chiamato dopo, fuori da quel guard. Quindi ogni tick del poll ri-triggera la sintesi vocale sullo stesso testo, causando la sovrapposizione tra ElevenLabs (ancora in riproduzione) e una nuova istanza.

### Soluzione

**1. Aggiungere un guard prima di `speakText` nel polling** (`widget-loader/index.ts`)

Controllare se il messaggio è già stato renderizzato (cioè `renderedMessageIds[msg.id]` era già `true` prima di `renderMessage`):

```javascript
res.messages.forEach(function(msg) {
  var alreadySeen = !!renderedMessageIds[msg.id];
  renderMessage(msg);
  if (!alreadySeen && msg.sender_type !== 'visitor' && msg.content) {
    speakText(msg.content);
  }
});
```

**2. Deploy** della edge function `widget-loader`

### File modificati

| File | Modifica |
|---|---|
| `supabase/functions/widget-loader/index.ts` | Guard `alreadySeen` prima di `speakText` nel loop di polling |

