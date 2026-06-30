# EKKIEINN WYSIWYG V4 — Copy Exact karlmenn CSS + HTML

## Problem
The editor and public pages on ekkieinn.is still don't match karlmenn.outzone.is.
The current ekkieinn content CSS is too simple — it's missing the karlmenn design system.

## Solution: Copy karlmenn's EXACT CSS and HTML

### Step 1: Replace content CSS
Create/replace `src/styles/content.css` with the EXACT karlmenn styles below.
Then import it in the root layout AND in the editor component.

The CSS must be imported GLOBALLY so both the public pages AND the admin editor see it.

```css
/* content.css — karlmenn.is design system (exact copy) */

:root {
  --bg: #0F1117;
  --surface: #1A1F2E;
  --surface-2: #222838;
  --border: #2A3142;
  --accent: #F59E0B;
  --accent-hover: #FBBF24;
  --accent-soft: rgba(245, 158, 11, 0.12);
  --text: #F8F9FA;
  --muted: #9aa3b2;
  --muted-2: #6B7280;
  --success: #10B981;
  --danger: #EF4444;
  --radius: 14px;
  --radius-lg: 22px;
  --maxw: 1120px;
  --shadow: 0 18px 50px -20px rgba(0, 0, 0, 0.7);
  --font: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Typography */
.page-content h1, .page-content h2, .page-content h3 { line-height: 1.12; letter-spacing: -0.02em; margin: 0 0 0.4em; font-weight: 800; }
.page-content h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); }
.page-content h2 { font-size: clamp(1.7rem, 4.5vw, 2.6rem); }
.page-content h3 { font-size: 1.25rem; font-weight: 700; }
.page-content p { margin: 0 0 1rem; color: var(--muted); }
.page-content .lead { font-size: clamp(1.05rem, 2.5vw, 1.3rem); color: var(--muted); max-width: 60ch; }
.page-content .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 0.8rem;
}
.page-content .accent { color: var(--accent); }

/* Buttons */
.page-content .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  padding: 0.85em 1.5em;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.98rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;
  text-decoration: none;
}
.page-content .btn:hover { transform: translateY(-2px); }
.page-content .btn-primary { background: var(--accent); color: #1a1304; }
.page-content .btn-primary:hover { background: var(--accent-hover); }
.page-content .btn-ghost { background: transparent; color: var(--text); border-color: var(--border); }
.page-content .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
.page-content .btn-lg { padding: 1.05em 1.9em; font-size: 1.05rem; }

/* Container */
.page-content .container {
  width: 100%;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 22px;
}

/* Hero */
.page-content .hero {
  position: relative;
  text-align: center;
  padding: clamp(56px, 12vw, 120px) 0 clamp(48px, 9vw, 96px);
  overflow: hidden;
}
.page-content .hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(60% 50% at 50% 0%, rgba(245, 158, 11, 0.16), transparent 70%),
    radial-gradient(50% 40% at 80% 30%, rgba(59, 130, 246, 0.08), transparent 70%);
  pointer-events: none;
}
.page-content .hero .container { position: relative; }
.page-content .hero .shield-lg { width: 84px; height: 96px; margin: 0 auto 26px; filter: drop-shadow(0 8px 24px rgba(245, 158, 11, 0.25)); }
.page-content .hero h1 { margin-bottom: 0.5rem; }
.page-content .hero .lead { margin: 0 auto 2rem; }
.page-content .hero-actions { display: flex; gap: 0.9rem; justify-content: center; flex-wrap: wrap; }

/* Sections */
.page-content section { padding: clamp(56px, 9vw, 92px) 0; }
.page-content .section-head { text-align: center; max-width: 62ch; margin: 0 auto clamp(32px, 5vw, 56px); }
.page-content .section-head p { margin: 0 auto; }
.page-content .bg-surface { background: var(--surface); }

/* Grid */
.page-content .grid { display: grid; gap: 22px; }
.page-content .grid-3 { grid-template-columns: repeat(3, 1fr); }
.page-content .grid-2 { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 860px) { .page-content .grid-3, .page-content .grid-2 { grid-template-columns: 1fr; } }

/* Cards */
.page-content .card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 30px 26px;
  transition: transform 0.18s ease, border-color 0.18s ease;
}
.page-content .bg-surface .card { background: var(--surface-2); }
.page-content .card:hover { transform: translateY(-4px); border-color: var(--accent); }
.page-content .card .icon {
  width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem;
  border-radius: 14px;
  background: var(--accent-soft);
  margin-bottom: 18px;
}
.page-content .card h3 { margin-bottom: 0.4rem; }
.page-content .card p { margin: 0; font-size: 0.97rem; }

/* Steps */
.page-content .steps { counter-reset: step; }
.page-content .step .num {
  width: 46px; height: 46px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 16px;
}

/* CTA Band */
.page-content .cta-band {
  background: linear-gradient(135deg, var(--surface), var(--surface-2));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: clamp(34px, 6vw, 60px);
  text-align: center;
}

/* Crisis */
.page-content .crisis { background: var(--surface); border-top: 1px solid var(--border); }
.page-content .crisis-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 28px; }
@media (max-width: 860px) { .page-content .crisis-grid { grid-template-columns: 1fr; } }
.page-content .crisis-item {
  border: 1px solid var(--border);
  border-left: 3px solid var(--danger);
  border-radius: var(--radius);
  padding: 20px 22px;
  background: var(--bg);
}
.page-content .crisis-item .num { font-size: 1.7rem; font-weight: 800; color: var(--text); }
.page-content .crisis-item .label { color: var(--muted); font-size: 0.95rem; }

/* Page hero (inner pages) */
.page-content .page-hero { padding: clamp(48px, 8vw, 80px) 0 clamp(24px, 4vw, 40px); text-align: center; }
.page-content .page-hero h1 { font-size: clamp(2rem, 6vw, 3.2rem); }

/* Prose */
.page-content .prose { max-width: 72ch; margin: 0 auto; }
.page-content .prose h2 { margin-top: 1.6em; }
.page-content .prose ul { color: var(--muted); padding-left: 1.2em; }
.page-content .prose li { margin-bottom: 0.5em; }

/* Helpers */
.page-content .center { text-align: center; }
.page-content .reveal { opacity: 1; transform: none; }

/* SVG shields */
.page-content svg { display: block; max-width: 100%; }
```

