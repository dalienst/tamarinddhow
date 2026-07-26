"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFetchScheduleDetail, useFetchTables } from "@/hooks/vessels/actions";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { updateBooking } from "@/services/bookings";
import { updateSchedule } from "@/services/vessels";
import { useSession } from "next-auth/react";
import { Booking } from "@/types/booking";
import { DigitalCheckInList } from "@/components/dhow-manager/DigitalCheckInList";
import { ArrowLeft, Lock, Check, Anchor } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton, SkeletonRow } from "@/components/common/Skeleton";

export default function ManifestPage() {
  const params = useParams();
  const scheduleRef = params.ref as string;

  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedule, isLoading: loadingSchedule, refetch: refetchSchedule } = useFetchScheduleDetail(scheduleRef);
  const { data: bookingsData, isLoading: loadingBookings, refetch: refetchBookings } = useFetchBookings(
    schedule?.id ? { schedule: schedule.id } : undefined
  );
  const { data: tablesData } = useFetchTables(schedule?.id);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isClosingChecklist, setIsClosingChecklist] = useState(false);

  useEffect(() => {
    if (bookingsData?.results) {
      setBookings(bookingsData.results);
    }
  }, [bookingsData]);

  if (loadingSchedule || loadingBookings) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  const isClosed = schedule?.status === "completed" || schedule?.status === "cancelled";

  const handleStatusChange = async (ref: string, newCheckInStatus: "pending" | "checked_in" | "no_show") => {
    if (schedule?.status === "completed") {
      toast.error("This voyage has already sailed. Checklist is locked.");
      return;
    }

    let backendStatus: "confirmed" | "completed" | "no_show" = "confirmed";
    if (newCheckInStatus === "checked_in") {
      backendStatus = "completed";
    } else if (newCheckInStatus === "no_show") {
      backendStatus = "no_show";
    }

    try {
      await updateBooking(ref, { status: backendStatus }, token);
      toast.success("Guest check-in status updated.");
      refetchBookings();
    } catch (err) {
      toast.error("Failed to update check-in status.");
    }
  };

  const handleCloseChecklist = async () => {
    if (!schedule) return;
    if (!confirm("Are you sure you want to mark this sailing as sailed? This will lock the checklist and confirm the passenger count.")) return;

    setIsClosingChecklist(true);
    try {
      await updateSchedule(scheduleRef, { status: "completed" }, token);
      toast.success("Voyage checklist successfully closed.");
      refetchSchedule();
    } catch (err) {
      toast.error("Failed to close sailing checklist.");
    } finally {
      setIsClosingChecklist(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Closed Banner Warning */}
      {isClosed && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 px-5 py-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <Lock className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div className="text-xs font-semibold">
            Sailing Checklist Locked: The dhow has completed boarding and has sailed. Passengers check-in status cannot be modified.
          </div>
        </div>
      )}

      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dhow-manager/schedules"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily Sailing Manifest & Check-In</h1>
            {schedule && (
              <p className="text-sm text-slate-500 font-medium">
                {schedule.dhow_name} | {schedule.date} ({schedule.meal_type_display}) | {schedule.departure_time.substring(0,5)} - {schedule.return_time.substring(0,5)}
              </p>
            )}
          </div>
        </div>

        {schedule && !isClosed && (
          <button
            onClick={handleCloseChecklist}
            disabled={isClosingChecklist}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-800/80 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:cursor-not-allowed"
          >
            {isClosingChecklist ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                Closing Checklist...
              </>
            ) : (
              <>
                <Anchor className="w-4 h-4" />
                Mark Dhow as Sailed (Close Checklist)
              </>
            )}
          </button>
        )}
      </div>

      {/* Manifest List Component */}
      <DigitalCheckInList
        bookings={bookings}
        tables={tablesData?.results || []}
        token={token}
        onRefetch={refetchBookings}
        scheduleRef={scheduleRef}
        onStatusChange={handleStatusChange}
        disabled={isClosed}
      />
    </div>
  );
}
