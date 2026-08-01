import {
  commercializationChecklist,
  launchTracks,
  platformPillars,
} from "@/lib/site-content";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <div>
          <span className="eyebrow">Commercial SaaS foundation</span>
          <h1>Clarion makes AI visibility measurable, sellable, and operational.</h1>
          <p className="lede">
            The repository now includes a production-oriented Next.js baseline, tenant-ready
            data modeling, release workflows, and launch documentation for a hosted AI
            visibility platform.
          </p>
        </div>
        <div className="heroCard">
          <h2>Launch tracks</h2>
          <ul>
            {launchTracks.map((track) => (
              <li key={track}>{track}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="gridSection">
        {platformPillars.map((pillar) => (
          <article key={pillar.title} className="card">
            <h2>{pillar.title}</h2>
            <p>{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="checklistSection">
        <div className="sectionHeading">
          <span className="eyebrow">Readiness delivered in-repo</span>
          <h2>Commercialization checklist</h2>
        </div>
        <ul className="checklist">
          {commercializationChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
