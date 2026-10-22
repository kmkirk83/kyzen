"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { buildVisibilitySummary } from "@/lib/visibility-summary";

const CATEGORY_INFO = {
  visibility: {
    title: "Visibility score",
    body: "A single 0–100 headline for how present and well-regarded your brand is across AI answer surfaces. It is the same weighted model used on each surface: coverage 40%, trust 40%, sentiment 20%.",
  },
  coverage: {
    title: "Coverage",
    body: "How often your brand appears in AI-generated answers for relevant queries. Higher coverage means you show up more frequently when people ask AI tools about your category.",
  },
  trust: {
    title: "Trust",
    body: "How strongly and cleanly you are cited when you do appear. Higher trust means answers reference you with clearer, higher-quality attribution rather than vague or weak mentions.",
  },
  sentiment: {
    title: "Sentiment",
    body: "The tone of mentions about your brand in AI answers. Higher sentiment means more favorable framing; lower scores reflect neutral or mixed portrayal.",
  },
  answer_engines: {
    title: "Answer engines",
    body: "AI systems that return direct answers (for example overview-style answer boxes). Scores here reflect presence, citation quality, and tone in those answer formats.",
  },
  assistants: {
    title: "Assistants",
    body: "Conversational AI assistants where users ask follow-up questions. Scores reflect how you appear in multi-turn, chat-style responses.",
  },
  search_overviews: {
    title: "Search overviews",
    body: "AI-generated overviews embedded in search results. Scores reflect visibility when users discover answers inside search, not only in standalone chat tools.",
  },
} as const;

type InfoKey = keyof typeof CATEGORY_INFO;

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
  className = "",
}: {
  children: React.ReactNode;
  infoKey: InfoKey;
  className?: string;
}) {
  return (
    <span className={`labelWithInfo ${className}`.trim()}>
      <span>{children}</span>
      <InfoTip infoKey={infoKey} />
    </span>
  );
}

export default function DashboardPage() {
  const summary = buildVisibilitySummary("2026-10-22T00:00:00.000Z");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">
            {summary.organization} · {summary.brand}
          </span>
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
        <p className="sideNote">Demo mode · sample data</p>
      </aside>

      <main className="dashMain">
        <section className="scoreHero">
          <div>
            <p className="chip">
              <LabelWithInfo infoKey="visibility">Visibility score</LabelWithInfo>
            </p>
            <h1 className={`bigScore tone-${scoreTone(summary.overallScore)}`}>{summary.overallScore}</h1>
            <p className="scoreSub">
              Weighted from coverage, trust, and sentiment across AI surfaces.
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
              <article key={s.key} className="surfaceCard">
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

        <section className="howSection">
          <h2>How scoring works</h2>
          <p>
            Each surface scores <code>coverage × 40% + trust × 40% + sentiment × 20%</code>.
            The headline score is the same model on the averaged pillars.
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
