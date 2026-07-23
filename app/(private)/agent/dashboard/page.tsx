"use client";

import React from "react";
import Link from "next/link";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Users, Plus, Download, Calendar, Ship, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";

export default function AgentDashboardPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hook
  const { data: bookingsData } = useFetchBookings({ booking_type: "group_agent" });
  const bookings = bookingsData?.results || [];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            Tour Operator Workspace
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Agent Group Booking Dashboard</h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            Book group sailings, manage passenger rosters, and download printable boarding checklists.
          </p>
        </div>

        <Link
          href="/agent/book"
          className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg transition-colors text-sm"
        >
          <Plus className="w-5 h-5" /> Book New Group Sailing
        </Link>
      </div>

      {/* Group Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Your Active Group Bookings
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{bookings.length} Group Reservations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Booking Ref</th>
                <th className="px-6 py-3.5">Sailing Date & Meal</th>
                <th className="px-6 py-3.5">Group Size</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Passenger Checklist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No group bookings found. Click "Book New Group Sailing" to create one.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{b.reference}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{b.schedule_date || "Upcoming Date"}</div>
                      <div className="text-xs text-slate-500">{b.schedule_meal_type}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-900">{b.party_size} Guests</td>
                    <td className="px-6 py-4 font-extrabold text-amber-700">KES {b.total_amount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} type="booking" />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/agent/bookings/${b.reference}/checklist`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Checklist
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
