"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type AuthStatus = "idle" | "waiting" | "success";

function EmbeddedAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const widgetId = searchParams.get("widgetId");
  const jobId = searchParams.get("jobId");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null);
  const [bridgeToken, setBridgeToken] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");

  const popupRef = useRef<Window | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Create candidate pre-auth session
  useEffect(() => {
    if (!widgetId || !jobId) {
      setError("Missing session information.");
      return;
    }

    let cancelled = false;

    async function startSession() {
      try {
        const res = await fetch("/embedding/api/widget/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            widgetId,
            jobId,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message ?? "Could not start session.",
          );
        }

        if (!cancelled) {
          setSessionId(data.sessionId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to create session.",
          );
        }
      }
    }

    startSession();

    return () => {
      cancelled = true;
    };
  }, [widgetId, jobId]);

  // 2. Listen for successful authentication from popup
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_HIRE_YOUR_WAY;

    if (!baseUrl) {
      console.error("NEXT_PUBLIC_HIRE_YOUR_WAY is missing.");
      return;
    }

    const expectedOrigin = new URL(baseUrl).origin;

    function handleMessage(event: MessageEvent) {
      // Validate sender origin
      if (event.origin !== expectedOrigin) {
        return;
      }

      // Validate message type
      if (event.data?.type !== "HIREYOURWAY_AUTH_SUCCESS") {
        return;
      }

      // Validate widget ID
      if (event.data.widgetId !== widgetId) {
        return;
      }

      if (!event.data.bridgeToken || !event.data.candidateEmail) {
        return;
      }

      setBridgeToken(event.data.bridgeToken);
      setCandidateEmail(event.data.candidateEmail);

      setAuthStatus("success");

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [widgetId]);

  // 3. Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  // 4. Open Google authentication popup
  function continueWithGoogle() {
    if (!sessionId || !widgetId) {
      return;
    }

    setAuthStatus("waiting");

    const baseUrl = process.env.NEXT_PUBLIC_HIRE_YOUR_WAY;

    if (!baseUrl) {
      console.error("NEXT_PUBLIC_HIRE_YOUR_WAY is missing.");
      setError("Authentication configuration error.");
      setAuthStatus("idle");
      return;
    }

    const authUrl = new URL("/api/candidate-auth", baseUrl);

    authUrl.searchParams.set("widgetId", widgetId);
    authUrl.searchParams.set("sessionId", sessionId);

    popupRef.current = window.open(
      authUrl.toString(),
      "hireyourway-auth",
      "popup,width=480,height=640",
    );

    // Popup blocked
    if (!popupRef.current) {
      setAuthStatus("idle");
      setError("Your browser blocked the popup. Please allow popups.");
      return;
    }

    // Poll whether popup is closed
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }

        setAuthStatus((current) =>
          current === "success" ? current : "idle",
        );
      }
    }, 500);
  }

  // 5. Continue to application form
  function continueToForm() {
    if (!bridgeToken || !widgetId) {
      return;
    }

    const url = new URL("/embeddingwidget/form", window.location.origin);

    url.searchParams.set("widgetId", widgetId);
    url.searchParams.set("bridgeToken", bridgeToken);

    router.push(url.toString());
  }

  // Error UI
  if (error) {
    return (
      <div className="mx-auto max-w-sm p-6 font-sans">
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[95%] max-w-sm p-6 font-sans">
      <Card>
        {authStatus === "success" && candidateEmail ? (
          <>
            <CardHeader className="items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>

              <h1 className="mt-3 text-lg font-bold text-foreground">
                You're signed in
              </h1>
            </CardHeader>

            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Signed in as
              </p>

              <p className="font-semibold text-foreground">
                {candidateEmail}
              </p>
            </CardContent>

            <CardFooter>
              <Button
                onClick={continueToForm}
                className="w-full"
              >
                Continue to application
              </Button>
            </CardFooter>
          </>
        ) : authStatus === "waiting" ? (
          <>
            <CardHeader className="items-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />

              <h1 className="mt-3 text-lg font-bold text-foreground">
                One moment please…
              </h1>
            </CardHeader>

            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Complete sign-in in the popup window. This page will
                update automatically.
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="w-full text-center">
              <h1 className="text-lg font-bold text-foreground">
                Sign in to continue
              </h1>

              <p className="text-sm text-muted-foreground">
                Sign in with Google to continue your application.
              </p>
            </CardHeader>

            <CardFooter>
              <Button
                variant="outline"
                onClick={continueWithGoogle}
                disabled={!sessionId}
                className="w-full"
              >
                {!sessionId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing session...
                  </>
                ) : (
                  "Continue with Google"
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

// Suspense wrapper fixes useSearchParams prerender errors
export default function EmbeddedAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-sm p-6">
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading authentication...</span>
            </CardContent>
          </Card>
        </div>
      }
    >
      <EmbeddedAuthContent />
    </Suspense>
  );
}