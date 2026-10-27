import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Onboarding | kyzen",
  description:
    "Guided post-purchase setup for your multi-tenant AI visibility workspace. Full GUI — no CLI required.",
};

export default function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="dashRoot">
      <header className="dashTop">
        <div className="dashBrand">
          <span className="dashLogo">kyzen</span>
          <span className="dashMeta">Post-purchase setup</span>
        </div>
        <nav className="topLinks">
          <Link href="/start">Evaluation</Link>
          <Link href="/dashboard" className="topCta">
            Dashboard
          </Link>
        </nav>
      </header>
      <main className="dashMain marketing">{children}</main>
    </div>
  );
}
