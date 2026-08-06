"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getPublicManifest } from "@/services/vessels";
import { updateBookingGuest, cancelBooking, noShowBooking } from "@/services/bookings";
import { Ship, Download, Search, Copy, Check, Clock, AlertTriangle, RefreshCw, UserX, XCircle, Loader2, Pencil, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { SupervisorBookingModal } from "@/components/dhow-manager/SupervisorBookingModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

interface ManifestGuest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_primary: boolean;
  status: string;
}

interface ManifestBooking {
  id: string;
  reference: string;
  booked_by_name: string;
  party_size: number;
  adult_count: number;
  child_count: number;
  table_number: string;
  table_allocation?: string | null;
  special_requests: string;
  status: string;
  booking_guests: ManifestGuest[];
  booking_addons?: { addon_name: string; quantity: number; total_price: number }[];
  total_amount?: string | number;
  total_paid?: string | number;
  outstanding_balance?: string | number;
  discount_amount?: string | number;
  payments?: { amount: number; payment_method: string; ref: string }[];
}

interface ScheduleData {
  id: string;
  reference: string;
  dhow_name: string;
  date: string;
  meal_type_display: string;
  departure_time: string;
  return_time: string;
  price_per_person: number;
  price_per_child: number;
  status: string;
}

interface PublicManifestResponse {
  schedule: ScheduleData;
  manifest: ManifestBooking[];
}

