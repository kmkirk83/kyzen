use client;

import { useEffect, useId, useState } from "react";
import {
  CATEGORY_INFO,
  type InfoKey,
  SAMPLE_ENGINE_RANKS,
  getVisibilitySummary,
  type DataMode,
} from "@/lib/visibility";
import { GeoRankSection } from "@/packages/geo-rank-tracking/components/GeoRankSection";

const MODE_KEY = "kyzen-data-mode";
const CHECKLIST_KEY = "kyzen-improvements-done";

function scoreTone(n: number) {
  if (n >= 70) return "good";
  if (n >= 50) return "mid";
  return "low";
}

function InfoTip({ infoKey }: { infoKey: InfoKey }) {
  const tip = CATEGORY_INFO[infoKey];
  const panelId = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className={`infoWrap ${open ? "open" : ""}`}>
      <button
        type="button"
        className="infoDot"
        aria-label={`About ${tip.title}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <span id={panelId} role="tooltip" className="infoPanel">
        <strong>{tip.title}</strong>
        <span>{tip.body}</span>
      </span>
    </span>
  );
}

function LabelWithInfo({
  children,
  infoKey,
}: {
  children: React.ReactNode;
  infoKey: InfoKey;
}) {
  return (
    <span className="labelWithInfo">
      <span>{children}</span>
      <InfoTip infoKey={infoKey} />
    </span>
  );
}

type EvidenceRun = {
  id: string;
  prompt: string;
  brandName: string;
  scores: { overall: number; coverage?: number; trust?: number; sentiment?: number };
  response: {
    measuredAt: string;
    citations: Array<{ title: string; url?: string }>;
    provider?: string;
    model?: string;
    rawText?: string;
  };
  evidence?: {
    mentioned: boolean;
    mentionCount: number;
    firstMentionOffset: number | null;
    isLive: boolean;
  };
  engineRanks?: typeof SAMPLE_ENGINE_RANKS;
};

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<DataMode>("sample");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const [evidence, setEvidence] = useState<EvidenceRun[]>([]);
  const [liveAgg, setLiveAgg] = useState<{
    overall: number;
    count: number;
    liveCount?: number;
    persisted?: boolean;
    providers?: string[];
  } | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(true);

  useEffect(() => {
    try {
      const m = localStorage.getItem(MODE_KEY) as DataMode | null;
      if (m === "sample" || m === "seeded") setMode(m);
      const raw = localStorage.getItem(CHECKLIST_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setEvidenceLoading(true);
    fetch("/api/visibility/measure")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.runs)) setEvidence(data.runs.slice(0, 12));
        if (data.aggregate) setLiveAgg(data.aggregate);
      })
      .catch(() => {})
      .finally(() => setEvidenceLoading(false));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(done));
    } catch {
      /* ignore */
    }
  }, [done]);

  const summary = getVisibilitySummary(mode);
  const providerLabel =
    liveAgg?.providers && liveAgg.providers.length > 0
      ? ` · ${liveAgg.providers.join(", ")}`
      : "";

  function toggleDone(item: { id: string }) {
    setDone((d) => ({ ...d, [item.id]: !d[item.id] }));
  }

  const engineRanks = evidence[0]?.engineRanks ?? SAMPLE_ENGINE_RANKS;

  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">Sample workspace · kyzen</span>
        </div>
        <div className="dashTopActions">
          <div className="modeToggle" role="group" aria-label="Data mode">
            <button type="button" className={mode === "sample" ? "active" : ""} onClick={() => setMode("sample")}>
              Sample
            </button>
            <button type="button" className={mode === "seeded" ? "active" : ""} onClick={() => setMode("seeded")}>
              Seeded
            </button>
          </div>
          <button
            type="button"
            className="hamburger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className={`menuOverlay ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen} onClick={() => setMenuOpen(false)} />
      <aside className={`sideMenu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="sideMenuHead">
          <strong>Menu</strong>
          <button type="button" className="sideClose" aria-label="Close" onClick={() => setMenuOpen(false)}>
            ×
          </button>
        </div>
        <nav className="sideNav">
          <a href="/">Home</a>
          <a href="/start">Product tour</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/onboarding">Onboarding</a>
        </nav>
        <p className="sideNote">Sample catalog</p>
      </aside>

      <main className="dashMain">
        <div className="modeBanner">
          {liveAgg && liveAgg.count > 0 ? (
            <>
              <strong>MEASUREMENTS (MOCK PROVIDER)</strong>
              <span>
                Evidence and aggregates from {liveAgg.count} run(s)
                {typeof liveAgg.liveCount === "number" ? ` (${liveAgg.liveCount} live)` : ""} stored for this
                workspace. Score cards above can still use Sample or Seeded catalogs for comparison.
              </span>
            </>
          ) : (
            <>
              <strong>Catalog scores</strong>
              <span>
                Score cards use the Sample or Seeded catalog. Run{" "}
                <a href="/onboarding">onboarding</a> or a measure API call to populate live Evidence.
              </span>
            </>
          )}
        </div>

        <section className="plane plane-raised scoreHero">
          <div className="scoreHeroLeft">
            <p className="chip">
              <LabelWithInfo infoKey="visibility">Visibility score</LabelWithInfo>
            </p>
            <h1 className={`bigScore tone-${scoreTone(summary.overallScore)}`}>{summary.overallScore}</h1>
            <p className="scoreSub">
              Weighted from coverage, trust, and sentiment. Mode: <strong>{summary.source}</strong>. Trend:{" "}
              <strong>{summary.trend}</strong>
            </p>
          </div>
          <div className="pillarRow">
            {(
              [
                ["Coverage", summary.pillars.coverage, "coverage"] as const,
                ["Trust", summary.pillars.trust, "trust"] as const,
                ["Sentiment", summary.pillars.sentiment, "sentiment"] as const,
              ] as const
            ).map(([label, value, key]) => (
              <div key={key} className="pillarCard">
                <span className="pillarLabel">
                  <LabelWithInfo infoKey={key}>{label}</LabelWithInfo>
                </span>
                <span className={`pillarValue tone-${scoreTone(value)}`}>{value}</span>
                <div className="barTrack">
                  <div className={`barFill tone-${scoreTone(value)}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surfaceSection">
          <h2>By surface</h2>
          <div className="surfaceGrid">
            {summary.surfaces.map((s) => {
              const weakest = Math.min(...summary.surfaces.map((x) => x.score));
              const strongest = Math.max(...summary.surfaces.map((x) => x.score));
              const priorityClass =
                s.score === weakest && weakest < strongest
                  ? "priority-weak"
                  : s.score === strongest
                    ? "priority-strong"
                    : "";
              return (
                <article key={s.key} id={`surface-${s.key}`} className={`surfaceCard ${priorityClass}`.trim()}>
                  <header>
                    <h3>
                      <LabelWithInfo infoKey={s.key}>{s.label}</LabelWithInfo>
                    </h3>
                    <span className={`surfaceScore tone-${scoreTone(s.score)}`}>{s.score}</span>
                  </header>
                  <ul className="metricList">
                    <li>
                      <span>
                        <LabelWithInfo infoKey="coverage">Coverage</LabelWithInfo>
                      </span>
                      <strong>{s.coverage}</strong>
                    </li>
                    <li>
                      <span>
                        <LabelWithInfo infoKey="trust">Trust</LabelWithInfo>
                      </span>
                      <strong>{s.trust}</strong>
                    </li>
                    <li>
                      <span>
                        <LabelWithInfo infoKey="sentiment">Sentiment</LabelWithInfo>
                      </span>
                      <strong>{s.sentiment}</strong>
                    </li>
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="improveSection plane" aria-labelledby="improve-heading">
          <div className="improveHead">
            <h2 id="improve-heading">Recommended improvements</h2>
            <p className="improveLede">
              Ranked from the scores above. Mark items done to track progress ({" "}
              {Object.values(done).filter(Boolean).length} / {summary.improvements.length} complete).
            </p>
          </div>
          <ul className="improveList">
            {summary.improvements.map((item) => {
              const isDone = !!done[item.id];
              return (
                <li key={item.id} className={`improveCard priority-${item.priority} ${isDone ? "isDone" : ""}`}>
                  <div className="improveTop">
                    <span className={`priorityPill priority-${item.priority}`}>{item.priority}</span>
                    <span className="impactTag">{item.impact}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="improveWhy">{item.why}</p>
                  <div className="improveActions">
                    <button
                      type="button"
                      className={`checkBtn ${isDone ? "checked" : ""}`}
                      aria-pressed={isDone}
                      onClick={() => toggleDone(item)}
                    >
                      {isDone ? "Done" : "Mark done"}
                    </button>
                    <a
                      className="improveCta"
                      href={item.href}
                      {...(item.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {item.cta}
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="improveSection plane" aria-labelledby="evidence-heading">
          <div className="improveHead">
            <h2 id="evidence-heading">Evidence{providerLabel}</h2>
            <p className="improveLede">
              Recent measurement runs for this workspace. Mock responses are labeled; live runs appear when a
              provider key is configured.
            </p>
          </div>
          {evidenceLoading ? (
            <div className="evidenceSkeleton" aria-busy="true" aria-label="Loading evidence">
              <div className="skeletonCard" />
              <div className="skeletonCard" />
              <div className="skeletonCard" />
            </div>
          ) : evidence.length > 0 ? (
            <ul className="evidenceList">
              {evidence.map((run) => {
                const isLive = run.evidence?.isLive ?? run.response.provider !== "mock";
                const mentioned = run.evidence?.mentioned;
                const mentionCount = run.evidence?.mentionCount;
                const overall = run.scores.overall;
                const scoreClass =
                  overall >= 70 ? "score-high" : overall >= 50 ? "score-mid" : "score-low";
                return (
                  <li key={run.id} className={`evidenceCard ${scoreClass}`}>
                    <div className="evidenceCardHead">
                      <div>
                        <div className="evidenceBrand">{run.brandName}</div>
                        <div className="evidenceMeta" style={{ marginTop: "0.35rem" }}>
                          <span
                            className={`evidenceChip ${isLive ? "" : "mock"}`}
                            title={isLive ? "Live provider response" : "Mock / demo response"}
                          >
                            {isLive ? "live" : "mock"}
                          </span>
                        </div>
                      </div>
                      <span className={`evidenceScore tone-${scoreTone(overall)}`}>{overall}</span>
                    </div>
                    <p className="evidencePrompt">{run.prompt}</p>
                    {run.response.rawText && (
                      <p className="evidenceExcerpt">
                        {run.response.rawText.slice(0, 160)}
                        {run.response.rawText.length > 160 ? "…" : ""}
                      </p>
                    )}
                    <div className="evidenceFoot">
                      <span>{run.response.measuredAt?.slice(0, 19).replace("T", " ")}</span>
                      {run.response.provider && (
                        <span>
                          {run.response.provider}
                          {run.response.model ? ` / ${run.response.model}` : ""}
                        </span>
                      )}
                      {run.response.citations?.length ? (
                        <span>{run.response.citations.length} citation(s)</span>
                      ) : null}
                      {typeof mentioned === "boolean" && (
                        <span>
                          {mentioned
                            ? `mentioned${typeof mentionCount === "number" ? ` ×${mentionCount}` : ""}`
                            : "not mentioned"}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="emptyEvidence">
              <p className="improveWhy">
                No live measurement runs yet. Catalog scores above are for evaluation only.
              </p>
              <div className="heroActions">
                <a className="btnPrimary" href="/onboarding">
                  Start setup wizard
                </a>
                <a className="btnGhost" href="/start">
                  Product tour
                </a>
              </div>
            </div>
          )}

          <div className="mt-6">
            <GeoRankSection ranks={engineRanks} isLoading={evidenceLoading} trackGeoRanksEnabled={true} />
          </div>
        </section>

        <section className="howSection">
          <h2>How scoring works</h2>
          <p>
            Each surface scores <code>coverage × 40% + trust × 40% + sentiment × 20%</code>. Sample and Seeded
            modes provide comparable catalogs; live Evidence comes from the measure API. Engine Rankings show
            mention and citation position across major AI models when GEO tracking is enabled. Structured
            evidence (mentioned, mentionCount, isLive) is attached to every measurement run.
          </p>
          <ul>
            {summary.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
