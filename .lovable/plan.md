

## Piano: Fix SEO — meta tag unici per pagina e blocco indicizzazione pagine app

### Problemi identificati

1. **Titolo e descrizione identici su tutte le pagine** — essendo una SPA, Google vede lo stesso `<title>` e `<meta description>` di `index.html` per `/builder`, `/login`, `/signup`. Risultato: "Free - Widjet — AI Chat Widget Builder for Websites" ovunque.

2. **`/builder` indicizzato** — è una pagina protetta/app, non dovrebbe apparire su Google.

3. **`robots.txt` troppo permissivo** — blocca solo `/admin`, ma `/builder`, `/onboarding`, `/checkout-success` sono tutti indicizzati.

4. **Sitemap include `/login`** — pagina a bassa rilevanza SEO con priorità 0.6.

5. **Nessun tag `noindex`** sulle pagine app.

### Modifiche

**1. `public/robots.txt`** — Bloccare le pagine app:
```
Disallow: /admin
Disallow: /builder
Disallow: /onboarding
Disallow: /checkout-success
```

**2. `public/sitemap.xml`** — Rimuovere `/login`, aggiungere `/privacy` e `/terms`:
```xml
<url><loc>https://getwidjet.com/</loc><priority>1.0</priority></url>
<url><loc>https://getwidjet.com/signup</loc><priority>0.8</priority></url>
<url><loc>https://getwidjet.com/privacy</loc><priority>0.3</priority></url>
<url><loc>https://getwidjet.com/terms</loc><priority>0.3</priority></url>
```

**3. Creare un hook `usePageMeta`** (`src/hooks/usePageMeta.ts`) — setta `document.title` e `<meta name="description">` dinamicamente via `useEffect`.

**4. Applicare meta tag unici per pagina:**

| Pagina | Title | Description |
|--------|-------|-------------|
| `/` (Index) | Widjet — AI Chat Widget Builder for Websites \| Free | (attuale, già corretto) |
| `/login` | Log In — Widjet | Access your Widjet dashboard. |
| `/signup` | Sign Up Free — Widjet | Create your free account and build your AI chat widget in 2 minutes. |
| `/builder` | Dashboard — Widjet + `<meta name="robots" content="noindex,nofollow">` | (noindex) |
| `/privacy` | Privacy Policy — Widjet | Widjet privacy policy. |
| `/terms` | Terms of Service — Widjet | Widjet terms of service. |

**5. Pagine app (`/builder`, `/onboarding`, `/admin`, `/checkout-success`)** — aggiungere `<meta name="robots" content="noindex,nofollow">` tramite l'hook.

### File coinvolti
- `public/robots.txt`
- `public/sitemap.xml`
- `src/hooks/usePageMeta.ts` (nuovo)
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`
- `src/pages/Builder.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Terms.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/AdminDashboard.tsx`
- `src/pages/CheckoutSuccess.tsx`
- `src/pages/Index.tsx`

### Risultato
- Ogni pagina avrà titolo e descrizione unici su Google
- Le pagine app non appariranno più nei risultati di ricerca
- La homepage mantiene il posizionamento SEO principale

