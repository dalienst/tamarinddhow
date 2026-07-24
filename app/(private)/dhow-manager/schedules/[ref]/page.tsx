"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ScheduleDetailPageRedirect() {
  const router = useRouter();
  const params = useParams();
  const ref = params.ref as string;

  useEffect(() => {
    if (ref) {
      router.replace(`/dhow-manager/schedules/${ref}/manifest`);
    }
  }, [ref, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" style={{ borderRadius: "50%" }} />
    </div>
  );
}
