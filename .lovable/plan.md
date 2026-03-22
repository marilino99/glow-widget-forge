
## Piano: rendere i discovery chip del widget live identici alla preview e molto più robusti

### Diagnosi
Ho controllato il codice e il problema è reale: nel live i chip sono ancora fragili perché oggi il widget renderizza ogni chip come **testo semplice dentro un bottone** (`'🧴 Skincare'`), mentre la fix precedente ha corretto solo `flex-direction`. Questo non basta su Shopify:
- il tema host può ancora alterare il layout del bottone;
- il browser può spezzare emoji e label in modo diverso;
- la logica è duplicata nella preview, quindi è facile che preview e live tornino a divergere.

### Implementazione
#### 1) Allineare davvero preview e live con markup strutturato
**File:** `src/components/builder/WidgetPreviewPanel.tsx`  
**File:** `supabase/functions/widget-loader/index.ts`

Invece di renderizzare il chip come stringa unica, renderizzerò ogni chip con struttura esplicita:
```text
[emoji span] [label span]
```

Esempio logico:
- `🧴 Skincare` → `<span class="...emoji">🧴</span><span class="...label">Skincare</span>`
- `Ispirami` → solo label, senza emoji span

Questo evita che emoji e testo “saltino” verticalmente o si comportino diversamente tra preview e live.

#### 2) Estrarre la logica chip nella preview
**File:** `src/components/builder/WidgetPreviewPanel.tsx`

Nel builder ci sono **due blocchi duplicati** per i chip (nei due layout preview).  
Farò una piccola utility/render helper unica per:
- separare emoji e label;
- usare gli stessi className/stili in entrambi i blocchi;
- evitare che una preview venga aggiornata e l’altra no.

### Stabilizzazione del widget live
#### 3) Blindare il CSS contro Shopify
**File:** `supabase/functions/widget-loader/index.ts`

Aggiornerò il CSS del live con regole più forti e più specifiche, non solo `flex-direction`:
- selettori scoped sotto `#wj-root`;
- reset espliciti su chip e sottoparti (`font`, `line-height`, `letter-spacing`, `text-transform`, `writing-mode`, `appearance`, `white-space`);
- layout del chip basato su struttura interna stabile (`emoji` + `label`);
- stessa protezione in **entrambi** i blocchi CSS del loader (standard + hardened).

#### 4) Rendere il chip resistente anche al wrapping
Per non “sminchiarli più”:
- l’emoji resterà un elemento separato e fisso;
- la label potrà andare a capo solo da sola, senza finire sopra/sotto in modo casuale;
- i chip senza emoji continueranno a restare centrati.

### Risultato atteso
- Preview e widget live avranno lo **stesso aspetto**.
- I chip categoria con emoji non si impileranno più male sul sito Shopify.
- Anche se il tema del sito prova a sovrascrivere gli stili, il widget resterà coerente.

### Verifica finale
Controllerò questi casi:
1. chip categoria con emoji (`Skincare`, `Haircare`, `Clothing`, `Shoes`);
2. chip senza emoji (`Ispirami` e chip step successivi);
3. parità tra preview builder e widget live;
4. test su larghezze strette per confermare che l’emoji non salga più sopra il testo.
