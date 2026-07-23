"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFetchScheduleDetail } from "@/hooks/vessels/actions";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { Booking } from "@/types/booking";
import { DigitalCheckInList } from "@/components/dhow-manager/DigitalCheckInList";
import { ArrowLeft, Ship, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function ManifestPage() {
  const params = useParams();
  const scheduleRef = params.ref as string;

  // Query Hooks
  const { data: schedule, isLoading: loadingSchedule } = useFetchScheduleDetail(scheduleRef);
  const { data: bookingsData, isLoading: loadingBookings } = useFetchBookings(
    schedule?.id ? { schedule: schedule.id } : undefined
  );

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (bookingsData?.results) {
      setBookings(bookingsData.results);
    }
  }, [bookingsData]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
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
            <p className="text-sm text-slate-500">
              {schedule.dhow_name} | {schedule.date} ({schedule.meal_type_display}) | {schedule.departure_time}
            </p>
          )}
        </div>
      </div>

      {/* Manifest List Component */}
      <DigitalCheckInList
        bookings={bookings}
        scheduleRef={scheduleRef}
        onStatusChange={(ref, newStatus) => {
          setBookings((prev) =>
            prev.map((b) => (b.reference === ref ? { ...b, check_in_status: newStatus } : b))
          );
        }}
      />
    </div>
  );
}
