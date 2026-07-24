"use client";

import React, { useState } from "react";
import { Booking, CheckInStatus } from "@/types/booking";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Search, CheckCircle2, XCircle, Clock, Printer, Download } from "lucide-react";
import toast from "react-hot-toast";

interface DigitalCheckInListProps {
  bookings: Booking[];
  scheduleRef: string;
  onStatusChange?: (bookingRef: string, newCheckInStatus: CheckInStatus) => void;
}

export const DigitalCheckInList: React.FC<DigitalCheckInListProps> = ({
  bookings,
  scheduleRef,
  onStatusChange,
}) => {
  const [search, setSearch] = useState("");
  const [checkInMap, setCheckInMap] = useState<Record<string, CheckInStatus>>({});

  React.useEffect(() => {
    const initial: Record<string, CheckInStatus> = {};
    bookings.forEach((b) => {
      let statusVal: CheckInStatus = "pending";
      if (b.status === "completed") {
        statusVal = "checked_in";
      } else if (b.status === "no_show") {
        statusVal = "no_show";
      }
      initial[b.reference] = statusVal;
    });
    setCheckInMap(initial);
  }, [bookings]);

  const handleCheckInToggle = (reference: string, newStatus: CheckInStatus) => {
    setCheckInMap((prev) => ({ ...prev, [reference]: newStatus }));
    if (onStatusChange) {
      onStatusChange(reference, newStatus);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.reference.toLowerCase().includes(term) ||
      (b.booked_by_name && b.booked_by_name.toLowerCase().includes(term)) ||
      (b.booked_by_email && b.booked_by_email.toLowerCase().includes(term)) ||
      (b.table_number && b.table_number.toLowerCase().includes(term)) ||
      (b.special_requests && b.special_requests.toLowerCase().includes(term))
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Passenger Sailing Manifest</h2>
          <p className="text-sm text-slate-500">
            Total Booked Guests: <span className="font-semibold text-slate-700">{bookings.reduce((sum, b) => sum + b.party_size, 0)}</span> | Total Bookings: <span className="font-semibold text-slate-700">{bookings.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guest name, ref, table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print List
          </button>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Guest & Reference</th>
              <th className="px-6 py-3.5">Party Size</th>
              <th className="px-6 py-3.5">Package & Add-ons</th>
              <th className="px-6 py-3.5">Table</th>
              <th className="px-6 py-3.5">Special Requests</th>
              <th className="px-6 py-3.5">Booking Status</th>
              <th className="px-6 py-3.5 print:hidden">Digital Check-In</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No guests found matching your search.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => {
                const currentStatus = checkInMap[b.reference] || "pending";
                return (
                  <tr key={b.reference} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{b.booked_by_name || "Walk-In Guest"}</div>
                      <div className="text-xs text-slate-400 font-mono">{b.reference}</div>
                      <div className="text-xs text-slate-500">{b.booked_by_email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {b.party_size} {b.party_size === 1 ? "person" : "people"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{b.package_name || "Standard Package"}</div>
                      {b.is_exclusive && (
                        <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                          Exclusive Charter
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {b.table_number ? (
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                          Table {b.table_number}
                        </span>
                      ) : (
                        <span className="text-xs italic text-slate-400">Unassigned</span>
                      )}
                      {b.table_request && (
                        <div className="text-xs text-amber-700 mt-1 italic">
                          Req: "{b.table_request}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                      {b.special_requests || "None"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} type="booking" />
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCheckInToggle(b.reference, "checked_in")}
                          className={`p-1.5 rounded-lg border transition-all ${
                            currentStatus === "checked_in"
                              ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                              : "bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title="Mark Checked In"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleCheckInToggle(b.reference, "pending")}
                          className={`p-1.5 rounded-lg border transition-all ${
                            currentStatus === "pending"
                              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                              : "bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-amber-50"
                          }`}
                          title="Mark Pending"
                        >
                          <Clock className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleCheckInToggle(b.reference, "no_show")}
                          className={`p-1.5 rounded-lg border transition-all ${
                            currentStatus === "no_show"
                              ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                              : "bg-white text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                          title="Mark No Show"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
