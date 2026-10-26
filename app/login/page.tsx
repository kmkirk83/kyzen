"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("My workspace");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">Sign in</span>
        </div>
        <nav className="topLinks">
          <Link href="/">Home</Link>
        </nav>
      </header>
      <main className="dashMain marketing">
        <section className="plane plane-raised heroPlane">
          <h1 className="marketingTitle">Sign in to your workspace</h1>
          <p className="lede">
            Demo auth issues a signed session cookie. With DATABASE_URL, user and org are upserted in
            Prisma.
          </p>
          <form onSubmit={onSubmit} className="loginForm">
            <label className="field">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </label>
            <label className="field">
              Workspace
              <input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </label>
            {error && (
              <p className="wizardError" role="alert">
                {error}
              </p>
            )}
            <button className="btnPrimary" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Continue"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
