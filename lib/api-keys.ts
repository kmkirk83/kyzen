import { createHash, randomBytes } from "crypto";

export type ApiKeyRecord = {
  id: string;
  organizationId: string;
  label: string;
  prefix: string;
  hashedKey: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
  revokedAt?: string;
};

const memoryKeys: ApiKeyRecord[] = [];

export function hashApiKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey(): { raw: string; prefix: string; hashedKey: string } {
  const raw = `kyz_${randomBytes(24).toString("hex")}`;
  return { raw, prefix: raw.slice(0, 12), hashedKey: hashApiKey(raw) };
}

export async function issueApiKey(input: {
  organizationId: string;
  userId: string;
  label: string;
  scopes?: string[];
  expiresAt?: Date;
}) {
  const { raw, prefix, hashedKey } = generateApiKey();
  const scopes = input.scopes ?? ["measurements:read", "measurements:write"];

  if (process.env.DATABASE_URL?.trim()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.apiKey.create({
        data: {
          organizationId: input.organizationId,
          userId: input.userId,
          label: input.label,
          hashedKey,
          scopes: scopes.join(","),
          expiresAt: input.expiresAt,
        },
      });
      return {
        raw,
        record: {
          id: row.id,
          organizationId: row.organizationId,
          label: row.label,
          prefix,
          hashedKey: row.hashedKey,
          scopes,
          createdAt: row.createdAt.toISOString(),
          expiresAt: row.expiresAt?.toISOString(),
        } satisfies ApiKeyRecord,
      };
    } catch (err) {
      console.error("API key Prisma create failed", err);
    }
  }

  const record: ApiKeyRecord = {
    id: `key_${randomBytes(8).toString("hex")}`,
    organizationId: input.organizationId,
    label: input.label,
    prefix,
    hashedKey,
    scopes,
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresAt?.toISOString(),
  };
  memoryKeys.push(record);
  return { raw, record };
}

export async function verifyApiKey(raw: string | null | undefined) {
  if (!raw?.startsWith("kyz_")) return null;
  const hashedKey = hashApiKey(raw);

  if (process.env.DATABASE_URL?.trim()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.apiKey.findFirst({ where: { hashedKey } });
      if (!row) return null;
      if (row.revokedAt) return null;
      if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
      await prisma.apiKey.update({
        where: { id: row.id },
        data: { lastUsedAt: new Date() },
      });
      return {
        organizationId: row.organizationId,
        userId: row.userId,
        scopes: (row.scopes || "").split(",").filter(Boolean),
        keyId: row.id,
      };
    } catch (err) {
      console.error("API key verify failed", err);
    }
  }

  const record = memoryKeys.find((k) => k.hashedKey === hashedKey);
  if (!record || record.revokedAt) return null;
  if (record.expiresAt && Date.parse(record.expiresAt) < Date.now()) return null;
  return {
    organizationId: record.organizationId,
    userId: "api-key",
    scopes: record.scopes,
    keyId: record.id,
  };
}

export function hasScope(scopes: string[], needed: string) {
  return scopes.includes(needed) || scopes.includes("*");
}
