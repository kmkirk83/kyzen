import Link from "next/link";

export default function StartPage() {
  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">Buyer quick start</span>
        </div>
        <nav className="topLinks">
          <Link href="/">Home</Link>
          <Link href="/dashboard" className="topCta">Dashboard</Link>
        </nav>
      </header>

      <main className="dashMain marketing" id="evaluation">
        <section className="plane plane-raised heroPlane">
          <span className="eyebrow">For evaluators</span>
          <h1 className="marketingTitle">What you are looking at</h1>
          <p className="lede">
            Explore the product surface without a database or API keys. Toggle Sample vs Seeded
            on the dashboard, then tick recommendations to see checklist state.
          </p>
          <div className="heroActions">
            <Link href="/dashboard" className="btnPrimary">Open dashboard</Link>
            <a href="/api/visibility/summary" className="btnGhost">API summary</a>
          </div>
        </section>

        <section className="plane improveSection">
          <h2>1. Local run</h2>
          <pre className="codeBlock">{`cp .env.example .env
npm ci
npm run dev`}</pre>
          <p className="improveWhy">Then open <code>/dashboard</code>.</p>
        </section>

        <section className="plane improveSection">
          <h2>2. What you are seeing</h2>
          <ul className="checklist">
            <li>Dashboard uses <strong>sample</strong> or <strong>seeded</strong> catalogs (toggle in header).</li>
            <li>No live database required for either mode.</li>
            <li>Prisma multi-tenant model is defined; optional <code>prisma/seed.ts</code> when DATABASE_URL is set.</li>
            <li>Recommendations can be marked done — state persists in the browser.</li>
          </ul>
        </section>

        <section className="plane improveSection">
          <h2>3. Evaluation path</h2>
          <ol className="checklist ordered">
            <li>Open <Link href="/dashboard">/dashboard</Link> and switch Sample ↔ Seeded.</li>
            <li>Use info dots on each category.</li>
            <li>Mark a recommendation done; refresh to confirm persistence.</li>
            <li>Hit <code>GET /api/visibility/summary</code> and <code>GET /api/health</code>.</li>
            <li>Review <code>prisma/schema.prisma</code> and <code>SALES.md</code>.</li>
          </ol>
        </section>

        <section className="plane improveSection">
          <h2>4. What a buyer gets</h2>
          <ul className="checklist">
            <li>Full Next.js 16 + TypeScript application</li>
            <li>Prisma multi-tenant foundation + optional seed</li>
            <li>Dashboard, score engine, recommendations checklist</li>
            <li>Docker, CI, release automation, commercialization docs</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
