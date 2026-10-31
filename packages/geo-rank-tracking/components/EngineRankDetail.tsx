/**
 * EngineRankDetail
 * Expanded evidence view for a single engine rank.
 */

import React from "react";
import { EngineRank, ENGINE_META, STATUS_META } from "../types/geo-rank";

interface Props {
  rank: EngineRank;
  onClose: () => void;
}

export function EngineRankDetail({ rank, onClose }: Props) {
  const meta = ENGINE_META[rank.engine];
  const status = STATUS_META[rank.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: meta.color + "33", color: meta.color }}
            >
              {meta.short}
            </div>
            <div>
              <div className="font-medium text-white">{meta.label}</div>
              <div className="text-xs text-white/40">
                Measured {new Date(rank.measuredAt).toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-sm"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}
            >
              {status.label}
            </span>
            {rank.isPrimaryRecommendation && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Primary recommendation
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Metric label="Mention Rank" value={rank.mentionRank ?? "—"} />
            <Metric label="Citation Rank" value={rank.citationRank ?? "—"} />
            <Metric label="Share of Voice" value={`${rank.shareOfVoice}%`} />
          </div>

          {rank.answerSnippet && (
            <div>
              <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
                Answer snippet
              </div>
              <p className="text-sm text-white/80 leading-relaxed bg-white/5 rounded-lg p-3 border border-white/5">
                {rank.answerSnippet}
              </p>
            </div>
          )}

          {rank.sourcesCited.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
                Sources cited
              </div>
              <ul className="space-y-1">
                {rank.sourcesCited.map((src) => (
                  <li
                    key={src}
                    className="text-sm text-cyan-400/90 truncate"
                  >
                    {src}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
        {label}
      </div>
      <div className="text-xl font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}
