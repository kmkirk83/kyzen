import { NextResponse } from "next/server";
import { z } from "zod";

import { readAppEnv } from "@/lib/env";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  ownerEmail: z.string().trim().email(),
});

/**
 * Creates the first organization when DATABASE_URL is available.
 * Falls back to a validated draft response so the GUI wizard can continue
 * without requiring a live database (sample-data path).
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, slug, ownerEmail } = parsed.data;
  const envResult = readAppEnv();
  const hasDatabase = Boolean(envResult.success && envResult.data.DATABASE_URL);

  if (!hasDatabase) {
    return NextResponse.json({
      ok: true,
      mode: "draft" as const,
      organization: { name, slug, ownerEmail },
      message:
        "Organization draft accepted. DATABASE_URL is not configured, so the tenant was not written to Postgres. Continue with sample data or set DATABASE_URL and submit again.",
    });
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const existing = await prisma.organization.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json(
          { error: `Organization slug "${slug}" is already taken` },
          { status: 409 },
        );
      }

      const user = await prisma.user.upsert({
        where: { email: ownerEmail },
        create: { email: ownerEmail, name: name },
        update: {},
      });

      const organization = await prisma.organization.create({
        data: {
          name,
          slug,
          memberships: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
        include: { memberships: true },
      });

      return NextResponse.json({
        ok: true,
        mode: "persisted" as const,
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          ownerEmail,
        },
        message: "Organization and OWNER membership created.",
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database write failed";
    return NextResponse.json(
      {
        error: message,
        hint: "Confirm DATABASE_URL, run prisma generate, and ensure the schema is applied.",
      },
      { status: 503 },
    );
  }
}
