

## Piano: Feature "Inspire me" — Video Reels nel Widget

### Panoramica
Aggiungere una sezione "Inspire me" al widget che apre un'esperienza fullscreen (dentro il widget) con video verticali scrollabili stile Reels. Ogni video può mostrare più prodotti taggati con possibilità di aggiunta al carrello (Shopify) o link esterno.

### Architettura Dati

**Nuova tabella `inspire_videos`:**
- `id`, `user_id`, `video_url` (Storage), `thumbnail_url`, `source` (manual/instagram/tiktok), `sort_order`, timestamps
  
**Nuova tabella `inspire_video_products`:**
- `id`, `video_id` (FK), `product_card_id` (FK a product_cards), `sort_order`
- Collega più prodotti a ogni video

**Storage bucket** `inspire-videos` per upload manuali.

### Modifiche Backend

1. **Edge Function `widget-config`** — aggiungere fetch di `inspire_videos` con i relativi `inspire_video_products` joinati ai `product_cards`, restituire nel JSON di configurazione
2. **Edge Function `widget-loader`** — aggiungere:
   - Chip "Inspire me" (con emoji ✨) nella home del widget
   - Vista fullscreen Reels con swipe verticale tra video
   - Overlay prodotti (carosello orizzontale) su ogni video con bottone "Aggiungi" (Shopify) o "Vedi" (link esterno)
   - Pulsante back per tornare alla home

### Modifiche Builder (Frontend)

3. **Nuovo pannello `InspireMePanel.tsx`** nel builder per gestire i video:
   - Upload manuale di video
   - Import da URL Instagram/TikTok (download e salvataggio in Storage)
   - Drag & drop per riordinamento
   - Per ogni video: selezionare prodotti da collegare (dai product_cards esistenti)
   - Toggle enable/disable della feature
   
4. **Nuovo item nella sidebar** del builder sotto le sezioni esistenti

5. **Nuovo hook `useInspireVideos.ts`** per CRUD dei video e associazioni prodotto

### Widget Live — UI Reels

La vista Reels dentro il widget:
- Occupa tutto lo spazio del widget (fullscreen nel widget)
- Scroll verticale snap tra video (CSS `scroll-snap-type: y mandatory`)
- Video autoplay/muted con tap per unmute
- Overlay semi-trasparente in basso con carosello prodotti orizzontale
- Ogni card prodotto mostra immagine, titolo, prezzo e bottone azione
- Bottone X in alto per tornare alla home del widget

### Flusso Utente

```text
Builder:
  Sidebar → "Inspire me" → Upload/Import video → Associa prodotti → Salva

Widget visitatore:
  Home → Chip "✨ Inspire me" → Fullscreen Reels
  → Swipe verticale tra video
  → Tap su card prodotto → Add to Cart (Shopify) / Vedi (link)
  → X per tornare alla home
```

### Dettagli Tecnici

- I video vengono serviti dal bucket Storage con URL pubblici
- L'import da Instagram/TikTok scarica il video via edge function e lo salva in Storage (per evitare problemi CORS/hotlinking)
- Il widget-loader renderizza i video con tag `<video>` nativo, autoplay + muted + loop
- La logica "Add to Cart" riutilizza il sistema Shopify esistente (cart API + polling); se non Shopify, apre il link prodotto con `_self`
- Nuova colonna `inspire_enabled` nella tabella `widget_configurations`

