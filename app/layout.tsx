import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarion | AI Visibility Intelligence",
  description:
    "Commercial SaaS foundation for measuring, monitoring, and improving brand visibility across generative platforms.",
  metadataBase: new URL("https://clarion.local"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
