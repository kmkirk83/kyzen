import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kyzen | AI Visibility Intelligence",
  description:
    "Commercial SaaS foundation for measuring, monitoring, and improving brand visibility across generative platforms.",
  metadataBase: new URL("https://kyzen-demo-kmkirk83s-projects.vercel.app"),
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
