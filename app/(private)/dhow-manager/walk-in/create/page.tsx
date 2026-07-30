"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserPlus, ArrowLeft } from "lucide-react";
import WalkInBookingForm from "@/forms/walk-in/WalkInBookingForm";
import BulkWalkInBookingForm from "@/forms/walk-in/BulkWalkInBookingForm";

function RegisterWalkInFormContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId") || undefined;
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const [formMode, setFormMode] = useState<"single" | "bulk">("single");

  const handleSuccess = () => {
    router.push("/dhow-manager/walk-in");
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Back navigation & Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push("/dhow-manager/walk-in")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Walk-In Log
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus className="w-7 h-7 text-amber-600" />
              Register Walk-In Booking
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create a single walk-in passenger booking or load bulk group manifest rows.
            </p>
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200 w-fit">
            <button
              onClick={() => setFormMode("single")}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                formMode === "single"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Single Guest Booking
            </button>
            <button
              onClick={() => setFormMode("bulk")}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                formMode === "bulk"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Bulk Group Entry
            </button>
          </div>
        </div>
      </div>

      {/* Form wrapper */}
      {formMode === "single" ? (
        <WalkInBookingForm token={token} onSuccess={handleSuccess} initialScheduleId={scheduleId} />
      ) : (
        <BulkWalkInBookingForm token={token} onSuccess={handleSuccess} />
      )}

    </div>
  );
}

export default function RegisterWalkInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center p-6 text-slate-500 font-semibold text-sm">
        Loading...
      </div>
    }>
      <RegisterWalkInFormContainer />
    </Suspense>
  );
}
