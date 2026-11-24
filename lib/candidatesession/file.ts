// import crypto from "crypto";
// import { redis } from "../redisclient/redis";
// import { stringify } from "querystring";
// const SESSION_TTL_SECONDS = 60 * 15;
// const BRIDGE_TOKEN_TTL_SECONDS = 60 * 10;

// export interface CandidateSessionData {
//   widgetId: string;
//   companyId: string;
//   jobId: string;
//   verified: boolean; // this check is important for disabling and enabling the continue to form button in auth form
//   candidateId?: string;
//   bridgeIssued?: boolean;
// }

// export function sessionKey(sessionId: string) {
//   return `candidate-session:${sessionId}`;
// }

// export function bridgeKey(token: string) {
//   return `bridge:${token}`;
// }
// // this function is used to create the session for the user .
// //1. when user is forwarded to the next route the auth route it will create the session for the user .
// export async function createCandidateSession({
//   widgetId,
//   companyId,
//   jobId,
// }: {
//   widgetId: string;
//   companyId: string;
//   jobId: string;
// }): Promise<string> {
//   const sessionId = crypto.randomUUID();
//   const data: CandidateSessionData = {
//     widgetId,
//     companyId,
//     jobId,
//     verified: false,
//   };
//   await redis.set(sessionKey(sessionId), JSON.stringify(data), {
//     ex: SESSION_TTL_SECONDS,
//   });

//   return sessionId;
// }

// export async function getCandidateSession(
//   sessionId: string,
// ): Promise<CandidateSessionData | null> {
//   const raw = await redis.get(sessionKey(sessionId));
//   if (!raw) return null;

//   try {
//     return JSON.parse(raw) as CandidateSessionData;
//   } catch {
//     return null; // corrupted/malformed value — treat as no session, never throw
//   }
// }

// export async function markCandidateSessionVerified(
//   sessionId: string,
//   identity: { candidateId: string; googleSub?: string; email: string },
// ): Promise<CandidateSessionData | null> {
//   const existing = await getCandidateSession(sessionId);
//   if (!existing) return null;

//   const updated: CandidateSessionData = {
//     ...existing,
//     ...identity,
//     verified: true,
//   };
//   await redis.set(sessionKey(sessionId), JSON.stringify(updated), {
//     ex: SESSION_TTL_SECONDS,
//   });
//   return updated;
// }

// // ── 4. Called by /candidate-auth/complete/page.tsx — mints the one-time token ──
// export async function hasBridgeTokenBeenIssued(
//   sessionId: string,
// ): Promise<boolean> {
//   const session = await getCandidateSession(sessionId);
//   return !!session?.bridgeIssued;
// }

// export async function issueBridgeToken(
//   sessionId: string,
// ): Promise<string | null> {
//   const session = await getCandidateSession(sessionId);
//   if (!session || session.bridgeIssued) {
//     return null; // already issued once for this session — refuse a second one
//   }

//   const token = crypto.randomBytes(32).toString("hex");
//   await redis.set(bridgeKey(token), sessionId, {
//     ex: BRIDGE_TOKEN_TTL_SECONDS,
//   });

//   // Mark the session as having already produced a token, so a refresh can't mint another.
//   const updated = { ...session, bridgeIssued: true };
//   await redis.set(sessionKey(sessionId), JSON.stringify(updated), {
//     ex: SESSION_TTL_SECONDS,
//   });

//   return token;
// }

// // ── 5. Called by /api/widget — the ONLY place a bridge token is consumed ───

// export async function verifyBridgeToken(
//   token: string,
// ): Promise<CandidateSessionData | null> {
//   const sessionId = await redis.getdel(bridgeKey(token));

//   if (!sessionId) return null;
//   const session = await getCandidateSession(sessionId);

//   if (!session || !session.verified) return null;
//   return session;
// }
import crypto from "crypto";
import { redis } from "../redisclient/redis";

const SESSION_TTL_SECONDS = 60 * 15;
const BRIDGE_TOKEN_TTL_SECONDS = 60 * 10;

export interface CandidateSessionData {
  widgetId: string;
  companyId: string;
  jobId: string;

  verified: boolean;

  candidateId?: string;
  googleSub?: string;
  email?: string;

  bridgeIssued?: boolean;
}

export function sessionKey(sessionId: string) {
  return `candidate-session:${sessionId}`;
}

export function bridgeKey(token: string) {
  return `bridge:${token}`;
}

// 1. Create a candidate session
export async function createCandidateSession({
  widgetId,
  companyId,
  jobId,
}: {
  widgetId: string;
  companyId: string;
  jobId: string;
}): Promise<string> {
  const sessionId = crypto.randomUUID();

  const data: CandidateSessionData = {
    widgetId,
    companyId,
    jobId,
    verified: false,
  };

  await redis.set(sessionKey(sessionId), data, {
    ex: SESSION_TTL_SECONDS,
  });

  return sessionId;
}

// 2. Get candidate session

export async function getCandidateSession(
  sessionId: string,
): Promise<CandidateSessionData | null> {
  try {
    const raw = await redis.get<CandidateSessionData | string>(
      sessionKey(sessionId),
    );

    if (!raw) {
      console.log("[REDIS] Session not found:", sessionId);
      return null;
    }

    // Upstash may already have deserialized the JSON.
    const data: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (
      typeof data !== "object" ||
      data === null ||
      !("widgetId" in data) ||
      !("companyId" in data) ||
      !("jobId" in data) ||
      !("verified" in data)
    ) {
      console.error("[REDIS] Invalid candidate session:", sessionId);
      return null;
    }

    console.log("[REDIS] Session successfully retrieved:", sessionId);

    return data as CandidateSessionData;
  } catch (error) {
    console.error("[REDIS] Session retrieval error:", error);
    return null;
  }
}

// 3. Mark candidate as verified
export async function markCandidateSessionVerified(
  sessionId: string,
  identity: {
    candidateId: string;
    googleSub?: string;
    email: string;
  },
): Promise<CandidateSessionData | null> {
  const existing = await getCandidateSession(sessionId);

  if (!existing) {
    return null;
  }

  const updated: CandidateSessionData = {
    ...existing,
    ...identity,
    verified: true,
  };

  await redis.set(sessionKey(sessionId), updated, {
    ex: SESSION_TTL_SECONDS,
  });

  return updated;
}

// 4. Check whether a bridge token was already issued
export async function hasBridgeTokenBeenIssued(
  sessionId: string,
): Promise<boolean> {
  const session = await getCandidateSession(sessionId);

  return Boolean(session?.bridgeIssued);
}

// 5. Issue a one-time bridge token
export async function issueBridgeToken(
  sessionId: string,
): Promise<string | null> {
  const session = await getCandidateSession(sessionId);

  if (!session || session.bridgeIssued) {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");

  await redis.set(bridgeKey(token), sessionId, {
    ex: BRIDGE_TOKEN_TTL_SECONDS,
  });

  const updated: CandidateSessionData = {
    ...session,
    bridgeIssued: true,
  };

  await redis.set(sessionKey(sessionId), updated, {
    ex: SESSION_TTL_SECONDS,
  });

  return token;
}

// 6. Consume the bridge token — one-time use
export async function verifyBridgeToken(
  token: string,
): Promise<CandidateSessionData | null> {
  const rawSessionId: unknown = await redis.getdel(bridgeKey(token));

  // Make sure Redis returned an actual session ID string
  if (typeof rawSessionId !== "string") {
    return null;
  }

  const session = await getCandidateSession(rawSessionId);

  if (!session || !session.verified) {
    return null;
  }

  return session;
}
