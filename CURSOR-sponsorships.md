# Hoodburger — Cursor Build Brief
## Sponsorships Page

---

### What you're building

The **Sponsorships** page (`/pages/sponsorships`). Figma (desktop):
`https://www.figma.com/design/cRjbVkrcT1wMuRheABgpPZ/Hoodburger-I-Web-Design?node-id=93-1740&m=dev`

The comp is mostly composition of existing sections. From top to bottom it is:
full-width photo → yellow "become a Wizard" band → `Sponsorships` H1 → (large empty
area) → footer. The empty area is the **application form**. Template: `page.sponsorships`.

> Only a desktop frame was supplied. Responsive behaviour mirrors the existing inner
> pages (legal / catering) — no separate mobile comp needed.

---

### Stack

- Shopify Dawn v15.4.1 (custom build on top — do not modify Dawn core files)
- HTML + Liquid + CSS only. No frameworks, no Tailwind, no React.
- JS loads the JotForm resize handler only — no content injected via JS.

---

### Files (all scaffolded, ready to review)

| File | Purpose | Status |
|---|---|---|
| `templates/page.sponsorships.json` | Composes page-hero + cta-bar + sponsorships body | NEW |
| `sections/hb-sponsorships.liquid` | H1 + JotForm iframe + optional hero photo | NEW |
| `assets/hb-sponsorships.css` | All styles for this page (mirrors hb-catering.css) | NEW |
| `assets/hb-sponsorships.js` | Loads JotForm embed handler (iframe auto-resize) | NEW |

No shared files were modified. `hb-home.css` (tokens), `hb-page-hero`, `hb-cta-bar`,
`hb-header`, `hb-footer` are all untouched and reused as-is.

---

### Page structure

```
<nav>  ← hb-header (global)

hb-page-hero          ← full-width top photo (existing section)
hb-cta-bar            ← yellow "Eat hamburgers, become a Wizard…" band (existing section)

<section class="hb-sponsorships-section">
  ├── .sponsorships__header
  │     └── h1.sponsorships__heading   "Sponsorships"
  │
  ├── .sponsorships__embed
  │     └── iframe.sponsorships__form  ← JotForm, auto-resized (only if form ID set)
  │
  └── .sponsorships__hero              ← optional photo below form (off by default)

<footer>  ← hb-footer (global)
```

---

### ⚠️ The key technical decision (same as Catering)

The JotForm `<script>` snippet is **not** pasted in as-is, on purpose:

1. **Shopify strips `<script>` tags** from section setting fields (`html` / `richtext`),
   so the jsform/embed snippet would silently vanish.
2. The `jsform` script writes the form via `document.write`, which is fragile in
   Shopify sections (theme editor re-renders, async loads).

So instead: the **iframe** is hard-coded server-side in `hb-sponsorships.liquid`, and
the **JotForm embed handler** (auto-resizes the iframe to the form height, no internal
scrollbar) is loaded by `hb-sponsorships.js`, which listens for `shopify:section:load`.
The form ID is a section setting, so the form can be swapped without touching code.

---

### ⚠️ Decisions & flags (confirm before go-live)

1. **No Sponsorships JotForm exists yet.** `jotform_id` is intentionally **blank**.
   While blank, the form area renders nothing on the live site (and a dashed
   "add your form ID" note inside the theme editor only). **Do NOT reuse the Catering
   form ID (`261770601059051`)** — sponsorships is a different enquiry. Drop the new
   ID into the section setting when the form is built.
2. **CTA bar button style = `order`** (single red ORDER NOW, no Rewards button) to
   match the comp. Home uses `rewards`. Flip in the template if it should mirror Home.
3. **Top hero photo** expects `hb-sponsorships-hero.jpg` in `/assets` (the Cubbage team
   photo from the comp), or set it via the `hb-page-hero` image picker in Customise.
   No asset = the hero block renders empty.
4. **Below-form hero photo is optional and OFF by default** — the comp has none. It's
   wired up (mirrors Catering) if you ever want a photo under the form; leave the
   `hero_*` settings blank to skip it cleanly.
5. **Heading → Form order**, matching the comp. The form sits directly under the H1.
6. **Initial form height = 539px** (JotForm default) to prevent a layout jump before
   the handler resizes. Adjustable via "Initial form height".

---

### Typography (from Notion brand system — tokens in hb-home.css)

| Element | Family | Weight | Desktop | Mobile |
|---|---|---|---|---|
| H1 (Sponsorships) | Helvetica | Bold 700 | 52px | 50px |

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

1. Create a new page → title **"Sponsorships"** → handle **`sponsorships`**
   (so `/pages/sponsorships` resolves).
2. Assign template **`page.sponsorships`**.
3. Upload the top hero photo as `hb-sponsorships-hero.jpg` (or set via the Page Hero
   image picker in Customise).
4. When the Sponsorships JotForm exists, paste its numeric ID into the
   **HB Sponsorships → JotForm form ID** setting.
5. Confirm the form loads and auto-sizes (no internal scrollbar) on desktop + mobile.
