# Hoodburger — Cursor Build Brief
## Order Now Page

---

### What you're building

The **Order Now** page (`/pages/order-now`). See Figma:
- Desktop: `https://www.figma.com/design/cRjbVkrcT1wMuRheABgpPZ/Hoodburger-I-Web-Design?node-id=17-11699&m=dev`
- Mobile:  `https://www.figma.com/design/cRjbVkrcT1wMuRheABgpPZ/Hoodburger-I-Web-Design?node-id=17-11893&m=dev`

---

### Stack

- Shopify Dawn v15.4.1 (custom build on top — do not modify Dawn core files)
- HTML + Liquid + CSS only. No frameworks, no Tailwind, no React.
- JS for UI interactions only. All content server-side.

---

### Files

| File | Purpose |
|---|---|
| `sections/hb-order-now.liquid` | Main section — heading, hero, embed placeholder |
| `assets/hb-order-now.css` | All styles for this page |
| `assets/hb-order-now.js` | Stub — for any Storefront embed init if needed |
| `templates/page.order-now.json` | Template JSON (assign in Shopify admin) |

---

### Non-negotiable theme dev rules

1. **HTML/Liquid first** — all content server-side and indexable without JS.
2. **JS toggles visibility only** — never inject content via JS.
3. **shopify:section:load** — all JS must listen for this event (not just `DOMContentLoaded`).
4. **Defer non-critical scripts** — the `<script>` tag in the section already has `defer`.

---

### Page structure

```
<nav>  ← hb-header (global, not in this section)

<section class="hb-order-now-section">
  ├── .order-now__header
  │     └── h1.order-now__heading  "Order Now"
  │
  ├── .order-now__hero
  │     ├── img.order-now__hero-img   (food photo, full-bleed)
  │     └── img.order-now__badge      (earn-points badge, top-left overlay)
  │
  └── .order-now__embed               ← INTENTIONALLY LEFT BLANK
        (Storefront embed code goes here — see below)

<footer>  ← hb-footer (global, not in this section)
```

---

### The embed section — INTENTIONALLY BLANK

The space between the hero image and the footer is **intentionally empty in the code**. It will be filled by a **Storefront embed** that has not been provided yet.

The embed will handle:
- A postcode input field
- A map that finds the nearest Hoodburger location
- Per-location buttons: **Order Delivery** and **Order Pickup**

**Do not build any custom ordering UI here.** No cards, no modal, no DoorDash links, no Bopple links. All of that logic lives inside the Storefront widget.

When the embed code is available:
1. Paste it into the `storefront_embed_code` field in the section settings (Shopify admin → Customise → Order Now section), or
2. Hard-code it inside `.order-now__embed` in the Liquid if it's a static snippet.

If Storefront requires a JS init call, add it to `hb-order-now.js`.

---

### Typography (from Figma / Notion brand system)

| Element | Family | Weight | Desktop | Mobile |
|---|---|---|---|---|
| H1 (Order Now) | Helvetica | Bold 700 | 52px | 50px |
| Body copy | Helvetica | Regular 400 | 16–18px | 16px |

Fonts via Adobe Fonts. CSS vars: `--font-base`, `--font-condensed`.

---

### Colour tokens (from hb-home.css — do not redefine)

```css
--c-red:    #F9423A;
--c-yellow: #FFD100;
--c-black:  #27251F;
--c-white:  #FFFFFF;
--c-hairline: rgba(39, 37, 31, 0.5);
```

---

### Figma note

The two Figma frames above show the heading + hero area only. The embed area below the hero is blank in the comp — that is intentional, not a missing frame. Check the full Figma file if you need to confirm spacing between the hero and footer.

---

### Shopify admin setup (after build)

1. Create a new page → title "Order Now" → assign template `page.order-now`
2. Customise the section: add hero image, fill in heading, upload earn-points badge asset
3. Paste Storefront embed code into the embed field when available
