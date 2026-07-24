"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFetchScheduleDetail } from "@/hooks/vessels/actions";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { updateBooking } from "@/services/bookings";
import { useSession } from "next-auth/react";
import { Booking } from "@/types/booking";
import { DigitalCheckInList } from "@/components/dhow-manager/DigitalCheckInList";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ManifestPage() {
  const params = useParams();
  const scheduleRef = params.ref as string;

  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedule } = useFetchScheduleDetail(scheduleRef);
  const { data: bookingsData, refetch: refetchBookings } = useFetchBookings(
    schedule?.id ? { schedule: schedule.id } : undefined
  );

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (bookingsData?.results) {
      setBookings(bookingsData.results);
    }
  }, [bookingsData]);

  const handleStatusChange = async (ref: string, newCheckInStatus: "pending" | "checked_in" | "no_show") => {
    let backendStatus: "confirmed" | "completed" | "no_show" = "confirmed";
    if (newCheckInStatus === "checked_in") {
      backendStatus = "completed";
    } else if (newCheckInStatus === "no_show") {
      backendStatus = "no_show";
    }

    try {
      await updateBooking(ref, { status: backendStatus }, token);
      toast.success(`Booking ${ref} set to ${newCheckInStatus.replace("_", " ")}`);
      refetchBookings();
    } catch (err) {
      toast.error("Failed to update status in the database.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Breadcrumb Header */}
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

      {/* Manifest List Component */}
      <DigitalCheckInList
        bookings={bookings}
        scheduleRef={scheduleRef}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
