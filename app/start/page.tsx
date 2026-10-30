import Link from "next/link";

export default function StartPage() {
  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">Product tour</span>
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
          <span className="eyebrow">Live demo · no login required</span>
          <h1 className="marketingTitle">60-second product tour</h1>
          <p className="lede">
            See how kyzen scores brand visibility across AI answer surfaces and surfaces the
            next actions worth taking. This demo already includes persisted Evidence runs.
          </p>
          <div className="heroActions">
            <Link href="/dashboard" className="btnPrimary">
              Open dashboard
            </Link>
            <Link href="/onboarding" className="btnGhost">
              Run a batch measure
            </Link>
            <a href="/api/visibility/measure" className="btnGhost">
              Measure API
            </a>
          </div>
        </section>

        <section className="plane improveSection">
          <h2>Suggested path</h2>
          <ol className="checklist ordered">
            <li>
              Open <Link href="/dashboard">/dashboard</Link> — headline score, surface cards, and the{" "}
              <strong>Evidence</strong> panel with live runs.
            </li>
            <li>
              Toggle <strong>Sample ↔ Seeded</strong> in the header to compare fixture catalogs.
            </li>
            <li>Mark one recommendation done — progress is stored in this browser.</li>
            <li>
              Optional: open <Link href="/onboarding">/onboarding</Link>, enter a brand and prompts,
              run a batch measure, then return to Evidence.
            </li>
          </ol>
        </section>

        <section className="plane improveSection">
          <h2>Included in this demo</h2>
          <ul className="checklist">
            <li>Multi-tenant measure API with Neon persistence</li>
            <li>Batch measure used by the onboarding wizard</li>
            <li>Dashboard Evidence panel bound to the same org runs</li>
            <li>Honest mock provider when LLM keys are not configured</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
