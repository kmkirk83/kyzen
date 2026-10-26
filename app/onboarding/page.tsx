"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const STEPS = [
  "Account",
  "Brand",
  "Prompts",
  "Run",
  "Results",
] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("My workspace");
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [promptsText, setPromptsText] = useState(
    "What is {brand} known for?\nBest alternatives to {brand}?\nIs {brand} recommended for analytics?",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<
    Array<{ id: string; prompt: string; scores: { overall: number; coverage: number; trust: number; sentiment: number } }>
  >([]);
  const [sessionNote, setSessionNote] = useState<string | null>(null);

  const prompts = useMemo(
    () =>
      promptsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replaceAll("{brand}", brandName || "the brand"))
        .slice(0, 10),
    [promptsText, brandName],
  );

  async function login() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, organizationName: orgName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setSessionNote(
        data.persisted
          ? "Session saved with database-backed workspace."
          : data.note || "Ephemeral session (memory store).",
      );
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function runBatch() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/visibility/measure/batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brandName, prompts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Measurement failed");
      setRuns(data.runs || []);
      await fetch("/api/onboarding/complete", { method: "POST" });
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">Onboarding wizard</span>
        </div>
        <nav className="topLinks">
          <Link href="/">Home</Link>
          <Link href="/dashboard" className="topCta">Dashboard</Link>
        </nav>
      </header>

      <main className="dashMain marketing">
        <section className="plane plane-raised heroPlane">
          <span className="eyebrow">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </span>
          <h1 className="marketingTitle">Pipe in your data. See real scores.</h1>
          <p className="lede">
            Create a workspace, add your brand and evaluation prompts, run measurements, and open the
            dashboard with evidence-backed results.
          </p>
          <div className="wizardProgress" aria-hidden="true">
            {STEPS.map((label, i) => (
              <span key={label} className={i <= step ? "on" : ""}>
                {i + 1}
              </span>
            ))}
          </div>
        </section>

        {error && (
          <p className="wizardError" role="alert">
            {error}
          </p>
        )}

        {step === 0 && (
          <section className="plane improveSection">
            <h2>1. Account & workspace</h2>
            <label className="field">
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </label>
            <label className="field">
              Workspace name
              <input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </label>
            <button type="button" className="btnPrimary" disabled={busy || !email} onClick={login}>
              {busy ? "Working…" : "Continue"}
            </button>
            {sessionNote && <p className="improveWhy">{sessionNote}</p>}
          </section>
        )}

        {step === 1 && (
          <section className="plane improveSection">
            <h2>2. Brand</h2>
            <label className="field">
              Brand name
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Acme" />
            </label>
            <label className="field">
              Website
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </label>
            <div className="heroActions">
              <button type="button" className="btnGhost" onClick={() => setStep(0)}>
                Back
              </button>
              <button
                type="button"
                className="btnPrimary"
                disabled={!brandName.trim()}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="plane improveSection">
            <h2>3. Evaluation prompts</h2>
            <p className="improveWhy">One prompt per line. Use {"{brand}"} as a placeholder.</p>
            <textarea
              className="wizardTextarea"
              rows={6}
              value={promptsText}
              onChange={(e) => setPromptsText(e.target.value)}
            />
            <p className="improveWhy">{prompts.length} prompt(s) ready.</p>
            <div className="heroActions">
              <button type="button" className="btnGhost" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="btnPrimary"
                disabled={prompts.length === 0}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="plane improveSection">
            <h2>4. Run first evaluation</h2>
            <p className="improveWhy">
              Provider: <strong>mock</strong> (no API keys required). Results are stored in memory or
              Prisma when DATABASE_URL is configured.
            </p>
            <ul className="checklist">
              {prompts.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="heroActions">
              <button type="button" className="btnGhost" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="btnPrimary" disabled={busy} onClick={runBatch}>
                {busy ? "Measuring…" : "Run evaluation"}
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="plane improveSection">
            <h2>5. Results</h2>
            <p className="improveWhy">
              {runs.length} measurement(s) complete. Open the dashboard for scores and evidence.
            </p>
            <ul className="improveList">
              {runs.map((r) => (
                <li key={r.id} className="improveCard">
                  <h3>Score {r.scores.overall}</h3>
                  <p className="improveWhy">{r.prompt}</p>
                  <p className="improveWhy">
                    coverage {r.scores.coverage} · trust {r.scores.trust} · sentiment {" "}
                    {r.scores.sentiment}
                  </p>
                </li>
              ))}
            </ul>
            <div className="heroActions">
              <Link href="/dashboard" className="btnPrimary">
                Open dashboard
              </Link>
              <Link href="/start" className="btnGhost">
                Buyer docs
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
