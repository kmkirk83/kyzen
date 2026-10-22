import Link from "next/link";

export default function StartPage() {
  return (
    <main className="shell" style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      <p className="navRow">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Start here</span>
      </p>

      <h1>kyzen — Buyer Quick Start</h1>
      <p className="lede">
        This page is for people evaluating the codebase. It explains what you are looking at
        and how to explore it quickly.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>1. What you just ran</h2>
        <pre style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "6px", overflow: "auto" }}>
{`cp .env.example .env
npm ci
npm run dev`}
        </pre>
        <p>Then open <code>http://localhost:3000/dashboard</code>.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>2. What you are seeing</h2>
        <ul>
          <li>The dashboard is powered by <strong>sample visibility data</strong>.</li>
          <li>No live database or AI provider keys are required for this view.</li>
          <li>The multi-tenant data model (organizations, memberships, reports, billing, API keys, audits) is already defined in Prisma.</li>
          <li>Live tenant queries are the main remaining integration step.</li>
        </ul>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>3. Suggested evaluation path</h2>
        <ol>
          <li>Explore <Link href="/dashboard">/dashboard</Link> — this is the core product surface.</li>
          <li>Hit <code>GET /api/visibility/summary</code> and <code>GET /api/health</code>.</li>
          <li>Review <code>prisma/schema.prisma</code> for the multi-tenant model.</li>
          <li>Read the commercialization docs and runbooks under <code>docs/</code>.</li>
        </ol>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>4. What a buyer gets</h2>
        <ul>
          <li>Full Next.js 16 + TypeScript application</li>
          <li>Prisma multi-tenant foundation</li>
          <li>Dashboard + API contract</li>
          <li>Docker, CI, release automation, and commercialization documentation</li>
        </ul>
      </section>

      <p style={{ marginTop: "2.5rem" }}>
        <Link href="/dashboard">← Back to dashboard</Link>
      </p>
    </main>
  );
}
