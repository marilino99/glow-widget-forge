

## Piano: Ricostruire il codice di assemblaggio DOM mancante nel widget-loader

### Problema identificato (confermato dalla console del browser)

Ho aperto il sito Shopify nel browser e trovato l'errore esatto nella console:

```
[Widjet] Config loaded, rendering...
[Widjet] Render error: Cannot set properties of null (setting 'onclick')
  at render (widget-loader:1836)
```

**La causa**: nel file `supabase/functions/widget-loader/index.ts`, il layout popup (da riga 1298 in poi) crea tutti gli elementi DOM separatamente (`pop`, `homeView`, `scroll`, sezioni, `btn`) ma **non li assembla mai**. Manca completamente il codice che:

1. Appende `scroll` a `homeView`
2. Crea il `footer` (barra di navigazione Home/Contact)
3. Appende `footer` a `homeView`
4. Crea `chatView` (tutta l'interfaccia chat)
5. Definisce `bubbleAvatarHtml`
6. Appende `homeView` a `pop`
7. Appende `inspireView` a `pop` (se abilitato)
8. Appende `chatView` a `pop`

Senza questo codice, `pop` è un `<div>` vuoto. Quando il codice fa `pop.querySelector('#wj-close')` (riga 1853), restituisce `null` e il widget crasha.

Il widget funzionava su `dalilly.myshopify.com` fino a questa mattina (ultimo `widget_rendered` alle 10:48). Il codice di assemblaggio è stato accidentalmente rimosso durante una delle modifiche precedenti.

### Modifica necessaria

**File: `supabase/functions/widget-loader/index.ts`** (tra riga 1827 e riga 1829)

Inserire il blocco di codice mancante che:

1. **Assembla homeView**: `homeView.appendChild(scroll)` + Google Reviews (se abilitato) + Instagram (se abilitato) + branding footer
2. **Crea footer con navigazione**: due bottoni nav (Home e Contact) con icone SVG
3. **Appende footer a homeView**: `homeView.appendChild(footer)`
4. **Crea chatView completo**: header chat con bottoni back/close/more, menu 3-dot (clear chat, download transcript), area messaggi con bubble di benvenuto, chip di azione rapida, input box con bottoni send/emoji/mic, emoji picker
5. **Definisce bubbleAvatarHtml**: avatar per i messaggi AI nella chat
6. **Assembla pop**: `pop.appendChild(homeView)`, condizionalmente `pop.appendChild(inspireView)`, `pop.appendChild(chatView)`

### Dettagli tecnici

Il codice deve rispettare tutte le variabili già definite nel contesto:
- `color`, `btnText`, `dark`, `bgMain`, `bgCard`, `textMain`, `textSub` per i colori
- `avatar`, `avatarInitial`, `name`, `hello`, `tr` per i contenuti
- `showBranding`, `grEnabled`, `igEnabled`, `inspireEnabled` per le feature condizionali
- `u` (supabase URL) per gli endpoint API

Questo è un blocco sostanziale di codice (circa 100-150 righe) che deve essere ricostruito per ripristinare il widget.

### Risultato atteso
Dopo il fix, il widget tornerà visibile sullo store Shopify. Il launcher apparirà, cliccandoci si aprirà il popup con tutte le sezioni (contatto, prodotti, FAQ, link, chat).

