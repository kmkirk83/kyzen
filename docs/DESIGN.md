# kyzen Design System

Last updated: 2026-10-31  
Source of truth for visual tokens and hierarchy rules used by the product UI.

## Principles

1. **One clear primary action per view.** Competing CTAs of equal weight are a P0 defect.
2. **Score is the hero on the dashboard.** Status banners and secondary controls must not compete with the headline Visibility Score.
3. **Honest labels.** Never invent metrics. Sample vs live data must be labeled.
4. **Restraint over decoration.** No purple gradients, side-stripe cards, glassmorphism theater, gradient text, or bounce easing.
5. **Consistent surfaces.** Cards use the same radius, border, and elevation language across dashboard, start, and onboarding.

## Color tokens

```css
--background: #060a12;
--surface: #0c1322;
--surface-2: #121b2e;
--surface-3: #182338;
--foreground: #f1f5f9;
--muted: #94a3b8;
--border: rgba(148, 163, 184, 0.14);
--border-strong: rgba(148, 163, 184, 0.28);
--accent: #38bdf8;          /* primary CTA + focus */
--accent-soft: rgba(56, 189, 248, 0.12);
--good: #34d399;
--mid: #fbbf24;
--low: #f87171;
```

## Typography

- Font stack: system UI sans (`ui-sans-serif, system-ui, …`)
- Marketing titles: clamp(1.8rem, 4vw, 2.6rem), tight tracking
- Body / lede: muted color, ~1.6 line-height
- Eyebrows: 0.75rem, slight letter-spacing, accent color (use sparingly)

## Spacing & radius

- Card / button radius: 12px
- Pill progress steps: 999px
- Consistent 0.65–1.25rem gaps in action rows
- Prefer the existing plane / surface card spacing over inventing new values

## Button hierarchy

| Class | Role | Visual |
|-------|------|--------|
| `.btnPrimary` | Single primary action on the view | Solid accent fill, dark text |
| `.btnGhost` | Secondary / tertiary | Border only, transparent-ish background |
| `.btnQuiet` (new) | Lowest emphasis escape hatch | Muted text link style or very subtle border |

Rule: at most **one** `.btnPrimary` in the main action cluster of a step or page.

## Progress / wizard steps

- Inactive: muted border + muted text
- Active: accent border + accent-soft background + stronger weight
- Done: good (green) treatment
- Active step must be visually dominant; inactive steps should not compete

## Dashboard-specific rules

- Headline Visibility Score is the primary focal point.
- Live Measurements / Evidence banner is secondary status (demoted visual weight).
- Sample ↔ Seeded toggle must show a clear selected state.

## Anti-slop (do not introduce)

- Side-tab / thick left accent borders on cards
- Purple / violet gradient backgrounds
- Gradient text on metrics or headings
- Decorative glassmorphism or heavy glow halos as the main look
- Competing equal-weight primary buttons
- Invented metrics or fake testimonials

## Change process

Any new surface should:

1. Reuse the tokens above.
2. Declare a single primary CTA.
3. Keep sample vs live data labels honest.
4. Pass the design-quality-gate before sale-asset screenshots.