export default function PublicManifestPage() {
  const { ref } = useParams() as { ref: string };
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = !!session?.user;
  const canModify = isAuthenticated || !!token;

  const [data, setData] = useState<PublicManifestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  
  // Guest editing state
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  
  // Supervisor walk-in booking state
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Cancellation modal state
  const [cancelTargetBooking, setCancelTargetBooking] = useState<ManifestBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);


  // Local state to keep track of checked-in guests at the dock
  const [boardedGuests, setBoardedGuests] = useState<Record<string, boolean>>({});
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyManifestData = useCallback((res: PublicManifestResponse, isInitial = false) => {
    setData(res);
    // Only reset boardedGuests on initial load to avoid losing local state mid-session
    if (isInitial) {
      const initialBoarded: Record<string, boolean> = {};
      res.manifest.forEach((b: ManifestBooking) => {
        b.booking_guests.forEach((g) => {
          if (g.status === "checked_in" || b.status === "completed") {
            initialBoarded[g.id] = true;
          }
        });
      });
      setBoardedGuests(initialBoarded);
    }
  }, []);

  const fetchManifest = useCallback(async (isInitial = false, showLoader = false) => {
    if (!ref) return;
    if (sessionStatus === "loading") return;
    if (showLoader) setSyncing(true);
    try {
      const res = await getPublicManifest(ref, token, session?.user?.token);
      applyManifestData(res, isInitial);
      setError("");
    } catch (err) {
      if (isInitial) {
        setError("Failed to load sailing manifest. The access token may be invalid.");
      }
    } finally {
      if (isInitial) setLoading(false);
      if (showLoader) setSyncing(false);
    }
  }, [ref, token, session?.user?.token, sessionStatus, applyManifestData]);

  // Initial fetch + 10-second auto-polling
  useEffect(() => {
    if (sessionStatus === "loading") return;
    fetchManifest(true);
    pollingRef.current = setInterval(() => fetchManifest(false), 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchManifest, sessionStatus]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Manifest sharing link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBoarding = async (guestId: string) => {
    const isBoarded = !!boardedGuests[guestId];
    const newStatus = isBoarded ? "pending" : "checked_in";

    // Optimistic UI update
    setBoardedGuests((prev) => ({
      ...prev,
      [guestId]: !isBoarded,
    }));

    const activeToken = session?.user?.token || token;
    const isManifest = !session?.user?.token;

    try {
      await updateBookingGuest(guestId, { status: newStatus }, activeToken, isManifest);
      toast.success(isBoarded ? "Marked as absent" : "Checked in passenger successfully!");
    } catch (err) {
      // Revert optimistic update on failure
      setBoardedGuests((prev) => ({
        ...prev,
        [guestId]: isBoarded,
      }));
      toast.error("Failed to update passenger status.");
    }
  };

  const handleNoShow = async (booking: ManifestBooking) => {
    if (booking.status === "no_show") return;
    setActionLoading((prev) => ({ ...prev, [`noshow-${booking.reference}`]: true }));
    const activeToken = session?.user?.token || token;
    const isManifest = !session?.user?.token;
    try {
      await noShowBooking(booking.reference, activeToken, isManifest);
      toast.success(`Booking ${booking.reference} marked as No Show`);
      fetchManifest(false, false);
    } catch (err) {
      toast.error("Failed to mark booking as No Show.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`noshow-${booking.reference}`]: false }));
    }
  };

  const executeCancel = async () => {
    if (!cancelTargetBooking) return;
    setIsCancelling(true);
    const activeToken = session?.user?.token || token;
    const isManifest = !session?.user?.token;
    try {
      await cancelBooking(cancelTargetBooking.reference, activeToken, isManifest);
      toast.success(`Booking ${cancelTargetBooking.reference} cancelled`);
      setCancelTargetBooking(null);
      fetchManifest(false, false);
    } catch (err) {
      toast.error("Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredManifest = useMemo(() => {
    if (!data) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return data.manifest;

    return data.manifest.filter((b) => {
      const matchBooker = b.booked_by_name.toLowerCase().includes(query);
      const matchRef = b.reference.toLowerCase().includes(query);
      const matchTable = b.table_number.toLowerCase().includes(query);
      const matchGuests = b.booking_guests.some(
        (g) =>
          g.first_name.toLowerCase().includes(query) ||
          g.last_name.toLowerCase().includes(query)
      );
      return matchBooker || matchRef || matchTable || matchGuests;
    });
  }, [data, searchQuery]);

  const stats = useMemo(() => {
    if (!data) return { totalGuests: 0, checkedIn: 0 };
    let total = 0;
    data.manifest.forEach((b) => {
      total += b.party_size;
    });
    const checked = Object.values(boardedGuests).filter(Boolean).length;
    return {
      totalGuests: total,
      checkedIn: checked,
    };
  }, [data, boardedGuests]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderRadius: "50%" }} />
          <p className="text-sm font-semibold text-slate-500">Loading daily manifest...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-lg text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Manifest Error</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error || "Could not retrieve manifest."}</p>
        </div>
      </div>
    );
  }

  const { schedule } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Regular Header Panel */}
        <div className="no-print bg-gradient-to-r from-amber-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
            <Ship className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                  Crew Access Link
                </span>
                <h1 className="text-2xl font-black tracking-tight mt-1">{schedule.dhow_name} Passenger List</h1>
                <p className="text-xs text-amber-200/80 font-medium">
                  {schedule.date} • {schedule.meal_type_display} ({schedule.departure_time.substring(0, 5)} - {schedule.return_time.substring(0, 5)})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAuthenticated && (
                  <button
                    onClick={() => setIsWalkInModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 border border-emerald-500/25"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register Walk-In
                  </button>
                )}

                {/* Manual Sync Button */}
                <button
                  onClick={() => fetchManifest(false, true)}
                  disabled={syncing}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync List"}
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Share Link
                </button>
                <button
                  onClick={async () => {
                    const loadingToast = toast.loading("Generating PDF manifest...");
                    try {
                      // Call the Next.js proxy route — token is passed as query param for unauthenticated access
                      const proxyUrl = token
                        ? `/api/manifest/${ref}/pdf?token=${encodeURIComponent(token)}`
                        : `/api/manifest/${ref}/pdf`;
                      const response = await fetch(proxyUrl);
                      if (!response.ok) throw new Error("Failed to download PDF");

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `sailing-manifest-${ref}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);

                      toast.success("PDF manifest downloaded successfully!", { id: loadingToast });
                    } catch (err) {
                      toast.error("Failed to generate PDF manifest.", { id: loadingToast });
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs">
              <div>
                <span className="block text-amber-300 font-semibold uppercase tracking-wider text-[10px]">Total Booked</span>
                <span className="text-lg font-black">{stats.totalGuests} Passengers</span>
              </div>
              <div>
                <span className="block text-amber-300 font-semibold uppercase tracking-wider text-[10px]">Boarding Status</span>
                <span className="text-lg font-black">{stats.checkedIn} / {stats.totalGuests} Boarded</span>
              </div>
              <div>
                <span className="block text-amber-300 font-semibold uppercase tracking-wider text-[10px]">Vessel Status</span>
                <span className="text-lg font-black uppercase">{schedule.status}</span>
              </div>
              <div>
                <span className="block text-amber-300 font-semibold uppercase tracking-wider text-[10px]">Auto-Sync</span>
                <span className="text-lg font-black">Every 10s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Searching & Filters */}
        <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by passenger name, booking reference or table seating..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-800 text-sm font-medium focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Boarding List Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden manifest-card">

          {/* Interactive Screen View */}
          <div className="no-print divide-y divide-slate-100">
            {filteredManifest.map((b) => {
              const isCancelled = b.status === "cancelled";
              const isNoShow = b.status === "no_show";
              const isCompleted = b.status === "completed";
              const noShowLoading = !!actionLoading[`noshow-${b.reference}`];
              const cancelLoading = !!actionLoading[`cancel-${b.reference}`];

              return (
                <div
                  key={b.id}
                  className={`p-6 transition-colors space-y-4 ${isCancelled ? "opacity-50 bg-rose-50/30" : "hover:bg-slate-50/50"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {b.reference}
                        </span>
                        {b.table_number && (
                          <span className="font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                            Table {b.table_number}
                          </span>
                        )}
                        {/* Booking status badge */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : isNoShow
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isCancelled
                            ? "bg-slate-100 text-slate-500 border-slate-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          {b.status === "no_show" ? "No Show" : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mt-1">{b.booked_by_name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Party of {b.party_size} ({b.adult_count} Adults, {b.child_count} Kids)
                      </p>
                      {/* Payment Details */}
                      <div className="text-[11px] text-slate-500 font-medium space-y-1 mt-2.5 bg-slate-50 border border-slate-100 p-3 rounded-2xl max-w-sm">
                        <div className="flex justify-between items-center">
                          <span>Total Expected:</span>
                          <span className="font-bold text-slate-800">KES {parseFloat((b.total_amount || 0).toString()).toLocaleString()}</span>
                        </div>
                        {parseFloat((b.total_paid || 0).toString()) > 0 && (
                          <div className="flex justify-between items-center text-emerald-700">
                            <span>Total Paid:</span>
                            <span className="font-extrabold">KES {parseFloat((b.total_paid || 0).toString()).toLocaleString()}</span>
                          </div>
                        )}
                        {parseFloat((b.outstanding_balance || 0).toString()) > 0 && (
                          <div className="flex justify-between items-center text-amber-700 font-bold">
                            <span>Outstanding Balance:</span>
                            <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-100">KES {parseFloat((b.outstanding_balance || 0).toString()).toLocaleString()}</span>
                          </div>
                        )}
                        {parseFloat((b.discount_amount || 0).toString()) > 0 && (
                          <div className="flex justify-between items-center text-rose-600">
                            <span>Discount Given:</span>
                            <span>-KES {parseFloat((b.discount_amount || 0).toString()).toLocaleString()}</span>
                          </div>
                        )}
                        {b.payments && b.payments.length > 0 && (
                          <div className="border-t border-slate-200/60 pt-1.5 mt-1.5 space-y-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Completed Transactions:</span>
                            {b.payments.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[10px] text-slate-600 bg-white border border-slate-100 px-2 py-1 rounded-lg">
                                <span>{p.payment_method}</span>
                                <span className="font-mono font-bold text-slate-700">{p.ref} (KES {p.amount.toLocaleString()})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* No Show & Cancel Actions */}
                    {canModify && !isCancelled && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleNoShow(b)}
                          disabled={isNoShow || noShowLoading || isCancelled}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all disabled:cursor-not-allowed ${
                            isNoShow
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50 disabled:opacity-50"
                          }`}
                          title="Mark entire booking as No Show"
                        >
                          {noShowLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                          No Show
                        </button>
                        <button
                          onClick={() => setCancelTargetBooking(b)}
                          disabled={isCancelling || isCancelled}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Cancel this booking"
                        >
                          {isCancelling && cancelTargetBooking?.id === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {(b.special_requests || (b.booking_addons && b.booking_addons.length > 0)) && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl max-w-sm text-xs font-semibold space-y-1.5">
                      {b.special_requests && (
                        <div>Dietaries / Requests: {b.special_requests}</div>
                      )}
                      {b.booking_addons && b.booking_addons.length > 0 && (
                        <div>
                          <span className="text-[10px] text-amber-800 uppercase font-bold block mb-0.5">Custom Add-Ons:</span>
                          <ul className="list-disc pl-4 space-y-0.5 font-medium text-amber-950">
                            {b.booking_addons.map((ba, idx) => (
                              <li key={idx}>
                                {ba.addon_name} (x{ba.quantity})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Granular passenger checklists */}
                  {!isCancelled && (
                    <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Passenger Boarding Checklist
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {b.booking_guests.map((g) => {
                          const isBoarded = !!boardedGuests[g.id];
                          const isEditing = editingGuestId === g.id;

                          return (
                            <div
                              key={g.id}
                              onClick={() => {
                                if (canModify && !isEditing) handleToggleBoarding(g.id);
                              }}
                              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all group relative ${
                                isEditing ? "bg-white border-amber-300 ring-2 ring-amber-500/10 cursor-default" :
                                isBoarded
                                  ? `bg-emerald-50/60 border-emerald-200 text-emerald-950 font-bold ${canModify ? "cursor-pointer" : "cursor-default"}`
                                  : `bg-white border-slate-200 text-slate-700 font-semibold ${canModify ? "cursor-pointer" : "cursor-default"}`
                              }`}
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                {isEditing ? (
                                  <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-1.5">
                                      <input
                                        type="text"
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                        placeholder="First Name"
                                        className="w-1/2 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                                      />
                                      <input
                                        type="text"
                                        value={editLastName}
                                        onChange={(e) => setEditLastName(e.target.value)}
                                        placeholder="Last Name"
                                        className="w-1/2 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                                      />
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={async () => {
                                          if (!editFirstName.trim() || !editLastName.trim()) {
                                            toast.error("Names cannot be empty");
                                            return;
                                          }
                                          try {
                                            const activeToken = session?.user?.token || token;
                                            const isManifest = !session?.user?.token;
                                            await updateBookingGuest(g.id, { first_name: editFirstName.trim(), last_name: editLastName.trim() }, activeToken, isManifest);
                                            toast.success("Guest renamed successfully!");
                                            setEditingGuestId(null);
                                            fetchManifest(false, false);
                                          } catch (err) {
                                            toast.error("Failed to rename guest");
                                          }
                                        }}
                                        className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition-colors"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingGuestId(null)}
                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-xs truncate flex items-center gap-1.5">
                                      <span>{g.first_name} {g.last_name}</span>
                                      {canModify && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingGuestId(g.id);
                                            setEditFirstName(g.first_name);
                                            setEditLastName(g.last_name);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 transition-opacity focus:opacity-100"
                                          title="Rename passenger"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                    {g.is_primary && <div className="text-[8px] text-amber-700 uppercase tracking-wider">Primary</div>}
                                  </>
                                )}
                              </div>
                              
                              {!isEditing && (
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                    isBoarded 
                                      ? "bg-emerald-600 text-white" 
                                      : canModify 
                                        ? "bg-slate-100 text-transparent group-hover:bg-slate-200" 
                                        : "bg-slate-100 text-transparent"
                                  }`}>
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {filteredManifest.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <p className="text-sm text-slate-400 font-bold">No passengers found</p>
                <p className="text-xs text-slate-500">Try matching booking reference, guest names or tables.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SupervisorBookingModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        schedule={schedule}
        manifestToken={token}
        onSuccess={() => fetchManifest(false, true)}
      />

      <ConfirmationModal
        isOpen={cancelTargetBooking !== null}
        title="Cancel Booking"
        message={`Are you sure you want to cancel booking ${cancelTargetBooking?.reference} for ${cancelTargetBooking?.booked_by_name}? This action will permanently release table allocations.`}
        confirmText="Cancel Booking"
        cancelText="Go Back"
        type="danger"
        isLoading={isCancelling}
        onConfirm={executeCancel}
        onCancel={() => setCancelTargetBooking(null)}
      />
    </div>
  );
}
