/**
 * Lightweight signed-session auth (no extra dependencies).
 * Cookie: kyzen_session = base64url(payload).base64url(hmac)
 * Replace with Auth.js when the buyer wants OAuth/magic-link providers.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type SessionUser = {
  userId: string;
  email: string;
  name?: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
};

const COOKIE = "kyzen_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 14;

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-only-insecure-secret-change-me";
}

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromB64url(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

function sign(payloadB64: string) {
  return b64url(createHmac("sha256", secret()).update(payloadB64).digest());
}

export function encodeSession(user: SessionUser) {
  const payloadB64 = b64url(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE_SEC * 1000 }));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function decodeSession(token: string | undefined | null): SessionUser | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sig] = token.split(".");
  const expected = sign(payloadB64);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(fromB64url(payloadB64).toString("utf8")) as SessionUser & { exp?: number };
    if (data.exp && Date.now() > data.exp) return null;
    if (!data.userId || !data.organizationId || !data.email) return null;
    return {
      userId: data.userId,
      email: data.email,
      name: data.name,
      organizationId: data.organizationId,
      role: data.role || "ANALYST",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(user: SessionUser) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function sessionCookieHeader(user: SessionUser) {
  const token = encodeSession(user);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure}`;
}
