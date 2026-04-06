

## Piano: Passare il colore del widget al blob 3D

### Cosa cambia
Il blob 3D userà il colore scelto dall'utente per il widget come tinta base dei riflessi e dell'illuminazione, invece del grigio cromato fisso.

### Modifiche

**1. `VoiceBlob3D.tsx`**
- Aggiungere prop `baseColor?: string` all'interfaccia `VoiceBlob3DProps`
- Aggiungere uniform `uBaseColor` (vec3) allo shader material
- Nel `useFrame`, convertire l'hex in RGB normalizzato (0-1) e aggiornare `uBaseColor`
- **Fragment shader**: usare `uBaseColor` come tinta per:
  - `baseChrome` — il colore base della superficie (attualmente `vec3(0.12, 0.12, 0.15)`)
  - `rimColor` — il colore dei bordi Fresnel
  - Environment map — aggiungere una leggera tinta del colore base ai riflessi
- Il blob mantiene l'aspetto metallico/cromato ma con la tonalità del colore scelto

**2. `WidgetPreviewPanel.tsx`** (riga ~3118)
- Passare `actualHexColor` come prop `baseColor` al componente:
  ```tsx
  <VoiceBlob3D status={...} muted={...} baseColor={actualHexColor} />
  ```

### Dettaglio tecnico shader
Nel fragment shader, il colore base viene usato così:
```glsl
uniform vec3 uBaseColor;
// ...
vec3 baseChrome = uBaseColor * 0.3; // tinta scura del colore scelto
vec3 rimColor = mix(vec3(1.0), uBaseColor, 0.4); // rim con tinta
```

Questo dà al blob una identità cromatica coerente con il widget mantenendo l'effetto metallico.

### File coinvolti
- `src/components/builder/VoiceBlob3D.tsx`
- `src/components/builder/WidgetPreviewPanel.tsx`

