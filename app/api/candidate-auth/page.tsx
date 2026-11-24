"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function CandidateAuthContent() {
  const searchParams = useSearchParams();

  const widgetId = searchParams.get("widgetId");
  const sessionId = searchParams.get("sessionId");

  useEffect(() => {
    if (!widgetId || !sessionId) return;

    signIn("google", {
      callbackUrl: `/api/candidate-auth/complete?widgetId=${encodeURIComponent(widgetId)}&sessionId=${encodeURIComponent(sessionId)}`,
    });
  }, [widgetId, sessionId]);

  if (!widgetId || !sessionId) {
    return <p style={{ padding: 24 }}>Missing session information.</p>;
  }

  return <p style={{ padding: 24 }}>Redirecting to Google...</p>;
}

export default function CandidateAuthPage() {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Loading authentication...</p>}>
      <CandidateAuthContent />
    </Suspense>
  );
}