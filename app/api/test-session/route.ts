import { NextResponse } from "next/server";
import {
  createCandidateSession,
  sessionKey,
} from "@/lib/candidatesession/file";
import { redis } from "@/lib/redisclient/redis";

export async function GET() {
  try {
    const sessionId = await createCandidateSession({
      widgetId: "widget_123",
      companyId: "company_123",
      jobId: "job_123",
    });

    const session = await redis.get(sessionKey(sessionId));

    return NextResponse.json({
      success: true,
      sessionId,
      session,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    );
  }
}
