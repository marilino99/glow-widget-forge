

## Piano: Integrare Google Cloud TTS come alternativa economica a ElevenLabs

### Perché Google Cloud TTS

Google Cloud Text-to-Speech offre voci **Neural2** e **Journey** con qualità quasi umana, comparabile a ElevenLabs, ma con un piano gratuito molto generoso:
- **1 milione di caratteri/mese gratis** per voci Neural2
- **4 milioni di caratteri/mese gratis** per voci Standard
- Dopo il free tier: ~$16 per 1M caratteri (Neural2)

### Come funziona

Il sistema proverà **prima Google Cloud TTS**, e se non disponibile userà il **browser TTS** come fallback. ElevenLabs resterà come opzione se in futuro vorrai riattivarlo.

### Modifiche

**1. Nuovo secret: `GOOGLE_CLOUD_TTS_API_KEY`**
- Serve una API key di Google Cloud con l'API "Cloud Text-to-Speech" abilitata
- Si ottiene dalla [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**2. Modificare `supabase/functions/elevenlabs-tts/index.ts`**
- Rinominare logicamente in un TTS generico (o creare una nuova funzione `google-tts`)
- Aggiungere la logica: se `GOOGLE_CLOUD_TTS_API_KEY` è presente, usare Google Cloud TTS
- Altrimenti provare ElevenLabs, altrimenti fallback browser
- Endpoint Google: `https://texttospeech.googleapis.com/v1/text:synthesize`
- Voce consigliata: `it-IT-Neural2-A` (italiano) o `en-US-Neural2-F` (inglese) — selezionata automaticamente in base alla lingua del widget
- L'audio viene restituito in base64, da convertire in binary per lo streaming

**3. Nessuna modifica al widget-loader**
- Il widget chiama sempre lo stesso endpoint `/functions/v1/elevenlabs-tts`
- La logica di selezione del provider è tutta server-side

### Mappa delle voci per lingua

| Lingua | Voce Google Neural2 |
|--------|---------------------|
| it | it-IT-Neural2-A (femminile) |
| en | en-US-Neural2-F (femminile) |
| es | es-ES-Neural2-A (femminile) |
| fr | fr-FR-Neural2-A (femminile) |
| de | de-DE-Neural2-A (femminile) |

### Flusso di priorità TTS

```text
1. Google Cloud TTS (se GOOGLE_CLOUD_TTS_API_KEY presente)
2. ElevenLabs (se ELEVENLABS_API_KEY presente)
3. { fallback: true } → browser speechSynthesis
```

### Prossimi passi

1. Dovrai creare un progetto Google Cloud (gratuito) e abilitare l'API Text-to-Speech
2. Generare una API key dalla console
3. Io la salverò come secret e aggiornerò l'edge function

