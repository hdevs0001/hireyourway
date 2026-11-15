
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        company: {
          select: {
            widgets: {
              select: {
                Jobs: {
                  select: {
                    job: {
                      select: {
                        id: true,
                        title: true,
                        description: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract jobs from all users, companies and widgets
    const jobs = users.flatMap((user) =>
      user.company?.widgets.flatMap((widget) =>
        widget.Jobs.map((widgetJob) => widgetJob.job)
      ) ?? []
    );

    return NextResponse.json({
      success: true,
      totalJobs: jobs.length,
      jobs,
    });

  } catch (error) {
    console.error("Error fetching company jobs:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
