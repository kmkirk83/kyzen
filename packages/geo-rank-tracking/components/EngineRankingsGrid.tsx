/**
 * EngineRankingsGrid
 * Staggered grid of EngineRankCards – matches reference Evidence card layout.
 */

import React from "react";
import { EngineRank } from "../types/geo-rank";
import { EngineRankCard } from "./EngineRankCard";

interface Props {
  ranks: EngineRank[];
  onSelect?: (rank: EngineRank) => void;
  isLoading?: boolean;
}

export function EngineRankingsGrid({ ranks, onSelect, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[140px] rounded-xl border border-white/5 bg-white/5 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (!ranks.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-white/40 text-sm">
        No engine ranks yet. Enable “Track GEO ranks” and run a measurement.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ranks.map((rank, index) => (
        <div
          key={rank.engine}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
        >
          <EngineRankCard rank={rank} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
