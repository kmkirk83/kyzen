import Link from "next/link";

import { buildVisibilitySummary } from "@/lib/visibility-summary";
import { isDemoMode, demoNotes } from "@/lib/demo";

export default function DashboardPage() {
  const summary = buildVisibilitySummary("2026-10-08T00:00:00.000Z");
  const demo = isDemoMode();

  return (
    <main className="shell">
      <p className="navRow">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/start">Start here</Link>
        <span aria-hidden="true">/</span>
        <span>Visibility dashboard</span>
      </p>

      {demo && (
        <section
          className="demoBanner"
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            background: "#f8fafc",
          }}
        >
          <span className="eyebrow">Demo mode</span>
          <h2 style={{ margin: "0.25rem 0 0.5rem" }}>You are viewing sample data</h2>
          <p className="lede" style={{ marginBottom: "0.75rem" }}>
            This dashboard reads the same contract as <code>GET /api/visibility/summary</code>.
            No live database or API keys are required to explore the interface.
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {demoNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p style={{ marginTop: "0.75rem", marginBottom: 0 }}>
            <Link href="/start">Read the buyer quick-start →</Link>
          </p>
        </section>
      )}

      <section className="hero">
        <div>
          <span className="eyebrow">Sample data</span>
          <h1>Visibility dashboard</h1>
          <p className="lede">
            {summary.organization} · {summary.brand}. Overall score {summary.overallScore}.
          </p>
        </div>
        <div className="heroCard">
          <h2>Overall score</h2>
          <p className="score">{summary.overallScore}</p>
          <p className="lede">
            Source: {summary.source}. Flag: {summary.featureFlag}.
          </p>
        </div>
      </section>

      <section className="gridSection">
        {summary.surfaces.map((surface) => (
          <article key={surface.surface} className="card">
            <h2>{surface.surface}</h2>
            <p>Share of answer: {surface.shareOfAnswer}%</p>
            <p>Citation quality: {surface.citationQuality}</p>
            <p>Sentiment: {surface.sentiment}</p>
          </article>
        ))}
      </section>

      <section className="checklistSection">
        <div className="sectionHeading">
          <span className="eyebrow">Scope boundary</span>
          <h2>What this release includes</h2>
        </div>
        <ul className="checklist">
          {summary.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
