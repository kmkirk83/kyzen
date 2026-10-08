import Link from "next/link";

import { buildVisibilitySummary } from "@/lib/visibility-summary";

export default function DashboardPage() {
  const summary = buildVisibilitySummary("2026-10-08T00:00:00.000Z");

  return (
    <main className="shell">
      <p className="navRow">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Visibility dashboard</span>
      </p>
      <section className="hero">
        <div>
          <span className="eyebrow">Sample data</span>
          <h1>Visibility dashboard</h1>
          <p className="lede">
            {summary.organization} · {summary.brand}. Overall score {summary.overallScore}. This
            screen reads the same contract as GET /api/visibility/summary.
          </p>
        </div>
        <div className="heroCard">
          <h2>Overall score</h2>
          <p className="score">{summary.overallScore}</p>
          <p className="lede">Source: {summary.source}. Flag: {summary.featureFlag}.</p>
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
