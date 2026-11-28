"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"

export function CompleteClient({
  widgetId,
  bridgeToken,
  candidateEmail,
}: {
  widgetId: string
  bridgeToken: string
  candidateEmail: string
}) {
  useEffect(() => {
    window.opener?.postMessage(
      { type: "HIREYOURWAY_AUTH_SUCCESS", widgetId, bridgeToken, candidateEmail },
      window.location.origin
    )

    // Identity now lives in the Redis session + bridge token, so clear the
    // candidate cookie. The next sign-in (maybe a different email) starts clean.
    signOut({ redirect: false })
      .catch(() => {})
      .finally(() => window.close())
  }, [widgetId, bridgeToken, candidateEmail])

  return <p style={{ padding: 24 }}>Signed in — you can close this window.</p>
}