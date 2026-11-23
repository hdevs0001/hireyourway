// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { Suspense } from "react";

// function WidgetPageContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const widgetId = searchParams.get("widgetId");
//   const jobId = searchParams.get("jobId");

//   return (
//     <div>
//       This is widget Id: {widgetId}
//       <br />
//       This is Job Id: {jobId}
//     </div>
//   );
// }

// export default function Page() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <WidgetPageContent />
//     </Suspense>
//   );
// }

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { AlertCircle, Inbox } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
}

// Component that uses useSearchParams()
function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const widgetId = searchParams.get("widgetId");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Fetch jobs using widgetId
  useEffect(() => {
    if (!widgetId) {
      setError("Missing widget information.");
      setLoading(false);
      return;
    }

    async function loadJobs() {
      try {
        const res = await fetch(
          `/embedding/api/widget/job?widgetId=${encodeURIComponent(widgetId!)}`,
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message ?? "Could not load jobs.");
          return;
        }

        setJobs(data.jobs);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [widgetId]);

  // Navigate to application page
  function selectJob(jobId: string) {
    router.push(
      `/embeddingwidget/auth?widgetId=${encodeURIComponent(widgetId!)}&jobId=${encodeURIComponent(jobId)}`,
    );
  }

  // Expand or collapse job description
  function toggleExpanded(jobId: string) {
    setExpanded((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  }

  return (
    <div className="mx-auto max-w-2xl p-6 font-sans">
      <h1 className="mb-5 text-xl font-bold text-foreground">Open Roles</h1>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>

              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && jobs.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          <Inbox className="h-8 w-8" />

          <p className="text-sm">No open roles right now.</p>
        </div>
      )}

      {/* Jobs list */}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isExpanded = !!expanded[job.id];

            return (
              <Card key={job.id}>
                <CardHeader>
                  <h2 className="text-base font-semibold text-foreground">
                    {job.title}
                  </h2>
                </CardHeader>

                <CardContent>
                  <p
                    className={`text-sm text-muted-foreground ${
                      isExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {job.description}
                  </p>

                  {/* Read more / Show less */}
                  {job.description.length > 100 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(job.id)}
                      className="mt-1 text-sm font-medium text-primary hover:underline"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => selectJob(job.id)}
                    className="w-full cursor-pointer sm:w-auto"
                  >
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Parent component with Suspense boundary
export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-4 p-6">
          <h1 className="text-xl font-bold">Open Roles</h1>

          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>

              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
