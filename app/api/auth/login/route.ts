import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

import { sessionCookieHeader, type SessionUser } from "@/lib/session";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) || "workspace";
}

export async function POST(request: NextRequest) {
  let body: { email?: string; name?: string; organizationName?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const orgName = body.organizationName?.trim() || "My workspace";
  const organizationId = `org_${slugify(orgName)}_${createHash("sha256").update(email).digest("hex").slice(0, 8)}`;
  const userId = `user_${createHash("sha256").update(email).digest("hex").slice(0, 12)}`;

  // Optional Prisma upsert when DB is available
  if (process.env.DATABASE_URL?.trim()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.upsert({
        where: { email },
        update: { name: body.name?.trim() || undefined },
        create: { email, name: body.name?.trim() || email.split("@")[0] },
      });
      const org = await prisma.organization.upsert({
        where: { slug: slugify(orgName) + "-" + user.id.slice(-6) },
        update: {},
        create: {
          name: orgName,
          slug: slugify(orgName) + "-" + user.id.slice(-6),
        },
      });
      await prisma.membership.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
        update: { role: "OWNER" },
        create: { userId: user.id, organizationId: org.id, role: "OWNER" },
      });

      const session: SessionUser = {
        userId: user.id,
        email: user.email,
        name: user.name || undefined,
        organizationId: org.id,
        role: "OWNER",
      };
      const res = NextResponse.json({ ok: true, session, persisted: true });
      res.headers.set("Set-Cookie", sessionCookieHeader(session));
      return res;
    } catch (err) {
      console.error("DB login path failed, using ephemeral session", err);
    }
  }

  const session: SessionUser = {
    userId,
    email,
    name: body.name?.trim() || email.split("@")[0],
    organizationId,
    role: "OWNER",
  };

  const res = NextResponse.json({
    ok: true,
    session,
    persisted: false,
    note: "Ephemeral session (no DATABASE_URL). Measurements use memory store.",
  });
  res.headers.set("Set-Cookie", sessionCookieHeader(session));
  return res;
}
