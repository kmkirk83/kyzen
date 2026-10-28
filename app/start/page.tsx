import Link from "next/link";

export default function StartPage() {
  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">Buyer super demo</span>
        </div>
        <nav className="topLinks">
          <Link href="/">Home</Link>
          <Link href="/onboarding">Onboarding</Link>
          <Link href="/dashboard" className="topCta">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="dashMain marketing" id="evaluation">
        <section className="plane plane-raised heroPlane">
          <span className="eyebrow">Live product demo · no login required</span>
          <h1 className="marketingTitle">60-second buyer path</h1>
          <p className="lede">
            kyzen measures how visible a brand is across AI answer surfaces. This public demo
            already has persisted Evidence runs. Walk the path below, then open the dashboard.
          </p>
          <div className="heroActions">
            <Link href="/dashboard" className="btnPrimary">
              Open live Evidence
            </Link>
            <Link href="/onboarding" className="btnGhost">
              Run onboarding + batch measure
            </Link>
            <a href="/api/visibility/measure" className="btnGhost">
              GET measure API
            </a>
          </div>
        </section>

        <section className="plane improveSection">
          <h2>Click path (exact)</h2>
          <ol className="checklist ordered">
            <li>
              Open <Link href="/dashboard">/dashboard</Link> — sample scores, surface cards, and the
              <strong> Evidence</strong> panel (live runs from Neon).
            </li>
            <li>
              Toggle <strong>Sample ↔ Seeded</strong> in the header to see fixture vs higher-fidelity snapshot.
            </li>
            <li>
              Mark one recommendation done — checklist state persists in the browser.
            </li>
            <li>
              Optional: open <Link href="/onboarding">/onboarding</Link>, create an org, enter a brand +
              prompts, click <strong>Run batch measure</strong>, then return to Evidence.
            </li>
            <li>
              Hit <code>GET /api/health</code> and <code>GET /api/visibility/summary</code> for the public contract.
            </li>
          </ol>
        </section>

        <section className="plane improveSection">
          <h2>What is already live on this demo</h2>
          <ul className="checklist">
            <li>Multi-tenant measure API with Neon persistence (<code>persisted: true</code>)</li>
            <li>Batch measure endpoint used by the onboarding wizard</li>
            <li>Dashboard Evidence panel reading the same org runs</li>
            <li>Honest mock provider when no LLM keys are set</li>
            <li>Prisma schema, auth, API keys, Telegram fail-closed path in source</li>
          </ul>
        </section>

        <section className="plane improveSection">
          <h2>What a buyer gets after transfer</h2>
          <ul className="checklist">
            <li>Full Next.js 16 + TypeScript application</li>
            <li>Prisma multi-tenant foundation + optional seed</li>
            <li>Dashboard, score engine, recommendations checklist, Evidence</li>
            <li>Docker, CI, release automation, commercialization docs</li>
            <li>1-day handoff path documented in SALES.md / BUYER_RUNBOOK.md</li>
          </ul>
        </section>

        <section className="plane improveSection">
          <h2>Local run (optional)</h2>
          <pre className="codeBlock">{["cp .env.example .env", "npm ci", "npm run dev"].join("
")}</pre>
          <p className="improveWhy">
            Then open <code>/dashboard</code>. Attach <code>DATABASE_URL</code> for live tenants.
          </p>
        </section>
      </main>
    </div>
  );
}
