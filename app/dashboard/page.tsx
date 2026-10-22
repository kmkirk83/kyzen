"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buildVisibilitySummary } from "@/lib/visibility-summary";

function scoreTone(n: number) {
  if (n >= 70) return "good";
  if (n >= 45) return "mid";
  return "low";
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
            <p className="chip">Visibility score</p>
            <h1 className={`bigScore tone-${scoreTone(summary.overallScore)}`}>{summary.overallScore}</h1>
            <p className="scoreSub">
              Weighted from coverage, trust, and sentiment across AI surfaces.
              Trend: <strong>{summary.trend}</strong>
            </p>
          </div>
          <div className="pillarRow">
            {([
              ["Coverage", summary.pillars.coverage],
              ["Trust", summary.pillars.trust],
              ["Sentiment", summary.pillars.sentiment],
            ] as const).map(([label, value]) => (
              <div key={label} className="pillarCard">
                <span className="pillarLabel">{label}</span>
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
                  <h3>{s.label}</h3>
                  <span className={`surfaceScore tone-${scoreTone(s.score)}`}>{s.score}</span>
                </header>
                <ul className="metricList">
                  <li><span>Coverage</span><strong>{s.coverage}</strong></li>
                  <li><span>Trust</span><strong>{s.trust}</strong></li>
                  <li><span>Sentiment</span><strong>{s.sentiment}</strong></li>
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
