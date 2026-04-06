

## Piano: Colore del blob più intenso e marcato

### Problema
Il colore scelto dall'utente è quasi invisibile perché:
- Il colore base viene moltiplicato per 0.3 (troppo scuro)
- L'environment map contribuisce per l'80% al colore finale ed è grigio fisso
- I riflessi specular sono bianchi fissi, non tintati

### Modifiche a `VoiceBlob3D.tsx` — solo fragment shader

**1. Base più satura**
```glsl
vec3 baseChrome = uBaseColor * 0.6;  // era 0.3
```

**2. Ridurre il peso dell'environment map grigio**
```glsl
vec3 color = mix(baseChrome, envColor, 0.45 + fresnel * 0.3);  // era 0.8 + fresnel * 0.2
```
Così il colore base contribuisce per ~55% invece del 20%.

**3. Tintare l'environment map**
Nella funzione `envMap`, mixare il risultato con `uBaseColor`:
```glsl
vec3 env = envMap(reflectDir);
vec3 envColor = mix(env, env * uBaseColor, 0.4);
```

**4. Rim Fresnel più tintato**
```glsl
vec3 rimColor = mix(vec3(1.0), uBaseColor, 0.65);  // era 0.4
```

**5. Specular tintati**
Il primo specular highlight prende una leggera tinta dal colore:
```glsl
color += mix(vec3(1.0), uBaseColor, 0.3) * spec * 0.8;
```

### Risultato
Il blob avrà il colore scelto dall'utente chiaramente visibile sulla superficie metallica, mantenendo l'effetto cromato e i riflessi ma con una forte identità cromatica.

### File coinvolto
`src/components/builder/VoiceBlob3D.tsx` — solo modifiche al fragment shader (righe 144-179)