### Step 2: Update seed HTML for forsíða (page id=1, slug="forsida")

The DB content for forsíða MUST use this EXACT HTML (adapted URLs for ekkieinn.is):

```html
<!-- HERO -->
<section class="hero">
  <div class="container">
    <svg class="shield-lg" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="h" x1="32" y1="2" x2="32" y2="70" gradientUnits="userSpaceOnUse"><stop stop-color="#FBBF24"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs><path d="M32 2 6 12v22c0 17 12 28 26 34 14-6 26-17 26-34V12L32 2Z" fill="url(#h)"/><path d="M32 9 12 16.5V34c0 13.5 9.2 22.7 20 27.8 10.8-5.1 20-14.3 20-27.8V16.5L32 9Z" fill="#0F1117"/><path d="M32 22l10 10-10 10-10-10 10-10Z" fill="url(#h)"/><path d="M22 40l10-6 10 6" stroke="#0F1117" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h1>Þú ert ekki einn.</h1>
    <p class="lead">Samfélag og stuðningur fyrir karlmenn sem hafa upplifað ofbeldi, rangar sakir, erfiðar aðstæður eða eru gerendur og vilja breyta hegðun sinni.</p>
    <div class="hero-actions">
      <a href="/skra" class="btn btn-primary btn-lg">Skrá mig</a>
      <a href="/um-okkur" class="btn btn-ghost btn-lg">Kynna mér meira</a>
    </div>
  </div>
</section>

<!-- HVERJUM ER ÞETTA ÆTLAÐ -->
<section id="hverjum" class="bg-surface">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Hverjum er þetta ætlað</p>
      <h2>Hvar sem þú stendur — það er pláss fyrir þig hér</h2>
      <p>Karlmenn glíma við erfiðar aðstæður í þögn. Hér þarftu ekki að gera það einn.</p>
    </div>
    <div class="grid grid-3">
      <div class="card">
        <div class="icon">🛡️</div>
        <h3>Fórnarlamb ofbeldis</h3>
        <p>Líkamlegt eða andlegt ofbeldi. Þú átt rétt á stuðningi og að vera tekinn alvarlega — sama hver beitti þig ofbeldi.</p>
      </div>
      <div class="card">
        <div class="icon">⚖️</div>
        <h3>Mannorðstjón</h3>
        <p>Rangar sakir og mannorðstjón geta rústað lífi. Hér finnur þú ráðgjöf, reynslu annarra og leiðir áfram.</p>
      </div>
      <div class="card">
        <div class="icon">🔄</div>
        <h3>Gerandi sem vill breyta</h3>
        <p>Að taka ábyrgð og breyta hegðun sinni er hugrekki. Hér er sérstakt lokað svæði fyrir þá vegferð.</p>
      </div>
    </div>
  </div>
</section>

<!-- HVERNIG VIRKAR ÞETTA -->
<section>
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Hvernig virkar þetta</p>
      <h2>Þrjú einföld skref</h2>
    </div>
    <div class="grid grid-3 steps">
      <div class="step">
        <div class="num">1</div>
        <h3>Skráðu þig</h3>
        <p>Nafnlaust ef þú vilt. Þú velur gælunafn og ræður sjálfur hversu mikið þú deilir.</p>
      </div>
      <div class="step">
        <div class="num">2</div>
        <h3>Tengstu samfélaginu</h3>
        <p>Lestu, spjallaðu og deildu reynslu með öðrum sem skilja hvar þú stendur.</p>
      </div>
      <div class="step">
        <div class="num">3</div>
        <h3>Fáðu aðstoð</h3>
        <p>Aðgangur að lögfræðilegri og sálfræðilegri ráðgjöf í gegnum samfélagið.</p>
      </div>
    </div>
  </div>
</section>

<!-- STUÐNINGUR -->
<section class="bg-surface">
  <div class="container">
    <div class="cta-band">
      <p class="eyebrow">Stuðningur samfélagsins</p>
      <h2>Byggt á frjálsum framlögum</h2>
      <p class="lead" style="margin:0 auto 1.6rem;">Allt hér er rekið af samfélaginu. Framlög fara beint til lögfræðilegrar og sálfræðilegri aðstoðar fyrir þá sem þurfa á að halda.</p>
      <a href="/styrkja" class="btn btn-primary btn-lg">Styðja verkefnið</a>
    </div>
  </div>
</section>

<!-- NEYÐARHJÁLP -->
<section class="crisis">
  <div class="container">
    <div class="section-head" style="margin-bottom:0;">
      <p class="eyebrow" style="color:var(--danger);">Bráðahjálp</p>
      <h2>Þarftu hjálp núna?</h2>
      <p>Ef líf er í hættu, hringdu strax. Þú ert ekki byrði — það er styrkur að leita sér hjálpar.</p>
    </div>
    <div class="crisis-grid">
      <div class="crisis-item">
        <div class="num">112</div>
        <div class="label">Neyðarlínan — bráð hætta og ofbeldi</div>
      </div>
      <div class="crisis-item">
        <div class="num">1717</div>
        <div class="label">Hjálparsími Rauða krossins — sólarhringsvakt</div>
      </div>
      <div class="crisis-item">
        <div class="num">1700</div>
        <div class="label">Heilsuvera ráðgjöf — heilsa og líðan</div>
      </div>
    </div>
    <p class="center" style="margin-top:22px;"><a href="/neydarhjalp" class="accent">Sjá allar neyðar- og hjálparleiðir →</a></p>
  </div>
</section>
```

