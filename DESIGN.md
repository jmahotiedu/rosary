# Rosary Design Contract

Chapel-desk direction: quiet utility chrome + liturgical print for prayer text.
The connected wooden Rosary is the only signature object. Warm wood lives on beads and cord only.

Agents must follow `.agents/skills/rosary-product-ux/SKILL.md` and this file.
Do not use a generic frontend-design skill as the design authority.

## Type roles

| Role | Face | Weight | Size |
|------|------|--------|------|
| Chrome / UI | Source Sans 3 | 400-600 | compact |
| Product title | Source Sans 3 | <=600 | ~1.25rem |
| Prayer body | Source Serif 4 | 400 | 1.05-1.15rem, line-height ~1.65 |
| Step label | Source Sans 3 | 600 | modest, not a marketing hero |

## Surfaces and color

- Cool linen/stone paper for page and panels (`--canvas`, `--surface`).
- Near-black ink (`--ink`); muted secondary (`--muted`).
- One chrome accent: wood-dark for primary actions.
- Focus blue for accessibility only.
- Bead fills may keep walnut/cord/gold metal on the SVG itself.

## Layout rules

- Radius <=8px on chrome.
- Borders or light separation; no heavy stacked shadows.
- Progress is plain text completion count (`N of M prayers`), never a ring.
- One primary action at a time; Previous and Start over always recoverable.
- Left-aligned reading copy.

## Banned

Do not introduce any of the following:

- Inter, Geist, Space Grotesk, Instrument Serif, DM Sans, Poppins, Montserrat
- Purple / indigo / violet gradients
- Warm cream-amber brochure palette (`#f5efe4`, gold radial washes on chrome)
- Progress rings or conic completion gauges
- `box-shadow` blur greater than 8px on chrome
- Border radius greater than 8px on chrome cards/panels
- Uppercase micro-eyebrows with wide letter-spacing
- Left-edge colored accent bars on cards
- Decorative sheet handles
- Marketing hero type (`clamp` display sizes for the product title)
- Gradient buttons or multi-stop decorative gradients on chrome
