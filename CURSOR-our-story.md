# Hoodburger — Cursor Build Brief
## Our Story / About Page

---

### What you're building

The **Our Story** page. **Handle must be `about`** — the footer already links to
`/pages/about` (`sections/hb-footer.liquid`, link_1). Template: `page.about`.

Figma:
- Desktop: `https://www.figma.com/design/cRjbVkrcT1wMuRheABgpPZ/Hoodburger-I-Web-Design?node-id=17-13043&m=dev`
- Mobile:  `https://www.figma.com/design/cRjbVkrcT1wMuRheABgpPZ/Hoodburger-I-Web-Design?node-id=17-13297&m=dev`

---

### Stack

- Shopify Dawn v15.4.1 (custom build on top — do not modify Dawn core files)
- HTML + Liquid + CSS only. No frameworks, no Tailwind, no React.
- All content server-side. No JS in this page.

---

### Files (all scaffolded, ready to review)

| File | Purpose | Status |
|---|---|---|
| `sections/hb-story-hero.liquid` | Full-bleed hero photo + earn-points badge (desktop only) | NEW |
| `sections/hb-story-about.liquid` | Hairline-bordered About card (image + text + socials) | NEW |
| `sections/hb-cta-bar.liquid` | Yellow CTA band | **REUSED — do not duplicate** |
| `assets/hb-story.css` | All styles for this page | NEW |
| `templates/page.about.json` | Template — composes the 3 sections in order | NEW |

No shared files were modified. `hb-home.css` (tokens + `.cta-bar` + `.btn` styles)
and `hb-footer.liquid` are untouched.

---

### Page structure (3 sections, in this order)

```
<nav>  ← hb-header (global)

1. hb-story-hero        ← full-bleed photo, earn-points badge lower-left (desktop only)
2. hb-cta-bar           ← REUSED yellow band: "Eat hamburgers, become a Wizard, get rewards."
                          + red "Order Now" button (order variant)
3. hb-story-about       ← bordered card:
                            desktop → image left (55.5%) / About heading + body + socials right
                            mobile  → image top, text below

<footer>  ← hb-footer (global)
```

`hb-story.css` is loaded by BOTH new sections (Shopify dedupes the stylesheet tag),
so the hero is never unstyled regardless of section load order.

---

### Non-negotiable theme dev rules

1. **HTML/Liquid first** — all content server-side and indexable without JS.
2. **No JS on this page.**
3. Defer any non-critical scripts (none here).
4. **Do not duplicate the CTA bar** — it is the same `hb-cta-bar` section used on Home.

---

### Typography (from Figma / Notion brand system — tokens in hb-home.css)

| Element | Token | Family | Weight | Size |
|---|---|---|---|---|
| About heading (H3) | `--fs-h3` | Helvetica | Bold 700 | 24px |
| Body copy (P2) | `--fs-p2` | Helvetica | Regular 400 | 16px / lh 24px |
| CTA headline (H2) | `--fs-h2` | Helvetica | Bold 700 | 37px (handled by hb-cta-bar) |

Fonts via Adobe Fonts: `--font-base`, `--font-condensed`.

---

### Colour tokens (from hb-home.css `:root` — DO NOT redefine)

```css
--c-red:    #F9423A;   /* brand red — LOCKED. Comp shows #FF4438 on the button; brand red wins. */
--c-yellow: #FFD100;
--c-black:  #27251F;
--c-white:  #FFFFFF;
--c-hairline: rgba(39, 37, 31, 0.5);   /* card border, 0.5px */
--radius: 10px;
```

---

### Assets to upload (Shopify admin → Content → Files, then reference in /assets or via image_picker)

| Asset filename | Used by | Notes |
|---|---|---|
| `hb-story-hero.jpg` | hero (desktop) | Kitchen photo, full-bleed ~1440×964 |
| `hb-story-hero-mobile.jpg` | hero (mobile) | Tall crop ~393×814 |
| `hb-story-about.jpg` | About card | Interior photo ~710×461 |
| `hb-earn-points-badge.png` | hero badge | **Reuses the Order Now badge** — already in the theme |

Each section also exposes an `image_picker` that overrides the asset filename if you'd
rather pick from the media library.

---

### ⚠️ Decisions & flags (confirm before go-live)

1. **CTA variant differs from Home.** The comp shows a red **Order Now** button on
   desktop (`button_style: "order"`). Home uses the **Rewards** variant on desktop.
   I matched the comp. If it should mirror Home exactly, switch
   `button_style` to `"rewards"` in `page.about.json`.
2. **Earn-points badge is desktop-only** — it does not appear in the mobile comp, so
   it's hidden under 750px. Toggle via the section's "Show earn-points badge" setting.
3. **Badge position is approximate.** Lower-left, `left: clamp(20px,5.55vw,80px)`,
   `bottom: 12.3%`. Eyeball against the desktop comp and nudge if needed.
4. **Card corner radius** set to the house `--radius` (10px); the comp corners read
   near-square. Drop to 0 if the design intends hard corners.
5. **Card max-width** capped at 1280px (= 1440 − 2×80 margin) centred, matching site
   max behaviour. On >1440 screens the gutters grow rather than the card.
6. **Mobile heading size** kept at 24px (same as desktop). Confirm against the mobile
   comp — reduce to 20px if it should be smaller.

---

### Shopify admin setup (after build)

1. Create a new page → title **"Our Story"** → **handle `about`** (so the footer link resolves).
2. Assign template **`page.about`**.
3. Upload the four assets above (or set images via each section's image picker in Customise).
4. Confirm the CTA bar's Order Now link points to `/pages/order-now`.
