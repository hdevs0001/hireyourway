"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
}

interface JobsResponse {
  success: boolean;
  jobs: Job[];
}

function WidgetJobs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const widgetId = searchParams.get("widgetId");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!widgetId) {
      setError("Widget ID is missing");
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/embedding/api/widget/job?widgetId=${encodeURIComponent(widgetId)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data: JobsResponse = await response.json();

        if (!data.success) {
          throw new Error("Unable to load jobs");
        }

        setJobs(data.jobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [widgetId]);

  if (loading) {
    return <div className="p-6 text-center">Loading jobs...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  function selectJob(jobId: string) {
    router.push(
      `/embeddingwidget/auth?widgetId=${encodeURIComponent(widgetId!)}&jobId=${encodeURIComponent(jobId)}`,
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Available Jobs
        </h1>

        {jobs.length === 0 ? (
          <p className="text-gray-500">No jobs available.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border bg-white p-5 shadow-sm relative"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {job.title}
                </h2>

                <p className="mt-2 text-gray-600">{job.description}</p>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => selectJob(job.id)}
                    className="w-25 sm:w-auto cursor-pointer bg-blue-500 p-2 rounded-xl"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading widget...</div>}>
      <WidgetJobs />
    </Suspense>
  );
}
