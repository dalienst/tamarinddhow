"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useFetchSchedules, useFetchDhows } from "@/hooks/vessels/actions";
import { Ship, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Skeleton, SkeletonCard } from "@/components/common/Skeleton";
import Link from "next/link";

export default function SupervisorDashboard() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules();
  const { data: dhowsData, isLoading: loadingDhows } = useFetchDhows();

  const rawSchedules = schedulesData?.results || [];
  const dhows = dhowsData?.results || [];

  const schedules = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const upcoming = rawSchedules.filter((s) => s.date >= todayStr);
    upcoming.sort((a, b) => a.date.localeCompare(b.date));
    return upcoming;
  }, [rawSchedules]);

  if (loadingSchedules || loadingDhows) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="space-y-2 border-b border-gray-200 pb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Ship className="w-8 h-8 text-emerald-600" /> Supervisor Boarding Desk
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage boarding manifest check-ins, verify guest lists, and register pier walk-ins for active cruises.
        </p>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 font-semibold text-sm shadow-sm">
            No active or upcoming sailing voyages planned.
          </div>
        ) : (
          schedules.map((s) => {
            const dhow = dhows.find((d) => d.id === s.dhow);
            const capacity = dhow ? dhow.total_capacity : (s.current_pax_count + s.available_capacity);
            const minQuota = dhow ? dhow.min_quota : 10;
            const pax = s.current_pax_count;
            const isQuotaMet = pax >= minQuota;

            return (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Ship className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                        {s.dhow_name}
                      </span>
                      <StatusBadge status={s.status} type="schedule" />
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                          s.is_open && s.status !== "completed" && s.status !== "cancelled"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.is_open && s.status !== "completed" && s.status !== "cancelled"
                          ? "Bookings Open"
                          : "Bookings Closed"}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{s.date}</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-semibold text-slate-600">{s.meal_type_display}</span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {s.departure_time.substring(0, 5)} - {s.return_time.substring(0, 5)}
                      </span>
                    </div>

                    {/* Pax status summary */}
                    <div className="pt-2 text-xs text-slate-500 font-medium">
                      Boarded/Booked: <strong className="text-slate-850 font-bold">{pax} / {capacity} Pax</strong>
                      <span className="mx-2 text-slate-300">•</span>
                      <span className={isQuotaMet ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                        {isQuotaMet ? "Min Quota Met" : `Quota Needs: ${minQuota}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions group */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/manifest/${s.reference}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-lg"
                  >
                    Open manifest checklist <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/supervisor/scanner?scheduleRef=${s.reference}`}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 transition-colors shadow-sm"
                  >
                    QR Scanner
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
