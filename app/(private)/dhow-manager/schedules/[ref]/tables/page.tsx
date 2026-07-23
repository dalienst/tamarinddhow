"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createTable, assignTable } from "@/services/vessels";
import {
  useFetchScheduleDetail,
  useFetchTables,
} from "@/hooks/vessels/actions";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { useSession } from "next-auth/react";
import { TableManagerGrid } from "@/components/dhow-manager/TableManagerGrid";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function DynamicTablesPage() {
  const params = useParams();
  const scheduleRef = params.ref as string;

  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedule } = useFetchScheduleDetail(scheduleRef);
  const { data: tablesData, refetch: refetchTables } = useFetchTables(schedule?.id);
  const { data: bookingsData, refetch: refetchBookings } = useFetchBookings(
    schedule?.id ? { schedule: schedule.id } : undefined
  );

  const tables = tablesData?.results || [];
  const bookings = bookingsData?.results || [];

  const handleAssignTable = async (tableId: string, bookingId: string | null) => {
    try {
      await assignTable(tableId, bookingId, token);
      refetchTables();
      refetchBookings();
    } catch (err) {
      toast.error("Failed to assign table.");
    }
  };

  const handleCreateTable = async (num: string, cap: number, desc: string) => {
    if (!schedule) return;
    try {
      await createTable(
        {
          schedule: schedule.id,
          table_number: num,
          capacity: cap,
          description: desc,
          is_available: true,
        },
        token
      );
      refetchTables();
    } catch (err) {
      toast.error("Failed to create table.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dhow-manager/schedules"
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dynamic Seating & Table Layout</h1>
          {schedule && (
            <p className="text-sm text-slate-500">
              {schedule.dhow_name} | {schedule.date} ({schedule.meal_type_display})
            </p>
          )}
        </div>
      </div>

      <TableManagerGrid
        tables={tables}
        bookings={bookings}
        onAssignTable={handleAssignTable}
        onCreateTable={handleCreateTable}
      />
    </div>
  );
}
