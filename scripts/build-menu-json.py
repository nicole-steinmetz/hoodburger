#!/usr/bin/env python3
"""Build menu JSON + Liquid snippet from Figma desktop metadata export."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META = Path(
    "/Users/nicolesteinmetz/.cursor/projects/Users-nicolesteinmetz-Documents-hoodburger-theme/agent-tools/0acf76ff-3196-4ec1-bbbe-aabab92382f0.txt"
)

desktop = META.read_text()
img_re = re.compile(
    r'rounded-rectangle id="([^"]+)" name="([^"]+)" x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"'
)
text_re = re.compile(
    r'text id="([^"]+)" name="([^"]+)" x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"'
)

SKIP_IMG = re.compile(r"rectangle \d|mask|background|231005|earn-points", re.I)
BADGE_NAMES = {
    "Nut-free",
    "Sesame risk",
    "Halal",
    "Vegetarian",
    "Egg-free",
    "Dairy-free",
    "Gluten-friendly",
    "Soy-free",
}

BADGE_SLUGS = {
    "Halal": "halal",
    "Nut-free": "nut",
    "Vegetarian": "veg",
    "Soy-free": "soy",
    "Egg-free": "egg",
    "Dairy-free": "dairy",
    "Gluten-friendly": "gluten",
    "Sesame risk": "sesame",
}

BADGE_ICON = (
    '<svg class="menu-badge__icon" width="13" height="13" viewBox="0 0 13 13" '
    'fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    '<circle cx="6.5" cy="6.5" r="6" stroke="currentColor" stroke-width="1"/>'
    '<path d="M4 6.5L5.8 8.5L9 5" stroke="currentColor" stroke-width="1.2" '
    'stroke-linecap="round" stroke-linejoin="round"/>'
    "</svg>"
)


def slug(s):
    s = html.unescape(s)
    s = re.sub(r"\s+", " ", s).strip()
    return re.sub(r"[^a-zA-Z0-9]+", "-", s.lower()).strip("-")[:80]


def asset_name(img_name, title=None):
    base = title or img_name
    base = re.sub(r"\s*\(\d+\)\s*", " ", base)
    base = re.sub(r"\s+", " ", base).strip()
    base = re.sub(r"^HOODBURGER---[^-]+-", "", base)
    base = base.replace("HOODBURGER-SAUCES-", "").replace("HOODBURGER---BURGERS-", "")
    return f"hb-menu-{slug(base)}.jpg"


def category_for(y):
    if y < 4670:
        return "burgers"
    if y < 8460:
        return "sides"
    return "drinks"


def group_for(y):
    if y < 4670:
        return "Burger Menu"
    if y < 8460:
        return "Sides and Sauces"
    return "Cold Drinks"


imgs = []
for m in img_re.finditer(desktop):
    nid, name, x, y, w, h = (
        m.group(1),
        m.group(2),
        int(m.group(3)),
        int(m.group(4)),
        int(m.group(5)),
        int(m.group(6)),
    )
    if SKIP_IMG.search(name):
        continue
    if h < 150 or w < 150:
        continue
    imgs.append({"id": nid, "name": name, "x": x, "y": y, "w": w, "h": h})

# Hot Tender uses a wide hero crop — include manually
EXTRA_IMAGES = [
    {
        "id": "17:8229",
        "name": "HOODBURGER---BURGERS- Tender Supreme 1",
        "x": 394,
        "y": 2817,
        "w": 332,
        "h": 218,
    }
]
for extra in EXTRA_IMAGES:
    if not any(i["id"] == extra["id"] for i in imgs):
        imgs.append(extra)

txts = []
for m in text_re.finditer(desktop):
    name, x, y, w, h = (
        html.unescape(m.group(2)),
        int(m.group(3)),
        int(m.group(4)),
        int(m.group(5)),
        int(m.group(6)),
    )
    if name in (
        "BURGERS",
        "SIDE AND SAUCES",
        "COLD DRINKS",
        "ORDER NOW",
        "Eat hamburgers, become a Wizard, get rewards.",
    ):
        continue
    txts.append({"name": name, "x": x, "y": y, "w": w, "h": h})

deduped = []
for img in sorted(imgs, key=lambda i: (i["y"], i["x"])):
    if (
        deduped
        and abs(deduped[-1]["y"] - img["y"]) < 40
        and abs(deduped[-1]["x"] - img["x"]) < 40
    ):
        if img["w"] * img["h"] > deduped[-1]["w"] * deduped[-1]["h"]:
            deduped[-1] = img
        continue
    extra_ids = {e["id"] for e in EXTRA_IMAGES}
    if (
        img["h"] < 250
        and img["id"] not in extra_ids
        and any(abs(img["y"] - d["y"]) < 100 for d in deduped)
    ):
        continue
    deduped.append(img)

items = []
for img in sorted(deduped, key=lambda i: (i["y"], i["x"])):
    col_x = img["x"]
    title = None
    desc = None
    candidates = [
        t
        for t in txts
        if t["y"] > img["y"] + img["h"] - 50
        and t["y"] < img["y"] + img["h"] + 220
        and abs(t["x"] - col_x) < 80
    ]
    for t in sorted(candidates, key=lambda t: t["y"]):
        if t["name"] in BADGE_NAMES:
            continue
        if t["h"] >= 90 and not desc and len(t["name"]) > 40:
            desc = t["name"]
        elif t["h"] < 90 and not title:
            title = t["name"]

    if img["id"] == "17:8229":
        title = "Hot Tender Sandwich"
        desc = (
            "Two hot & spicy chicken tenders with hot smokey mayonnaise, dill pickles, "
            "jalapeños and lettuce. Warning: It is actually hot. Try it with heavy cheese and/or bacon!"
        )

    if not title:
        title = re.sub(r"\s*\d+$", "", img["name"])
        title = re.sub(r"\(\d+\)", "", title).strip(" -")
        title = title.replace("HOODBURGER---BURGERS-", "").replace("HOODBURGER-SAUCES-", "")

    badge_candidates = [
        t
        for t in txts
        if img["y"] + img["h"] < t["y"] < img["y"] + img["h"] + 320
        and abs(t["x"] - col_x) < 200
        and t["name"] in BADGE_NAMES
    ]
    badges = []
    for t in badge_candidates:
        if t["name"] not in badges:
            badges.append(t["name"])

    if img["id"] == "17:8229" and not badges:
        badges = ["Nut-free", "Halal", "Sesame risk"]

    cat = category_for(img["y"])
    grp = group_for(img["y"])
    items.append(
        {
            "category": cat,
            "group": grp,
            "title": title,
            "description": desc or "",
            "badges": badges,
            "image": asset_name(img["name"], title),
            "figma_image": img["name"],
            "figma_id": img["id"],
        }
    )

fixes = {
    "unsure cup 1": ("Reaper Ketchup Cup", "sides", "Sides and Sauces"),
    "blue cheese-HOODBURGER-SAUCES-09 1": ("Blue Cheese Cup", "sides", "Sides and Sauces"),
    "Mash &amp; Gravy  (1) 1": ("Mash & Gravy", "sides", "Sides and Sauces"),
    "JArritos Lime 2": ("Jarritos", "drinks", "Cold Drinks"),
    "Arizona Grapeade 2": ("Arizona Grapeade", "drinks", "Cold Drinks"),
    "Passiona 1": ("Passiona", "drinks", "Cold Drinks"),
    "Coca Cola (1) 1": ("Coke", "drinks", "Cold Drinks"),
    "Fanta Strawberry 1": ("Fanta", "drinks", "Cold Drinks"),
    "Regular fries (1) 1": ("French Fries Regular", "sides", "Sides and Sauces"),
    "Small Fries (1) 1": ("French Fries Small", "sides", "Sides and Sauces"),
    "Large Fries (1) 1": ("French Fries Large", "sides", "Sides and Sauces"),
    "Chicken Tender - 1 Pack (1) 1": ("Chicken Tender - 1 Pack", "sides", "Sides and Sauces"),
    "Chicken Tender - 2 Pack (1) 1": ("Chicken Tender - 2 Pack", "sides", "Sides and Sauces"),
    "Chicken Tender - 3 Pack (1) (1) 1": ("Chicken Tender - 3 Pack", "sides", "Sides and Sauces"),
}
desc_fixes = {
    "Coke": "Can — Cherry, No Sugar, Vanilla",
    "Fanta": "Grape can, Peach can, Pineapple can, Strawberry can, Berry can",
    "Jarritos": "Lime",
    "Ribwich": "150g organic pork smashed patty, sweet BBQ sauce, onions, dill pickles. Try it with bacon and/or jalapeños!",
    "Tender Mash and Gravy": "Two original chicken tenders with American cheddar, creamy mashed potato and rich chicken gravy. Try to with heavy cheese and/or bacon!",
    "Honey Butter Sandwich": "Two original chicken tenders with American cheddar, lettuce, tomato, minced onion, dill pickles, mustard, ketchup and mayonnaise. Try it with bacon and/or heavy cheese!",
    "Kids Burger": "Smaller milk bun, organic smashed beef mini patty, American cheddar and ketchup!",
}
title_fixes = {
    "Regular fries": "French Fries Regular",
    "Small Fries": "French Fries Small",
    "Chicken Tender": "Chicken Tender - 1 Pack",
}

for it in items:
    if it["figma_image"] in fixes:
        it["title"], it["category"], it["group"] = fixes[it["figma_image"]]
        it["image"] = asset_name(it["title"])
    if it["title"] in title_fixes:
        it["title"] = title_fixes[it["title"]]
        it["image"] = asset_name(it["title"])
    if it["title"] in desc_fixes and not it["description"]:
        it["description"] = desc_fixes[it["title"]]

# Reorder Hot Tender after Tender Deluxe in burgers
hot = next((i for i in items if i["title"] == "Hot Tender Sandwich"), None)
if hot:
    items.remove(hot)
    idx = next(
        (n for n, i in enumerate(items) if i["title"] == "Tender Deluxe"),
        len(items),
    )
    items.insert(idx + 1, hot)

menu = {
    "tabs": [
        {"id": "burgers", "label": "Burgers"},
        {"id": "sides", "label": "Sides and Sauces"},
        {"id": "drinks", "label": "Cold Drinks"},
    ],
    "categories": [],
}

for cat in ["burgers", "sides", "drinks"]:
    cat_items = [i for i in items if i["category"] == cat]
    sections = []
    seen = []
    for it in cat_items:
        if it["group"] not in seen:
            seen.append(it["group"])
            sections.append({"title": it["group"], "items": []})
        sections[[g["title"] for g in sections].index(it["group"])]["items"].append(
            {
                "title": it["title"],
                "description": it["description"],
                "badges": it["badges"],
                "image": it["image"],
            }
        )
    menu["categories"].append({"id": cat, "sections": sections})

out = ROOT / "assets/hb-menu-data.json"
out.write_text(json.dumps(menu, indent=2, ensure_ascii=False) + "\n")

manifest = ROOT / "assets/hb-menu-figma-manifest.json"
manifest.write_text(
    json.dumps(
        [{"figma_id": i["figma_id"], "figma_image": i["figma_image"], "image": i["image"]} for i in items],
        indent=2,
    )
    + "\n"
)

def liquid_escape(s):
    return (
        html.escape(s, quote=True)
        .replace("'", "&#39;")
    )


def render_liquid(menu_data):
    lines = [
        "{%- comment -%} Auto-generated by scripts/build-menu-json.py — do not edit by hand {%- endcomment -%}"
    ]
    for category in menu_data["categories"]:
        if category["id"] == "drinks":
            lines.append('<div id="menu-drinks" class="menu__section">')
            lines.append("  {% render 'hb-drinks-content' %}")
            lines.append("</div>")
            continue
        section_class = "menu__section"
        if category["id"] == "burgers":
            section_class += " menu__section--burgers"
        lines.append(f'<div id="menu-{category["id"]}" class="{section_class}">')
        for group in category["sections"]:
            if group["title"] and group["title"] != "Chicken & Tender Sandwiches":
                lines.append(f'  <h2 class="menu__heading">{liquid_escape(group["title"])}</h2>')
            lines.append('  <div class="menu__grid">')
            for item in group["items"]:
                lines.append("    <article class=\"menu-card\">")
                if item["image"]:
                    lines.append('      <div class="menu-card__media">')
                    lines.append(
                        f"        <img src=\"{{{{ '{item['image']}' | asset_url }}}}\" "
                        f"alt=\"{liquid_escape(item['title'])}\" loading=\"lazy\" width=\"302\" height=\"302\">"
                    )
                    lines.append("      </div>")
                if item["title"]:
                    lines.append(
                        f'      <h3 class="menu-card__title">{liquid_escape(item["title"])}</h3>'
                    )
                if item["description"]:
                    lines.append(
                        f'      <p class="menu-card__desc">{liquid_escape(item["description"])}</p>'
                    )
                if item["badges"]:
                    lines.append('      <ul class="menu-card__badges">')
                    for badge in item["badges"]:
                        badge_slug = BADGE_SLUGS.get(badge, slug(badge))
                        lines.append(
                            f'        <li class="menu-badge menu-badge--{badge_slug}">{BADGE_ICON}{liquid_escape(badge)}</li>'
                        )
                    lines.append("      </ul>")
                lines.append("    </article>")
            lines.append("  </div>")
        if category["id"] == "burgers":
            lines.append("  {% render 'hb-menu-dietary-callout' %}")
        lines.append("</div>")
    return "\n".join(lines) + "\n"


content_snippet = ROOT / "snippets/hb-menu-content.liquid"
content_snippet.write_text(render_liquid(menu))

print(f"Wrote {len(items)} items to {out} and {content_snippet}")
