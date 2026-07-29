"use client";

import React, { useState, useEffect } from "react";
import { Booking, CheckInStatus } from "@/types/booking";
import { StatusBadge } from "@/components/common/StatusBadge";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  UserX,
  UtensilsCrossed,
  X,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { updateBookingGuest } from "@/services/bookings";
import { assignTable } from "@/services/vessels";

interface DigitalCheckInListProps {
  bookings: Booking[];
  tables: any[];
  token: string;
  onRefetch: () => void;
  scheduleRef: string;
  onStatusChange?: (bookingRef: string, newCheckInStatus: CheckInStatus) => void;
  disabled?: boolean;
}

export const DigitalCheckInList: React.FC<DigitalCheckInListProps> = ({
  bookings,
  tables,
  token,
  onRefetch,
  scheduleRef,
  onStatusChange,
  disabled = false,
}) => {
  const [search, setSearch] = useState("");
  const [checkInMap, setCheckInMap] = useState<Record<string, CheckInStatus>>({});
  const [expandedRefs, setExpandedRefs] = useState<Record<string, boolean>>({});
  const [processingTables, setProcessingTables] = useState<Record<string, boolean>>({});
  const [processingGuests, setProcessingGuests] = useState<Record<string, boolean>>({});

  useEffect(() => {
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

  const handleMainCheckIn = async (booking: Booking, statusVal: CheckInStatus) => {
    if (disabled) return;
    
    let guestStatus: CheckInStatus = "pending";
    if (statusVal === "checked_in") {
      guestStatus = "checked_in";
    } else if (statusVal === "no_show") {
      guestStatus = "no_show";
    }

    const loadingToast = toast.loading("Updating check-in roster...");
    try {
      // 1. Update all guest roster statuses in parallel
      if (booking.booking_guests && booking.booking_guests.length > 0) {
        await Promise.all(
          booking.booking_guests.map((g) => 
            updateBookingGuest(g.id, { status: guestStatus }, token)
          )
        );
      }
      
      // 2. Trigger main booking status update callback
      if (onStatusChange) {
        onStatusChange(booking.reference, statusVal);
      }
      toast.success("Roster check-in synced successfully!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to sync checklist.", { id: loadingToast });
    }
  };

  const handlePrint = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    window.open(`${apiBase}/api/v1/schedules/${scheduleRef}/download-pdf/`, "_blank");
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
              <th className="px-6 py-3.5">Seats (A / C)</th>
              <th className="px-6 py-3.5">Package & Add-ons</th>
              <th className="px-6 py-3.5">Table Seating</th>
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
                const isExpanded = !!expandedRefs[b.reference];
                const checkedInGuests = b.booking_guests?.filter(g => g.status === "checked_in").length || 0;
                
                // Get all tables assigned to this specific booking ID
                const assignedTables = tables.filter((t) => t.assigned_to === b.id);
                const availableTables = tables.filter((t) => !t.assigned_to);
                const isProcessing = !!processingTables[b.reference];

                return (
                  <React.Fragment key={b.reference}>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{b.booked_by_name || "Walk-In Guest"}</div>
                        <div className="text-xs text-slate-400 font-mono">{b.reference}</div>
                        <div className="text-xs text-slate-500">{b.booked_by_email}</div>
                        
                        <button
                          onClick={() => setExpandedRefs(prev => ({ ...prev, [b.reference]: !prev[b.reference] }))}
                          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-bold mt-2"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Plate Roster ({checkedInGuests}/{b.party_size} Attended)
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {b.party_size} {b.party_size === 1 ? "person" : "people"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          ({b.adult_count || b.party_size} Adults, {b.child_count || 0} Kids)
                        </div>
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
                        <div className="space-y-2 max-w-[170px]">
                          {/* List of currently assigned tables */}
                          {assignedTables.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {assignedTables.map((t) => (
                                <span 
                                  key={t.id} 
                                  className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold px-2 py-0.5 rounded-lg"
                                >
                                  T{t.table_number}
                                  <button
                                    type="button"
                                    disabled={disabled || isProcessing}
                                    onClick={async () => {
                                      setProcessingTables(prev => ({ ...prev, [b.reference]: true }));
                                      try {
                                        await assignTable(t.id, null, token);
                                        toast.success(`Table ${t.table_number} cleared`);
                                        onRefetch();
                                      } catch (err) {
                                        toast.error("Failed to remove table.");
                                      } finally {
                                        setProcessingTables(prev => ({ ...prev, [b.reference]: false }));
                                      }
                                    }}
                                    className="text-slate-400 hover:text-slate-600 focus:outline-none disabled:opacity-40"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Allocation dropdown with loading indicators */}
                          <div className="flex items-center gap-2">
                            {isProcessing ? (
                              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Syncing...</span>
                              </div>
                            ) : (
                              <select
                                disabled={disabled || isProcessing || availableTables.length === 0}
                                value=""
                                onChange={async (e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  setProcessingTables(prev => ({ ...prev, [b.reference]: true }));
                                  const tObj = tables.find((t) => t.id === val);
                                  try {
                                    await assignTable(val, b.id, token);
                                    toast.success(`Assigned Table ${tObj?.table_number}`);
                                    onRefetch();
                                  } catch (err) {
                                    toast.error("Failed to allocate table.");
                                  } finally {
                                    setProcessingTables(prev => ({ ...prev, [b.reference]: false }));
                                  }
                                }}
                                className="px-2 py-1 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold bg-white cursor-pointer w-full"
                              >
                                <option value="">+ Allocate Table</option>
                                {availableTables.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    Table {t.table_number} ({t.capacity} seats)
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>

                        {b.table_request && (
                          <div className="text-[10px] text-amber-700 mt-1 italic leading-tight">
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
                            onClick={() => handleMainCheckIn(b, "checked_in")}
                            disabled={disabled}
                            className={`p-1.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              currentStatus === "checked_in"
                                ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                                : "bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={disabled ? "Sailing checklist is closed" : "Mark Group Checked In"}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleMainCheckIn(b, "pending")}
                            disabled={disabled}
                            className={`p-1.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              currentStatus === "pending"
                                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                                : "bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-amber-50"
                            }`}
                            title={disabled ? "Sailing checklist is closed" : "Mark Group Pending"}
                          >
                            <Clock className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleMainCheckIn(b, "no_show")}
                            disabled={disabled}
                            className={`p-1.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              currentStatus === "no_show"
                                ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                                : "bg-white text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-rose-50"
                            }`}
                            title={disabled ? "Sailing checklist is closed" : "Mark Group No Show"}
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable guest checks roster */}
                    {isExpanded && (
                      <tr className="bg-slate-50/45">
                        <td colSpan={7} className="px-6 py-4 pl-12 border-b border-slate-200">
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                                Granular Food Plate Attendance
                              </h4>
                            </div>
                            
                            {!b.booking_guests || b.booking_guests.length === 0 ? (
                              <div className="text-xs italic text-slate-400">
                                No guest roster details recorded. All bookings require guest records to track food preparation.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {b.booking_guests.map((g) => {
                                  const isGuestLoading = !!processingGuests[g.id];

                                  return (
                                    <div 
                                      key={g.id} 
                                      className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-xs transition-all hover:border-slate-300"
                                    >
                                      <div className="space-y-0.5">
                                        <div className="text-xs font-extrabold text-slate-800">
                                          {g.first_name} {g.last_name}
                                          {g.is_primary && (
                                            <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold uppercase ml-1.5">
                                              Primary
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                          {g.email || g.phone || "No contact info"}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        <button
                                          disabled={disabled || isGuestLoading}
                                          onClick={async () => {
                                            setProcessingGuests(prev => ({ ...prev, [g.id]: true }));
                                            try {
                                              await updateBookingGuest(g.id, { status: "checked_in" }, token);
                                              toast.success(`${g.first_name} marked checked in`);
                                              onRefetch();
                                            } catch (err) {
                                              toast.error("Failed to update guest check-in.");
                                            } finally {
                                              setProcessingGuests(prev => ({ ...prev, [g.id]: false }));
                                            }
                                          }}
                                          className={`p-1.5 rounded-lg border transition-all ${
                                            g.status === "checked_in"
                                              ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                                              : "bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:bg-emerald-50"
                                          }`}
                                          title="Checked In (Plate Served)"
                                        >
                                          {isGuestLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <UserCheck className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                        <button
                                          disabled={disabled || isGuestLoading}
                                          onClick={async () => {
                                            setProcessingGuests(prev => ({ ...prev, [g.id]: true }));
                                            try {
                                              await updateBookingGuest(g.id, { status: "no_show" }, token);
                                              toast.success(`${g.first_name} marked no-show`);
                                              onRefetch();
                                            } catch (err) {
                                              toast.error("Failed to update guest check-in.");
                                            } finally {
                                              setProcessingGuests(prev => ({ ...prev, [g.id]: false }));
                                            }
                                          }}
                                          className={`p-1.5 rounded-lg border transition-all ${
                                            g.status === "no_show"
                                              ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                                              : "bg-white text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-rose-50"
                                          }`}
                                          title="No Show (Plate Saved)"
                                        >
                                          {isGuestLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <UserX className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                        <button
                                          disabled={disabled || isGuestLoading}
                                          onClick={async () => {
                                            setProcessingGuests(prev => ({ ...prev, [g.id]: true }));
                                            try {
                                              await updateBookingGuest(g.id, { status: "pending" }, token);
                                              toast.success(`${g.first_name} reset to pending`);
                                              onRefetch();
                                            } catch (err) {
                                              toast.error("Failed to reset guest check-in.");
                                            } finally {
                                              setProcessingGuests(prev => ({ ...prev, [g.id]: false }));
                                            }
                                          }}
                                          className={`p-1.5 rounded-lg border transition-all ${
                                            g.status === "pending" || !g.status
                                              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                                              : "bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-amber-50"
                                          }`}
                                          title="Pending"
                                        >
                                          {isGuestLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Clock className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
