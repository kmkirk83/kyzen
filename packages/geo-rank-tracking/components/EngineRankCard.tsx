/**
 * EngineRankCard
 * Matches Kyzen reference UI: dark cards, status badges, staggered entrance feel.
 */

import React from "react";
import {
  AIEngine,
  EngineRank,
  ENGINE_META,
  STATUS_META,
} from "../types/geo-rank";

interface Props {
  rank: EngineRank;
  onSelect?: (rank: EngineRank) => void;
  className?: string;
}

export function EngineRankCard({ rank, onSelect, className = "" }: Props) {
  const meta = ENGINE_META[rank.engine];
  const status = STATUS_META[rank.status];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(rank)}
      className={`
        group relative w-full text-left rounded-xl border border-white/10
        bg-[#0f172a]/80 backdrop-blur-sm
        p-4 transition-all duration-200
        hover:border-white/20 hover:bg-[#0f172a]
        focus:outline-none focus:ring-2 focus:ring-cyan-500/40
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white/90"
            style={{ backgroundColor: meta.color + "33" }}
          >
            {meta.short}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{meta.label}</div>
            <div className="text-[11px] text-white/40">
              {rank.measuredAt
                ? new Date(rank.measuredAt).toLocaleTimeString()
                : "—"}
            </div>
          </div>
        </div>

        <span
          className={`
            inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium
            border ${status.bg} ${status.text} ${status.border}
          `}
        >
          {status.label}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">
            Mention
          </div>
          <div className="text-lg font-semibold text-white tabular-nums">
            {rank.mentionRank ?? "—"}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">
            Citation
          </div>
          <div className="text-lg font-semibold text-white tabular-nums">
            {rank.citationRank ?? "—"}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">
            Share
          </div>
          <div className="text-lg font-semibold text-white tabular-nums">
            {rank.shareOfVoice}%
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-white/40">
        <span>
          {rank.isPrimaryRecommendation ? "Primary recommendation" : "Mentioned"}
        </span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          View evidence →
        </span>
      </div>
    </button>
  );
}
