import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCandidateSession } from "@/lib/candidatesession/file";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { widgetId, jobId } = body;
    if (!widgetId) {
      return NextResponse.json(
        {
          success: false,
          message: "widgetId is false",
        },
        {
          status: 400,
        },
      );
    }

    const widget = await prisma.widget.findUnique({
      where: { widgetId },
      select: {
        id: true,
        isActive: true,
        allowedDomains: true,
        companyId: true,
      },
    });

    if (!widget || !widget.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid or inactive widget" },
        { status: 404 },
      );
    }

    // if (!parentOrigin || !widget.allowedDomains.includes(parentOrigin)) {
    //   return NextResponse.json(
    //     { success: false, message: "Invalid widget origin" },
    //     { status: 403 },
    //   );
    // }

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "jobId is required" },
        { status: 400 },
      );
    }
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, isActive: true, companyId: true },
    });

    if (!job || !job.isActive || job.companyId !== widget.companyId) {
      return NextResponse.json(
        { success: false, message: "Invalid job" },
        { status: 400 },
      );
    }

    const sessionId = await createCandidateSession({
      widgetId,
      companyId: widget.companyId,
      jobId: job.id,
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    console.error("[widget/session] error:", err);
    return NextResponse.json(
      { success: false, message: "Internal error" },
      { status: 500 },
    );
  }
}
