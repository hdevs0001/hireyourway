"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type AuthStatus = "idle" | "waiting" | "success";

export default function EmbeddedAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("widgetId");
  const jobId = searchParams.get("jobId");
  // const parentOrigin = searchParams.get("parentOrigin");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null);
  const [bridgeToken, setBridgeToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");

  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Create the pre-auth session as soon as this page loads
  useEffect(() => {
    if (!widgetId || !jobId) {
      setError("Missing session information.");
      return;
    }

    async function startSession() {
      const res = await fetch(`/embedding/api/widget/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetId, jobId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message ?? "Could not start session.");
        return;
      }
      setSessionId(data.sessionId);
    }

    startSession();
  }, [widgetId, jobId]);

  // 2. Listen for the popup's postMessage reply
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== import.meta.env.VITE_HIRE_YOUR_WAY) return;
      if (event.data?.type !== "HIREYOURWAY_AUTH_SUCCESS") return;
      if (event.data.widgetId !== widgetId) return;

      setBridgeToken(event.data.bridgeToken);
      setCandidateEmail(event.data.candidateEmail);
      setAuthStatus("success");

      if (pollRef.current) clearInterval(pollRef.current);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [widgetId]);

  // Cleanup the popup-closed poller on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function continueWithGoogle() {
    if (!sessionId || !widgetId) return;

    setAuthStatus("waiting");

    popupRef.current = window.open(
      `/candidate-auth?widgetId=${encodeURIComponent(widgetId)}&sessionId=${encodeURIComponent(sessionId)}`,
      "hireyourway-auth",
      "popup,width=480,height=640",
    );

    // If the user closes the popup without completing sign-in, don't leave
    // them stuck on "One moment please..." forever - reset back to idle.
    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(pollRef.current!);
        setAuthStatus((current) => (current === "success" ? current : "idle"));
      }
    }, 500);
  }

  function continueToForm() {
    if (!bridgeToken || !widgetId) return;
    router.push(
      `/embeddingwidget/form?widgetId=${encodeURIComponent(widgetId)}&bridgeToken=${encodeURIComponent(bridgeToken)}}`,
    );
  }

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
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-semibold text-foreground">{candidateEmail}</p>
            </CardContent>

            <CardFooter>
              <Button onClick={continueToForm} className="w-full">
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
                Complete sign-in in the popup window. This page will update
                automatically.
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center w-full">
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
                Continue with Google
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
