# Hoodburger — Cursor Build Brief
## Catering Page

---

### What you're building

The **Catering** page (`/pages/catering`). A JotForm enquiry form sits between the
`Catering` H1 and an optional hero photo. Template: `page.catering`.

> No Figma comp supplied for this page yet. The layout reuses the proven Order Now
> structure (heading → embed → hero photo). Swap in comp specifics if/when a frame lands.

---

### Stack

- Shopify Dawn v15.4.1 (custom build on top — do not modify Dawn core files)
- HTML + Liquid + CSS only. No frameworks, no Tailwind, no React.
- JS loads the JotForm resize handler only — no content injected via JS.

---

### Files (all scaffolded, ready to review)

| File | Purpose | Status |
|---|---|---|
| `sections/hb-catering.liquid` | Heading + JotForm iframe + optional hero photo | NEW |
| `assets/hb-catering.css` | All styles for this page (mirrors hb-order-now.css) | NEW |
| `assets/hb-catering.js` | Loads JotForm embed handler (iframe auto-resize) | NEW |
| `templates/page.catering.json` | Template — composes the section | NEW |

No shared files were modified. `hb-home.css` (tokens) is untouched.

---

### Page structure

```
<nav>  ← hb-header (global)

<section class="hb-catering-section">
  ├── .catering__header
  │     └── h1.catering__heading   "Catering"
  │
  ├── .catering__embed
  │     └── iframe.catering__form   ← JotForm 261770601059051, auto-resized
  │
  └── .catering__hero               ← optional photo, below the form
        └── img.catering__hero-img

<footer>  ← hb-footer (global)
```

---

### ⚠️ The key technical decision (read this)

You asked for this snippet between the H1 and the image:

```html
<script type="text/javascript" src="https://form.jotform.com/jsform/261770601059051"></script>
```

**It is not pasted in as-is, on purpose.** Two reasons:

1. **Shopify strips `<script>` tags** from section setting fields (`html` / `richtext`
   types). So the jsform snippet — or the iframe-embed snippet, which also carries two
   `<script>` tags — cannot live in an editable setting. It would silently vanish.
2. The `jsform` script writes the form into the page via `document.write`, which is
   fragile in Shopify sections (theme editor re-renders, async loads).

So instead: the **iframe** is hard-coded server-side in `hb-catering.liquid`, and the
**JotForm embed handler** (`for-form-embed-handler.js` — the script that auto-resizes
the iframe to the form's height so there's no internal scrollbar) is loaded by
`hb-catering.js`, which listens for `shopify:section:load` per theme rules.

Net result: identical end behaviour to the embed code you pasted, but robust inside
Shopify and editable from the customiser. The form ID is a section setting, so the form
can be swapped without touching code.

---

### Non-negotiable theme dev rules

1. **HTML/Liquid first** — the iframe is server-side and indexable.
2. **JS never injects form content** — `hb-catering.js` only initialises the resize handler.
3. **`shopify:section:load`** — all custom JS listens for it (done).
4. **Defer non-critical scripts** — the `<script>` tag in the section has `defer`.

---

### Typography (from Notion brand system — tokens in hb-home.css)

| Element | Family | Weight | Desktop | Mobile |
|---|---|---|---|---|
| H1 (Catering) | Helvetica | Bold 700 | 52px | 50px |

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

### ⚠️ Decisions & flags (confirm before go-live)

1. **Order = H1 → Form → Image**, as you specified. Note this pushes the hero photo
   below the full form, so it's well below the fold (especially mobile). If the photo
   is meant to be the first thing guests see, flip to H1 → Image → Form (move the
   `.catering__hero` block above `.catering__embed` in the Liquid).
2. **Hero image is optional and currently a placeholder.** It expects
   `hb-catering-hero.png` in `/assets`. No asset = the whole hero block is skipped
   cleanly (no broken image). Upload the real photo or set one via the image picker.
3. **No earn-points badge** (unlike Order Now). Catering enquiries aren't a loyalty
   earn event — confirm that's right. Easy to add back if wanted.
4. **`onload="window.parent.scrollTo(0,0)"` was dropped** from JotForm's default iframe.
   It force-scrolls the whole page to the top when the form loads, which is jarring
   mid-page. Left out deliberately. Say the word if you want it back.
5. **Initial form height = 539px** (JotForm's default) purely to prevent a layout jump
   before the handler resizes it. The handler takes over on load. Adjustable via the
   "Initial form height" setting.
6. **Spacing mirrors Order Now** (header padding, 32/40px gap to the form, 48/64px to
   the photo). Tune in `hb-catering.css` once there's a comp to match.

---

### Shopify admin setup (after build)

1. Create a new page → title **"Catering"** → handle **`catering`** (so `/pages/catering` resolves).
2. Assign template **`page.catering`**.
3. (Optional) Upload the hero photo as `hb-catering-hero.png`, or set it via the
   section's image picker in Customise. Leave blank to ship form-only.
4. Confirm the form loads and auto-sizes (no internal scrollbar) on desktop + mobile.
