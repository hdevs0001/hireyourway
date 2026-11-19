import crypto from "crypto";
import { redis } from "../redisclient/redis";
import { stringify } from "querystring";
const SESSION_TTL_SECONDS = 60 * 15;
const BRIDGE_TOKEN_TTL_SECONDS = 60 * 10;

export interface CandidateSessionData {
  widgetId: string;
  companyId: string;
  jobId: string;
  verified: boolean; // this check is important for disabling and enabling the continue to form button in auth form
  candidateId?: string;
}

function sessionKey(sessionId: string) {
  return `candidate-session:${sessionId}`;
}

function bridgeKey(token: string) {
  return `bridge:${token}`;
}
// this function is used to create the session for the user .
//1. when user is forwarded to the next route the auth route it will create the session for the user .
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
  await redis.set(sessionKey(sessionId), JSON.stringify(data), {
    ex: SESSION_TTL_SECONDS,
  });

  return sessionId;
}
