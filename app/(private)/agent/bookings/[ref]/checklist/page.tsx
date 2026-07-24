"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFetchBookingDetail, useFetchBookingGuests } from "@/hooks/bookings/actions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ArrowLeft, Printer, Download, Users, Ship, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function AgentChecklistPage() {
  const params = useParams();
  const bookingRef = params.ref as string;

  // Query Hooks
  const { data: booking } = useFetchBookingDetail(bookingRef);
  const { data: guestsData } = useFetchBookingGuests(booking?.id);

  const guests = guestsData?.results || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/agent/dashboard"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agent Group Passenger Checklist</h1>
            <p className="text-sm text-slate-500">Official boarding checklist for tour guides and dhow crew.</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF Checklist
        </button>
      </div>

      {/* Printable Checklist Document */}
      {booking && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest font-extrabold text-indigo-600 mb-1">
                Tamarind Dhow Boarding Manifest
              </div>
              <h2 className="text-2xl font-black text-slate-900">Group Reservation #{booking.reference}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Sailing Date: <strong className="text-slate-800">{booking.schedule_date}</strong> ({booking.schedule_meal_type})
              </p>
            </div>
            <div className="text-right space-y-1">
              <StatusBadge status={booking.status} type="booking" />
              <div className="text-xs text-slate-500">Group Size: <strong>{booking.party_size} Passengers</strong></div>
              <div className="text-xs text-slate-500">Table: <strong>{booking.table_number || "To be assigned"}</strong></div>
            </div>
          </div>

          {/* Passenger Roster List Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Group Passenger List</h3>
            <table className="w-full text-left text-sm text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Passenger Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Dietary Requirements</th>
                  <th className="px-4 py-3 text-center print:table-cell">Check-In Box</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {guests.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {g.first_name} {g.last_name} {g.is_primary ? "(Primary)" : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{g.phone || g.email || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                      {g.dietary_needs || "Standard Menu"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="w-5 h-5 border-2 border-slate-400 rounded mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Notes */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
            <span>Generated by Tamarind Dhow Agent Portal</span>
            <span>Ref: {booking.reference}</span>
          </div>
        </div>
      )}
    </div>
  );
}
