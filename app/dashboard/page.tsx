"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";

import {
  buildVisibilitySummary,
  type DataMode,
  type Improvement,
} from "@/lib/visibility-summary";

const CATEGORY_INFO = {
  visibility: {
    title: "Visibility score",
    body: "A single 0–100 headline for how present and well-regarded your brand is across AI answer surfaces. Weighted: coverage 40%, trust 40%, sentiment 20%.",
  },
  coverage: {
    title: "Coverage",
    body: "How often your brand appears in AI-generated answers for relevant queries.",
  },
  trust: {
    title: "Trust",
    body: "How strongly and cleanly you are cited when you appear.",
  },
  sentiment: {
    title: "Sentiment",
    body: "The tone of mentions about your brand in AI answers.",
  },
  answer_engines: {
    title: "Answer engines",
    body: "AI systems that return direct answers (overview-style answer boxes).",
  },
  assistants: {
    title: "Assistants",
    body: "Conversational AI assistants where users ask follow-up questions.",
  },
  search_overviews: {
    title: "Search overviews",
    body: "AI-generated overviews embedded in search results.",
  },
} as const;

type InfoKey = keyof typeof CATEGORY_INFO;
const CHECKLIST_KEY = "kyzen-improvement-checklist";
const MODE_KEY = "kyzen-data-mode";

function scoreTone(n: number) {
  if (n >= 70) return "good";
  if (n >= 45) return "mid";
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

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<DataMode>("sample");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const [evidence, setEvidence] = useState<
    Array<{ id: string; prompt: string; brandName: string; scores: { overall: number }; response: { measuredAt: string; citations: Array<{ title: string }> } }>
  >([]);
  const [liveAgg, setLiveAgg] = useState<{ overall: number; count: number; persisted?: boolean } | null>(null);


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
    fetch("/api/visibility/measure")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.runs)) setEvidence(data.runs.slice(0, 8));
        if (data.aggregate) setLiveAgg(data.aggregate);
      })
      .catch(() => {});
  }, [mode]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const summary = useMemo(
    () => buildVisibilitySummary("2026-10-22T00:00:00.000Z", mode),
    [mode],
  );

  function setModePersist(next: DataMode) {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  function toggleDone(item: Improvement) {
    setDone((prev) => {
      const next = { ...prev, [item.id]: !prev[item.id] };
      try {
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const completedCount = summary.improvements.filter((i) => done[i.id]).length;

  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">
            {summary.organization} · {summary.brand}
          </span>
        </div>
        <div className="dashTopActions">
          <div className="modeToggle" role="group" aria-label="Data mode">
            <button
              type="button"
              className={mode === "sample" ? "active" : ""}
              onClick={() => setModePersist("sample")}
            >
              Sample
            </button>
            <button
              type="button"
              className={mode === "seeded" ? "active" : ""}
              onClick={() => setModePersist("seeded")}
            >
              Seeded
            </button>
          </div>
          <button
            type="button"
            className="hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`menuOverlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <aside className={`sideMenu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="sideMenuHead">
          <strong>Menu</strong>
          <button type="button" className="sideClose" onClick={() => setMenuOpen(false)} aria-label="Close">
            ×
          </button>
        </div>
        <nav className="sideNav">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/start" onClick={() => setMenuOpen(false)}>Buyer quick start</Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <a href="/api/visibility/summary" onClick={() => setMenuOpen(false)}>API summary</a>
          <a href="/api/health" onClick={() => setMenuOpen(false)}>Health</a>
        </nav>
        <p className="sideNote">
          {mode === "seeded" ? "Seeded tenant snapshot" : "Sample data"} · no DB required
        </p>
      </aside>

      <main className="dashMain">
        <section className="plane plane-raised scoreHero">
          <div className="scoreHeroLeft">
            <p className="chip">
              <LabelWithInfo infoKey="visibility">Visibility score</LabelWithInfo>
            </p>
            <h1 className={`bigScore tone-${scoreTone(summary.overallScore)}`}>{summary.overallScore}</h1>
            <p className="scoreSub">
              Weighted from coverage, trust, and sentiment. Mode: <strong>{summary.source}</strong>.
              Trend: <strong>{summary.trend}</strong>
            </p>
          </div>
          <div className="pillarRow">
            {([
              ["Coverage", summary.pillars.coverage, "coverage"] as const,
              ["Trust", summary.pillars.trust, "trust"] as const,
              ["Sentiment", summary.pillars.sentiment, "sentiment"] as const,
            ]).map(([label, value, key]) => (
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
            {summary.surfaces.map((s) => (
              <article key={s.key} id={`surface-${s.key}`} className="surfaceCard">
                <header>
                  <h3>
                    <LabelWithInfo infoKey={s.key}>{s.label}</LabelWithInfo>
                  </h3>
                  <span className={`surfaceScore tone-${scoreTone(s.score)}`}>{s.score}</span>
                </header>
                <ul className="metricList">
                  <li>
                    <span><LabelWithInfo infoKey="coverage">Coverage</LabelWithInfo></span>
                    <strong>{s.coverage}</strong>
                  </li>
                  <li>
                    <span><LabelWithInfo infoKey="trust">Trust</LabelWithInfo></span>
                    <strong>{s.trust}</strong>
                  </li>
                  <li>
                    <span><LabelWithInfo infoKey="sentiment">Sentiment</LabelWithInfo></span>
                    <strong>{s.sentiment}</strong>
                  </li>
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="improveSection plane" aria-labelledby="improve-heading">
          <div className="improveHead">
            <h2 id="improve-heading">Recommended improvements</h2>
            <p className="improveLede">
              Ranked from the scores above. Mark items done to track progress ({completedCount}/
              {summary.improvements.length} complete).
            </p>
          </div>
          <ul className="improveList">
            {summary.improvements.map((item) => {
              const isDone = Boolean(done[item.id]);
              return (
                <li
                  key={item.id}
                  className={`improveCard priority-${item.priority} ${isDone ? "isDone" : ""}`}
                >
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
            <h2 id="evidence-heading">Evidence</h2>
            <p className="improveLede">
              {liveAgg
                ? `Live aggregate ${liveAgg.overall} from ${liveAgg.count} run(s)${liveAgg.persisted ? " (persisted)" : " (session memory)"}.`
                : "No measurements yet. Complete the onboarding wizard or POST /api/visibility/measure."}
            </p>
          </div>
          {evidence.length > 0 ? (
            <ul className="improveList">
              {evidence.map((run) => (
                <li key={run.id} className="improveCard">
                  <div className="improveTop">
                    <span className="impactTag">{run.brandName}</span>
                    <span className={`surfaceScore tone-${scoreTone(run.scores.overall)}`}>
                      {run.scores.overall}
                    </span>
                  </div>
                  <h3>{run.prompt}</h3>
                  <p className="improveWhy">
                    {run.response.measuredAt?.slice(0, 19).replace("T", " ")}
                    {run.response.citations?.length
                      ? ` · ${run.response.citations.length} citation(s)`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="improveWhy">
              <a href="/onboarding">Start the setup wizard</a> to generate evidence-backed scores.
            </p>
          )}
        </section>

        <section className="howSection">
          <h2>How scoring works</h2>
          <p>
            Each surface scores <code>coverage × 40% + trust × 40% + sentiment × 20%</code>.
            Seeded mode swaps in a higher-fidelity in-repo tenant snapshot without DATABASE_URL.
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
