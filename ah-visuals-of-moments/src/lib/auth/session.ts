import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "ah_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    "ah_visuals_default_secure_dev_secret_key_change_in_prod_32chars"
  );
}

// Simple Web Crypto HMAC SHA-256 token generator/verifier
async function signToken(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${data}.${hashHex}`;
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [data] = parts;
  const expectedToken = await signToken(data, secret);
  return expectedToken === token;
}

export async function createSessionCookie(response?: NextResponse): Promise<string> {
  const secret = getSecretKey();
  const payload = JSON.stringify({
    role: "admin",
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const token = await signToken(encodedPayload, secret);

  const isProduction = process.env.NODE_ENV === "production";

  if (response) {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }

  return token;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function verifyAdminSession(req?: Request | NextRequest): Promise<boolean> {
  let token: string | undefined;

  if (req) {
    // Read from Request headers / cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
    token = match ? decodeURIComponent(match[1]) : undefined;
  } else {
    // Read from next/headers cookies()
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      return false;
    }
  }

  if (!token) return false;

  try {
    const isValid = await verifyToken(token, getSecretKey());
    if (!isValid) return false;

    const [encodedPayload] = token.split(".");
    const payloadStr = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr);

    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function requireAdminSession(req?: Request | NextRequest): Promise<{ authenticated: boolean; error?: string }> {
  const isValid = await verifyAdminSession(req);
  if (!isValid) {
    return { authenticated: false, error: "Требуется авторизация администратора" };
  }
  return { authenticated: true };
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return password === adminPassword;
}
