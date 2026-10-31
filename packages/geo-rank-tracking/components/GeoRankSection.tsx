/**
 * GeoRankSection
 * Drop-in section for the Evidence / Measurements view.
 * Place below the main Kyzen Score gauge.
 */

import React, { useState } from "react";
import { EngineRank } from "../types/geo-rank";
import { EngineRankingsGrid } from "./EngineRankingsGrid";
import { EngineRankDetail } from "./EngineRankDetail";

interface Props {
  ranks: EngineRank[];
  isLoading?: boolean;
  trackGeoRanksEnabled?: boolean;
}

export function GeoRankSection({
  ranks,
  isLoading = false,
  trackGeoRanksEnabled = true,
}: Props) {
  const [selected, setSelected] = useState<EngineRank | null>(null);

  if (!trackGeoRanksEnabled) {
    return null;
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white/80 tracking-wide">
          Engine Rankings
        </h2>
        <span className="text-[11px] text-white/40">
          {ranks.length} engines measured
        </span>
      </div>

      <EngineRankingsGrid
        ranks={ranks}
        isLoading={isLoading}
        onSelect={setSelected}
      />

      {selected && (
        <EngineRankDetail rank={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
