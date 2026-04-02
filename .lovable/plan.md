

## Piano: Voce ElevenLabs nel widget live

### Problema
Il codice del `widget-loader` contiene già l'integrazione ElevenLabs TTS (`speakWithElevenLabs` alla riga 2421, chiamata alla riga 2022 per il greeting e alla riga 2501 per le risposte AI). Tuttavia la versione **deployata** dell'edge function potrebbe non essere aggiornata — il widget live sta ancora usando il fallback Web Speech API (voce robotica).

### Soluzione
Nessuna modifica al codice necessaria. Serve solo un **redeploy** della edge function `widget-loader` per aggiornare la versione live con il codice che già include ElevenLabs TTS.

### Azione
- Deploy della edge function `widget-loader`

### Risultato
Dopo il deploy, il widget live userà la voce ElevenLabs (Laura, modello `eleven_turbo_v2_5`) identica a quella del preview nel builder.

