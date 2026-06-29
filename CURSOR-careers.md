# Hoodburger — Cursor Build Brief
## Careers Page  *(copy-paste this into Cursor to start the job)*

> Finalised 28 June 2026. Supersedes the 27 June draft. Follows the Figma comp:
> **no cta-bar** on Careers. The four theme files are already scaffolded in the repo —
> your job is to verify them, wire the links, and set up the page in admin.

---

### What you're building

The **Careers** page (`/pages/careers`). Renamed from "Work With Us" → **Careers**
(Matt, June 2026). A JotForm "Jobs" application form sits directly under the `Careers` H1,
beneath a full-width hero photo. Template: `page.careers`. Page handle **must be `careers`**.

Figma:
- Desktop: `https://www.figma.com/design/cRjbVkrcT1wMuRheABgpPZ/Hoodburger-I-Web-Design?node-id=17-16499&m=dev` — frame **"Careers - Desktop"**
- Mobile:  `https://www.figma.com/design/cRjbVkrcT1wMuRheABgpPZ/Hoodburger-I-Web-Design?node-id=17-16675&m=dev` — frame **"Careers - Mobile"**

Frame order (confirmed from comp): NavigationBar → full-width hero photo → `Careers` H1 → form → Footer. **No yellow "become a Wizard" cta-bar** (unlike Sponsorships/legal pages).

---

### Stack

- Shopify Dawn v15.4.1 (custom build on top — do not modify Dawn core files)
- HTML + Liquid + CSS only. No frameworks, no Tailwind, no React.
- JS loads the JotForm resize handler only — no content injected via JS.

---

### Files

| File | Purpose | Status |
|---|---|---|
| `templates/page.careers.json` | Composes `hb-page-hero` (photo) + `hb-careers` (H1 + form) | **SCAFFOLDED** |
| `sections/hb-careers.liquid` | H1 + JotForm iframe | **SCAFFOLDED** |
| `assets/hb-careers.css` | Page styles (mirrors `hb-sponsorships.css`, `.careers__` names) | **SCAFFOLDED** |
| `assets/hb-careers.js` | Loads JotForm embed handler (iframe auto-resize) | **SCAFFOLDED** |
| `assets/hb-careers-hero.jpg` | Hero photo (export from Figma — see Dependencies) | **TODO (asset)** |
| `sections/hb-footer.liquid` | Repoint `link_3` → `/pages/careers`, label "Careers" | **EDIT** |
| `templates/index.json` / `hb-promos` | Repoint Careers promo button → `/pages/careers` | **EDIT** |
| `templates/page.mappy.json` | Redundant — delete (verify first) | **DELETE?** |

The hero photo reuses the shared `hb-page-hero` section (same as menu/legal pages), so no
bespoke hero code. `hb-careers` mirrors `hb-sponsorships` minus the cta-bar and the optional
below-form image. JotForm mechanics mirror `hb-catering` / `hb-sponsorships` exactly.

---

### Page structure

```
<nav>  ← hb-header (global)

<section class="page-hero">           ← hb-page-hero, fallback_asset = hb-careers-hero.jpg
  └── img.page-hero__media            (full-bleed Cubbage photo)

<section class="hb-careers-section">  ← hb-careers
  ├── .careers__header
  │     └── h1.careers__heading       "Careers"
  └── .careers__embed
        └── iframe.careers__form      ← JotForm 261770384764062 ("Jobs"), auto-resized

<footer>  ← hb-footer (global)
```

---

### The JotForm embed — same approach as Catering / Sponsorships (read this)

You supplied:

```html
<iframe id="JotFormIFrame-261770384764062" title="Jobs" ... src="https://form.jotform.com/261770384764062" ...></iframe>
<script src='https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js'></script>
<script>window.jotformEmbedHandler("iframe[id='JotFormIFrame-261770384764062']", "https://form.jotform.com/")</script>
```

**The `<script>` tags are NOT pasted into a setting.** Shopify strips `<script>` from
`html`/`richtext` section settings, so they'd silently vanish. Instead: the **iframe is
hard-coded server-side** in `hb-careers.liquid`, and the **embed handler** (which only
auto-resizes the iframe to the form height — no internal scrollbar) is loaded by
`hb-careers.js`, listening for `shopify:section:load`. Identical end behaviour, robust in
Shopify, and the form ID is a section setting so it's swappable without code. This mirrors
`hb-sponsorships.liquid` / `hb-sponsorships.js`.

**`onload="window.parent.scrollTo(0,0)"` was dropped** from your snippet — it force-scrolls
the page to the top when the form loads, jarring mid-page. Left out deliberately (same call
as Catering). Say the word to restore.

---

### Link fixes — resolve the broken `/pages/work-with-us`  *(do these in Cursor)*

1. **`sections/hb-footer.liquid` ~line 157–158:**
   - `"link_3_label": "Work With Us"` → `"Careers"`
   - `"link_3_url": "/pages/work-with-us"` → `"/pages/careers"`
2. **Homepage Careers promo button** → point its URL to `/pages/careers`. The label is
   likely already "Careers" (`hb-promos.liquid`); the URL lives in the promo block settings
   in `templates/index.json` (or the section default) — update there so it resolves.
3. **`templates/page.mappy.json`** — appears redundant. Verify nothing references it, then
   delete.

---

### Dependencies / flags (confirm before go-live)

1. **Hero asset not in repo.** Comp uses `2026.05.06_CUBBAGEPHOTO_Hoodburger-92`. Export that
   frame's photo from Figma (or pull from Cub's shoot), save as `assets/hb-careers-hero.jpg`.
   Until it's in `/assets`, `hb-page-hero` falls back to its default and the photo is wrong.
2. **No cta-bar** — confirmed from the comp (28 June). If you ever want consistency with the
   other inner pages, add `hb-cta-bar` to the `order` array in `page.careers.json`.
3. **Order = hero → H1 → form**, per comp. Form sits below the fold on mobile (expected for
   an application form).
4. **Form routing is set inside JotForm**, not the page. Confirm submissions land in
   **jobs@hoodburger.com.au** (interim inbox; HubSpot CRM later).
5. **Nav placement:** the comp's main nav does not list Careers — it's reached via the footer
   + homepage promo. Left out of `hb-header` to match. Confirm.
6. **Initial form height = 539px** (JotForm default) to prevent a layout jump before the
   handler resizes. Adjustable via the section's "Initial form height" setting.

---

### Typography (from Notion brand system — tokens in hb-home.css)

| Element | Family | Weight | Desktop | Mobile |
|---|---|---|---|---|
| H1 (Careers) | Helvetica | Bold 700 | 52px | 50px |

Heading uses `--font-base` (Helvetica), matching the live Sponsorships/Catering pages.
Fonts via Adobe Fonts: `--font-base`, `--font-condensed`.

---

### Colour tokens (from hb-home.css `:root` — DO NOT redefine)

```css
--c-red:    #F9423A;
--c-yellow: #FFD100;
--c-black:  #27251F;
--c-white:  #FFFFFF;
--c-hairline: rgba(39, 37, 31, 0.5);
```

---

### Shopify admin setup (after build)

1. Create a new page → title **"Careers"** → handle **`careers`** (so `/pages/careers` resolves).
2. Assign template **`page.careers`**.
3. Upload `hb-careers-hero.jpg` (or set via the hero image picker in Customise).
4. Confirm the form loads and auto-sizes (no internal scrollbar) on desktop + mobile, and
   that submissions route to **jobs@hoodburger.com.au**.
5. Verify footer + homepage Careers links now resolve (no 404), and the old
   `/pages/work-with-us` is gone.
