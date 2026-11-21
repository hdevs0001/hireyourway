"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function WidgetPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const widgetId = searchParams.get("widgetId");
  const jobId = searchParams.get("jobId");

  return (
    <div>
      This is widget Id: {widgetId}
      <br />
      This is Job Id: {jobId}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WidgetPageContent />
    </Suspense>
  );
}