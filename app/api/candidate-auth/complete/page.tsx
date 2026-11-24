
import { auth } from "@/FormAuth/auth";
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

  if (!widgetId || !sessionId) {
    return (
      <p style={{ padding: 24 }}>
        Missing session information.
      </p>
    );
  }

  // 1. Get authenticated Google user
const session = await auth();
const user = session?.user;

const candidateEmail = user?.email;

if (!user || !candidateEmail) {
  return (
    <p style={{ padding: 24 }}>
      Authentication failed. You can close this window.
    </p>
  );
}

  // 2. Retrieve Google account information
  const googleAccount = await prisma.account.findFirst({
    where: {
      provider: "google",
      user: {
        is: {
          email: candidateEmail,
        },
      },
    },
    select: {
      providerAccountId: true,
    },
  });

  if (!googleAccount) {
    return (
      <p style={{ padding: 24 }}>
        Google account information not found. Please sign in again.
      </p>
    );
  }

  const googleSub = googleAccount.providerAccountId;

  // 3. Retrieve Redis candidate session
const redisSession = await getCandidateSession(sessionId);

console.log("REDIS SESSION DEBUG:", {
  sessionId,
  redisSession,
  found: !!redisSession,
});

if (!redisSession) {
  return <p>Redis session not found.</p>;
}

  const { companyId } = redisSession;

  // 4. Create or update candidate
  const candidate = await prisma.candidate.upsert({
    where: {
      companyId_email: {
        companyId,
        email: candidateEmail,
      },
    },
    update: {
      googleSub,
      name: user.name ?? candidateEmail,
      image: user.image ?? null,
    },
    create: {
      companyId,
      email: candidateEmail,
      googleSub,
      name: user.name ?? candidateEmail,
      image: user.image ?? null,
    },
  });

  // 5. Mark Redis session as verified
const updated = await markCandidateSessionVerified(sessionId, {
  candidateId: candidate.id,
  googleSub,
  email: candidateEmail,
});

console.log("REDIS VERIFICATION DEBUG:", {
  sessionId,
  updated,
});

if (!updated) {
  return <p>Redis verification failed.</p>;
}

  // 6. Generate bridge token
  const bridgeToken = await issueBridgeToken(sessionId);

  if (!bridgeToken) {
    return (
      <p style={{ padding: 24 }}>
        This sign-in link has already been used.
        Please close this window and try again.
      </p>
    );
  }

  // 7. Render completion client
  return (
    <CompleteClient
      widgetId={widgetId}
      bridgeToken={bridgeToken}
      candidateEmail={candidate.email}
    />
  );
}
