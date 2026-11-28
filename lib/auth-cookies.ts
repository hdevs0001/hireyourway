// lib/auth-cookies.ts
//
// Auth.js stores several cookies per sign-in flow: session token, CSRF token,
// callback URL, and OAuth state / PKCE / nonce. If these share names, the
// dashboard, form and candidate auth instances overwrite each other's cookies.
// Giving every instance its own prefix isolates them completely.

import type { NextAuthConfig } from "next-auth";

const isProd = process.env.NODE_ENV === "production";
const securePrefix = isProd ? "__Secure-" : "";

export function authCookies(
  prefix: string,
): NonNullable<NextAuthConfig["cookies"]> {
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: isProd,
  };

  const name = (suffix: string) => `${securePrefix}${prefix}.${suffix}`;

  return {
    sessionToken: { name: name("session-token"), options },
    callbackUrl: { name: name("callback-url"), options },
    csrfToken: { name: name("csrf-token"), options },
    pkceCodeVerifier: { name: name("pkce.code_verifier"), options },
    state: { name: name("state"), options },
    nonce: { name: name("nonce"), options },
  };
}