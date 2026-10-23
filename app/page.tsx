import Link from "next/link";
import {
  commercializationChecklist,
  launchTracks,
  platformPillars,
} from "@/lib/site-content";

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
          <Link href="/dashboard" className="topCta">Dashboard</Link>
        </nav>
      </header>

      <main className="dashMain marketing">
        <section className="plane plane-raised heroPlane">
          <span className="eyebrow">Commercial SaaS foundation</span>
          <h1 className="marketingTitle">Make AI visibility measurable and sellable.</h1>
          <p className="lede">
            Multi-tenant Next.js + Prisma foundation for monitoring brand presence across AI
            answers and search — with a live demo, score model, and recommendation checklist.
          </p>
          <div className="heroActions">
            <Link href="/dashboard" className="btnPrimary">Open dashboard</Link>
            <Link href="/start" className="btnGhost">Buyer quick start</Link>
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
          <h2>Launch tracks</h2>
          <ul className="checklist">
            {launchTracks.map((track) => (
              <li key={track}>{track}</li>
            ))}
          </ul>
        </section>

        <section className="plane improveSection">
          <span className="eyebrow">In-repo readiness</span>
          <h2>Commercialization checklist</h2>
          <ul className="checklist">
            {commercializationChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
