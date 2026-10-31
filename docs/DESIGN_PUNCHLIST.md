# Design Punch-list — kyzen (2026-10-31)

Gate: design-quality-gate (Impeccable / Hallmark-informed)  
Surfaces: `/dashboard`, `/start`, `/onboarding`

## P0 — Must fix before sale assets / Loom

| ID | Surface | Issue | Fix |
|----|---------|-------|-----|
| P0-1 | `/start` | Three buttons of near-equal weight in hero | Keep only “Open dashboard” as `.btnPrimary`. Demote the other two to `.btnGhost` / quieter treatment. |
| P0-2 | `/onboarding` (Welcome) | “Start environment check” and “Open dashboard” compete | Keep “Start environment check” as sole primary. Demote “Open dashboard” to quiet. |
| P0-3 | `/onboarding` | Active step not dominant enough | Strengthen `.onboardProgress li.active` (filled index + clearer contrast). |
| P0-4 | `/dashboard` | Live Measurements banner competes with headline score | Visually demote banner and move below score hierarchy. |

## P1 — Recommended polish

| ID | Surface | Issue | Fix |
|----|---------|-------|-----|
| P1-1 | `/dashboard` | Sample / Seeded selected state weak | Stronger selected toggle treatment. |
| P1-2 | `/dashboard` | Pillar cards equal weight | Slightly emphasize weakest pillar or give score more optical weight. |
| P1-3 | `/start` | Suggested path feels list-heavy | Optional tighter sequencing / numbered visual weight. |
| P1-4 | `/onboarding` | Welcome bullets read as feature list | Outcome-oriented short lines. |

## P2 — Later

- Capture any remaining token drift into DESIGN.md
- Light “bolder” pass on marketing tone if raising perceived sale value
- Optional progress micro-copy (“Step 1 of 5”)

## Status

- DESIGN.md added (token + hierarchy rules)
- P0-1, P0-2, P0-3, P0-4 implemented in this pass
- P1 left for follow-up

## Residual risks

- Product still reads as a strong technical foundation more than a distinctive brand. Acceptable for $4–9k digital asset; further brand elevation is optional.
- Future agent edits must respect single-primary-CTA rule and DESIGN.md tokens.
