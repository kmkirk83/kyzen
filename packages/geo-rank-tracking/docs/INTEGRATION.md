# Kyzen GEO Rank Tracking – Integration Guide

## Package contents

```
kyzen-geo-rank-tracking/
├── types/geo-rank.ts          # Types + status/engine metadata
├── data/sample-measurement.json
├── components/
│   ├── EngineRankCard.tsx
│   ├── EngineRankingsGrid.tsx
│   ├── EngineRankDetail.tsx
│   └── GeoRankSection.tsx
└── docs/INTEGRATION.md
```

## 1. Types

Copy `types/geo-rank.ts` into your project types folder.  
Extend your existing `MeasurementRun` type with:

```ts
trackGeoRanks: boolean;
engineRanks: EngineRank[];
```

## 2. UI Placement (matching reference screenshot)

In the Measurements / Evidence view:

```
┌────────────────────────────────────────────────────────┐
│  Left: Run measurement panel                            │
│  + new toggle: “Track GEO ranks”                        │
│                                                         │
│  Right:                                                 │
│  ┌─ Kyzen Score gauge (existing) ─────────────────────┐ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Engine Rankings (new GeoRankSection) ──────────────┐ │
│  │  [ChatGPT] [Perplexity]                             │ │
│  │  [Google AI] [Gemini]                               │ │
│  │  [Claude] [Copilot]                                 │ │
│  │  [Grok]                                             │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 3. Minimal usage

```tsx
import { GeoRankSection } from "./components/GeoRankSection";
import sample from "./data/sample-measurement.json";

// Inside your Evidence panel:
<GeoRankSection
  ranks={sample.engineRanks}
  isLoading={false}
  trackGeoRanksEnabled={true}
/>
```

## 4. Run panel toggle

Add to the left-side options:

```tsx
<label className="flex items-center justify-between">
  <span className="text-sm text-white/80">Track GEO ranks</span>
  <Toggle checked={trackGeoRanks} onChange={setTrackGeoRanks} />
</label>
```

When enabled, the measurement pipeline should populate `engineRanks`.

## 5. Visual language

- Cards use the same dark translucent treatment as the Security / Reliability / Operational cards in the reference.
- Status badges reuse the pill style already present in the product.
- Staggered entrance is handled via simple CSS animation delays.
- Detail view is a centered modal/drawer for focus.

## 6. Next engineering steps

1. Wire the toggle into the measurement request payload.
2. Extend the measurement worker / mock provider to return `EngineRank[]`.
3. Persist `engineRanks` on the MeasurementRun record.
4. Optionally feed an aggregate GEO rank signal into the main Kyzen Score calculation.
