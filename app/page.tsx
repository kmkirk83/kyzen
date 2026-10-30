import Link from "next/link";
import { platformPillars, productHighlights } from "@/lib/site-content";

export default function Home() {
  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">AI visibility intelligence</span>
        </div>
        <nav className="topLinks">
          <Link href="/start">Quick start</Link>
          <Link href="/dashboard" className="topCta">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="dashMain marketing">
        <section className="plane plane-raised heroPlane">
          <span className="eyebrow">AI visibility platform</span>
          <h1 className="marketingTitle">Know how AI answers talk about your brand.</h1>
          <p className="lede">
            kyzen measures brand presence across answer engines, assistants, and search overviews —
            then ranks the improvements that move coverage, trust, and sentiment.
          </p>
          <div className="heroActions">
            <Link href="/dashboard" className="btnPrimary">
              Open dashboard
            </Link>
            <Link href="/onboarding" className="btnGhost">
              Set up workspace
            </Link>
            <Link href="/start" className="btnGhost">
              60-second tour
            </Link>
          </div>
        </section>

        <section className="gridSection">
          {platformPillars.map((pillar) => (
            <article key={pillar.title} className="surfaceCard">
              <h2>{pillar.title}</h2>
              <p className="improveWhy">{pillar.description}</p>
            </article>
          ))}
        </section>

        <section className="plane improveSection">
          <h2>What you can do today</h2>
          <ul className="checklist">
            {productHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="heroActions" style={{ marginTop: "1.25rem" }}>
            <Link href="/dashboard" className="btnPrimary">
              View live Evidence
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
