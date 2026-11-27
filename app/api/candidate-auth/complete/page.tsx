import { auth } from "@/lib/auth.candidate";

import {
  getCandidateSession,
  markCandidateSessionVerified,
  issueBridgeToken,
} from "@/lib/candidatesession/file";

import { prisma } from "@/lib/prisma";

import { CompleteClient } from "./complete-client";

export const instant = false;

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{
    widgetId?: string;
    sessionId?: string;
  }>;
}) {
  const { widgetId, sessionId } = await searchParams;

  // 1. Validate URL parameters
  if (!widgetId || !sessionId) {
    return (
      <p style={{ padding: 24 }}>
        Missing session information.
      </p>
    );
  }

  // 2. Get CandidateAuth session
  const authSession = await auth();

  const identity = authSession?.candidate;

  if (!identity?.email || !identity?.googleSub) {
    return (
      <p style={{ padding: 24 }}>
        Authentication failed.
        Please sign in again and close this window.
      </p>
    );
  }

  const candidateEmail = identity.email;
  const googleSub = identity.googleSub;

  // 3. Retrieve the Redis candidate session
  const redisSession = await getCandidateSession(sessionId);

  if (!redisSession) {
    return (
      <p style={{ padding: 24 }}>
        Your application session expired.
        Please try again.
      </p>
    );
  }

  // 4. Verify this session belongs to the requested widget
  if (redisSession.widgetId !== widgetId) {
    return (
      <p style={{ padding: 24 }}>
        Invalid application session.
      </p>
    );
  }

  const { companyId } = redisSession;

  // 5. Create or update candidate
  const candidate = await prisma.candidate.upsert({
    where: {
      companyId_email: {
        companyId,
        email: candidateEmail,
      },
    },

    update: {
      googleSub,
      name: identity.name ?? candidateEmail,
      image: identity.image ?? null,
    },

    create: {
      companyId,
      email: candidateEmail,
      googleSub,
      name: identity.name ?? candidateEmail,
      image: identity.image ?? null,
    },
  });

  // 6. Mark Redis session verified
  const updated = await markCandidateSessionVerified(
    sessionId,
    {
      candidateId: candidate.id,
      googleSub,
      email: candidateEmail,
    },
  );

  if (!updated) {
    return (
      <p style={{ padding: 24 }}>
        Could not verify your application session.
        Please try again.
      </p>
    );
  }

  // 7. Generate one-time bridge token
  const bridgeToken = await issueBridgeToken(sessionId);

  if (!bridgeToken) {
    return (
      <p style={{ padding: 24 }}>
        This sign-in link has already been used.
        Please restart your application.
      </p>
    );
  }

  // 8. Send authentication back to the widget popup
  return (
    <CompleteClient
      widgetId={widgetId}
      bridgeToken={bridgeToken}
      candidateEmail={candidate.email}
    />
  );
}