### Step 3: Ensure editor renders content with same CSS

The admin editor's `contenteditable` div MUST have `class="page-content"`.
The `content.css` file is imported globally so it applies everywhere.

The editor must render the SVG shield, the buttons, the cards, the grid, the steps, etc.
— all using the same CSS classes defined above.

### Step 4: Other pages

For other pages (um-okkur, neydarhjalp, studningur, etc), use the `.page-hero` + `.prose` + `.container` classes as karlmenn does:

```html
<section class="page-hero">
  <div class="container">
    <p class="eyebrow">Section label</p>
    <h1>Page Title</h1>
    <p class="lead">Description text.</p>
  </div>
</section>
<section>
  <div class="container prose">
    <!-- page content here -->
  </div>
</section>
```

### Step 5: Build, test, deploy
1. `npm run build` — must pass
2. Smoke test all routes
3. `npx prisma db seed` — update DB content
4. `pm2 restart ekkieinn`
5. `git add . && git commit && git push origin beta`

### CRITICAL RULES
- DO NOT touch auth, threads, moderation, forum, or any non-content code
- DO NOT break existing functionality
- The ONLY changes are: CSS file, seed content HTML, and ensuring the editor div has `class="page-content"`
- The public page renderer must use `dangerouslySetInnerHTML` inside a `<div class="page-content">` wrapper
