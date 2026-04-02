

## Piano: Ridurre dimensioni card template

### Problema
Le card template attuali sono troppo grandi. Nello screenshot di riferimento (ConvertKit), le card sono più compatte con meno spazio e un layout più denso.

### Modifiche in `src/components/builder/AllChannelsOverlay.tsx`

1. **Griglia**: cambiare `gap-6` a `gap-5` e ridurre `max-w-4xl` a `max-w-3xl`
2. **Area preview**: cambiare aspect ratio da `aspect-[16/10]` a `aspect-[16/9]` per renderla meno alta
3. **Card footer**: ridurre padding da `p-4` a `p-3`, ridurre `mb-4` dei bottoni a `mb-3`, e ridurre dimensione testo/spaziatura
4. **Icona preview**: ridurre da `h-12 w-12` a `h-10 w-10`
5. **Padding griglia**: ridurre `p-8` a `p-6`

### Risultato
Card più compatte e proporzionate, simili allo screenshot di riferimento ConvertKit.

