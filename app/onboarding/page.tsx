"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type ReadinessCheck = {
  name: string;
  configured: boolean;
  description: string;
};

type ReadinessPayload = {
  service?: string;
  version?: string;
  readiness?: {
    validEnvironmentShape: boolean;
    configuredChecks: number;
    totalChecks: number;
    checks: ReadinessCheck[];
  };
};

type OrgForm = {
  name: string;
  slug: string;
  ownerEmail: string;
};

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "environment", label: "Environment" },
  { id: "organization", label: "Organization" },
  { id: "complete", label: "Ready" },
] as const;

const STORAGE_KEY = "kyzen-onboarding-draft";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function checkTone(configured: boolean) {
  return configured ? "tone-good" : "tone-mid";
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [readiness, setReadiness] = useState<ReadinessPayload | null>(null);
  const [readinessError, setReadinessError] = useState<string | null>(null);
  const [loadingReadiness, setLoadingReadiness] = useState(false);
  const [org, setOrg] = useState<OrgForm>({ name: "", slug: "", ownerEmail: "" });
  const [orgMessage, setOrgMessage] = useState<string | null>(null);
  const [orgPersisted, setOrgPersisted] = useState(false);
  const [submittingOrg, setSubmittingOrg] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        step?: number;
        org?: OrgForm;
        orgPersisted?: boolean;
      };
      if (parsed.org) setOrg(parsed.org);
      if (typeof parsed.step === "number") setStep(Math.min(parsed.step, STEPS.length - 1));
      if (parsed.orgPersisted) setOrgPersisted(true);
    } catch {
      // ignore corrupt draft
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, org, orgPersisted }),
      );
    } catch {
      // storage may be unavailable
    }
  }, [step, org, orgPersisted]);

  const loadReadiness = useCallback(async () => {
    setLoadingReadiness(true);
    setReadinessError(null);
    try {
      const res = await fetch("/api/readiness", { cache: "no-store" });
      if (!res.ok) throw new Error(`Readiness returned ${res.status}`);
      const data = (await res.json()) as ReadinessPayload;
      setReadiness(data);
    } catch (err) {
      setReadinessError(err instanceof Error ? err.message : "Unable to load readiness");
    } finally {
      setLoadingReadiness(false);
    }
  }, []);

  useEffect(() => {
    if (step === 1) void loadReadiness();
  }, [step, loadReadiness]);

  const checks = readiness?.readiness?.checks ?? [];
  const configuredCount = readiness?.readiness?.configuredChecks ?? 0;
  const totalChecks = readiness?.readiness?.totalChecks ?? 0;

  const orgValid = useMemo(() => {
    return (
      org.name.trim().length >= 2 &&
      org.slug.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(org.ownerEmail.trim())
    );
  }, [org]);

  async function submitOrganization() {
    if (!orgValid) return;
    setSubmittingOrg(true);
    setOrgMessage(null);
    try {
      const res = await fetch("/api/onboarding/create-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: org.name.trim(),
          slug: org.slug.trim(),
          ownerEmail: org.ownerEmail.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        mode?: "persisted" | "draft";
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setOrgPersisted(data.mode === "persisted");
      setOrgMessage(
        data.message ||
          (data.mode === "persisted"
            ? "Organization created in the database."
            : "Draft saved. Connect DATABASE_URL to persist tenants."),
      );
      setStep(3);
    } catch (err) {
      setOrgMessage(err instanceof Error ? err.message : "Unable to create organization");
    } finally {
      setSubmittingOrg(false);
    }
  }

  return (
    <>
      <section className="plane plane-raised heroPlane">
        <span className="eyebrow">Customer onboarding</span>
        <h1 className="marketingTitle">Set up your workspace</h1>
        <p className="lede">
          Guided GUI setup for your multi-tenant AI visibility instance. No terminal commands
          required. Progress is saved in this browser so you can pause and resume.
        </p>

        <ol className="onboardProgress" aria-label="Onboarding progress">
          {STEPS.map((s, index) => (
            <li
              key={s.id}
              className={
                index === step ? "active" : index < step ? "done" : undefined
              }
            >
              <span className="onboardStepIndex">{index + 1}</span>
              <span>{s.label}</span>
            </li>
          ))}
        </ol>
      </section>

      {step === 0 && (
        <section className="plane improveSection">
          <h2>Welcome</h2>
          <p className="improveWhy">
            After repository transfer, this wizard walks you through environment readiness and
            the first organization. You can continue in sample mode without a database, then
            connect Postgres when you are ready for live tenants.
          </p>
          <ul className="checklist">
            <li>Environment checks use the existing readiness API.</li>
            <li>Organization details can be drafted without CLI.</li>
            <li>You can open the dashboard at any time with sample data.</li>
          </ul>
          <div className="heroActions">
            <button type="button" className="btnPrimary" onClick={() => setStep(1)}>
              Start environment check
            </button>
            <Link href="/dashboard" className="btnGhost">
              Open dashboard
            </Link>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="plane improveSection">
          <h2>1. Environment check</h2>
          <p className="improveWhy">
            Live status from <code>GET /api/readiness</code>. Missing items are optional for
            sample-data evaluation; they become required for production tenants.
          </p>

          <div className="heroActions" style={{ marginBottom: "1rem" }}>
            <button
              type="button"
              className="btnGhost"
              onClick={() => void loadReadiness()}
              disabled={loadingReadiness}
            >
              {loadingReadiness ? "Checking\u2026" : "Re-run check"}
            </button>
          </div>

          {readinessError && (
            <p className="tone-low" role="alert">
              {readinessError}
            </p>
          )}

          {!readinessError && (
            <p className="improveWhy">
              Configured checks:{" "}
              <strong>
                {configuredCount}/{totalChecks || "\u2014"}
              </strong>
              {readiness?.readiness?.validEnvironmentShape === false && (
                <> \u00b7 Environment shape has validation issues.</>
              )}
            </p>
          )}

          <ul className="surfaceGrid" style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {checks.map((check) => (
              <li key={check.name} className="surfaceCard">
                <header>
                  <h3>{check.name}</h3>
                  <span className={`surfaceScore ${checkTone(check.configured)}`}>
                    {check.configured ? "Ready" : "Optional"}
                  </span>
                </header>
                <p className="improveWhy" style={{ margin: 0 }}>
                  {check.description}
                </p>
              </li>
            ))}
          </ul>

          <div className="heroActions">
            <button type="button" className="btnGhost" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="button" className="btnPrimary" onClick={() => setStep(2)}>
              Continue to organization
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="plane improveSection">
          <h2>2. Create organization</h2>
          <p className="improveWhy">
            Define the first tenant. If <code>DATABASE_URL</code> is configured, the API will
            persist Organization + OWNER membership. Otherwise a browser draft is stored and you
            can continue with sample data.
          </p>

          <div className="onboardForm">
            <label>
              Organization name
              <input
                type="text"
                value={org.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setOrg((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug && prev.slug !== slugify(prev.name) ? prev.slug : slugify(name),
                  }));
                }}
                placeholder="Acme Visibility"
                autoComplete="organization"
              />
            </label>
            <label>
              URL slug
              <input
                type="text"
                value={org.slug}
                onChange={(e) => setOrg((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                placeholder="acme-visibility"
              />
            </label>
            <label>
              Owner email
              <input
                type="email"
                value={org.ownerEmail}
                onChange={(e) => setOrg((prev) => ({ ...prev, ownerEmail: e.target.value }))}
                placeholder="owner@example.com"
                autoComplete="email"
              />
            </label>
          </div>

          {orgMessage && (
            <p className={orgPersisted ? "tone-good" : "tone-mid"} role="status">
              {orgMessage}
            </p>
          )}

          <div className="heroActions">
            <button type="button" className="btnGhost" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="btnPrimary"
              disabled={!orgValid || submittingOrg}
              onClick={() => void submitOrganization()}
            >
              {submittingOrg ? "Saving\u2026" : "Save organization"}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="plane improveSection">
          <h2>Setup ready</h2>
          <p className="improveWhy">
            {orgPersisted
              ? "Your organization is stored. Open the dashboard to continue brand setup and visibility scoring."
              : "Draft organization is saved in this browser. Connect PostgreSQL and re-run this step when you are ready for live multi-tenant data."}
          </p>
          <ul className="checklist">
            <li>
              Organization: <strong>{org.name || "\u2014"}</strong> ({org.slug || "\u2014"})
            </li>
            <li>
              Owner: <strong>{org.ownerEmail || "\u2014"}</strong>
            </li>
            <li>
              Mode: <strong>{orgPersisted ? "Persisted" : "Draft / sample"}</strong>
            </li>
          </ul>
          <div className="heroActions">
            <Link href="/dashboard" className="btnPrimary">
              Open dashboard
            </Link>
            <button type="button" className="btnGhost" onClick={() => setStep(2)}>
              Edit organization
            </button>
            <Link href="/start" className="btnGhost">
              Evaluation guide
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
