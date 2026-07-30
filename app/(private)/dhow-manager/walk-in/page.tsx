"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { cancelBooking, updateBooking } from "@/services/bookings";
import { useFetchSchedules } from "@/hooks/vessels/actions";
import { useSession } from "next-auth/react";
import { 
  UserPlus, 
  Calendar, 
  ShieldCheck, 
  XCircle, 
  Users, 
  Receipt, 
  RefreshCw, 
  X, 
  CalendarDays,
  MenuSquare,
  Loader2,
  Edit,
  RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";
import { SkeletonCard } from "@/components/common/Skeleton";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { createRefund, getPayments } from "@/services/payments";
import { Payment } from "@/types/payment";
import { Booking } from "@/types/booking";

export default function WalkInBookingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Modals state
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [selectedNewScheduleId, setSelectedNewScheduleId] = useState("");
  const [isSavingReschedule, setIsSavingReschedule] = useState(false);
  const [cancelTargetRef, setCancelTargetRef] = useState<string | null>(null);
  const [isCancellingRef, setIsCancellingRef] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"active" | "past">("active");


  // Refund states
  const [refundTarget, setRefundTarget] = useState<Booking | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("other");
  const [refundNotes, setRefundNotes] = useState("");
  const [isSavingRefund, setIsSavingRefund] = useState(false);
  const [refundPayments, setRefundPayments] = useState<Payment[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Load completed payments when refund target is selected
  React.useEffect(() => {
    if (!refundTarget) {
      setRefundPayments([]);
      setSelectedPaymentId("");
      return;
    }

    setLoadingPayments(true);
    getPayments({ Authorization: `Token ${token}` }, { booking: refundTarget.id, status: "completed" })
      .then((res) => {
        const payments = res.results || [];
        setRefundPayments(payments);
        if (payments.length > 0) {
          setSelectedPaymentId(payments[0].id);
          setRefundAmount(payments[0].amount.toString());
        } else {
          toast.error("No completed payment records found for this booking.");
        }
      })
      .catch(() => {
        toast.error("Failed to retrieve booking payment logs.");
      })
      .finally(() => {
        setLoadingPayments(false);
      });
  }, [refundTarget, token]);

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget || !selectedPaymentId) {
      toast.error("Please select a transaction to refund.");
      return;
    }

    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid refund amount.");
      return;
    }

    const matchedPayment = refundPayments.find(p => p.id === selectedPaymentId);
    if (matchedPayment && amt > parseFloat(matchedPayment.amount.toString())) {
      toast.error(`Refund amount cannot exceed the transaction amount (KES ${parseFloat(matchedPayment.amount.toString()).toLocaleString()}).`);
      return;
    }

    setIsSavingRefund(true);
    try {
      await createRefund({
        payment: selectedPaymentId,
        booking: refundTarget.id,
        amount: amt,
        reason: refundReason,
        notes: refundNotes
      }, token);

      toast.success("Refund request submitted successfully!");
      setRefundTarget(null);
      refetchWalkIns();
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || "Failed to process refund request.";
      toast.error(errMsg);
    } finally {
      setIsSavingRefund(false);
    }
  };



  // Query Hooks
  const { data: walkInsData, refetch: refetchWalkIns, isLoading: loadingWalkins } = useFetchBookings({
    booking_type: "walk_in",
  });
  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules({ is_open: true });

  const walkIns = walkInsData?.results || [];
  const openSchedules = schedulesData?.results || [];

  const todayStr = new Date().toISOString().split("T")[0];
  const activeWalkIns = walkIns.filter(
    (b) => b.status !== "cancelled" && b.status !== "completed" && b.schedule_date && b.schedule_date >= todayStr
  );
  const pastWalkIns = walkIns.filter(
    (b) => b.status === "cancelled" || b.status === "completed" || !b.schedule_date || b.schedule_date < todayStr
  );

  const displayedWalkIns = filterMode === "active" ? activeWalkIns : pastWalkIns;

  const handleCancelBooking = async (reference: string) => {
    setIsCancellingRef(reference);
    try {
      await cancelBooking(reference, token);
      toast.success("Booking cancelled successfully.");
      refetchWalkIns();
    } catch (err) {
      toast.error("Failed to cancel booking.");
    } finally {
      setIsCancellingRef(null);
      setCancelTargetRef(null);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || !selectedNewScheduleId) {
      toast.error("Please select a new voyage.");
      return;
    }
    setIsSavingReschedule(true);
    try {
      await updateBooking(rescheduleTarget.reference, { schedule: selectedNewScheduleId }, token);
      toast.success(`Booking ${rescheduleTarget.reference} successfully rescheduled!`);
      setRescheduleTarget(null);
      setSelectedNewScheduleId("");
      refetchWalkIns();
    } catch (err) {
      toast.error("Failed to reschedule booking.");
    } finally {
      setIsSavingReschedule(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-amber-600" /> Walk-In Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register guests, groups, or charter bookings directly. Walk-in payments bypass digital escrows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchWalkIns()}
            className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push("/dhow-manager/walk-in/create")}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-amber-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <UserPlus className="w-4 h-4" />
            Register Walk-In
          </button>

        </div>
      </div>

      {/* Main Spacious List Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            Walk-In Guest Log
          </h3>
          
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200 w-fit">
            <button
              onClick={() => setFilterMode("active")}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                filterMode === "active" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Active Voyages ({activeWalkIns.length})
            </button>
            <button
              onClick={() => setFilterMode("past")}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                filterMode === "past" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Previous & History ({pastWalkIns.length})
            </button>
          </div>
        </div>
        
        {loadingWalkins ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3.5 shadow-sm animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl w-full" />
            ))}
          </div>
        ) : displayedWalkIns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-400 font-medium shadow-sm">
            {filterMode === "active" 
              ? "No active walk-ins found. Click 'Register Walk-In' to create one."
              : "No past or cancelled walk-ins found."}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Guest & Reference</th>
                    <th className="px-6 py-4">Sailing Date</th>
                    <th className="px-6 py-4">Guests Count</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/60">
                  {displayedWalkIns.map((booking) => {
                    const active = booking.status !== "cancelled" && booking.status !== "completed";
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 leading-tight">
                            {booking.booked_by_name || "Walk-In Guest"}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            Ref: {booking.reference}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-1">
                            {booking.package_name || "Standard Menu"}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {booking.schedule_date || "Sailing Day"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {booking.party_size} Guests
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            ({booking.adult_count || booking.party_size} Adults, {booking.child_count || 0} Kids)
                          </div>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-850">
                          KES {parseFloat((booking.total_amount || 0).toString()).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                              booking.status === "confirmed" || booking.status === "completed"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                                : booking.status === "cancelled"
                                ? "bg-red-50 text-red-800 border border-red-100"
                                : "bg-amber-50 text-amber-800 border border-amber-100"
                            }`}
                          >
                            {booking.status_display || booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {active && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => router.push(`/dhow-manager/walk-in/${booking.reference}/edit`)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"

                                title="Edit Booking Details"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                                Edit
                              </button>
                              <button
                                onClick={() => setRescheduleTarget(booking)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                                title="Reschedule Guest Voyage"
                              >
                                <CalendarDays className="w-3.5 h-3.5" />
                                Reschedule
                              </button>
                              <button
                                disabled={isCancellingRef === booking.reference}
                                onClick={() => setCancelTargetRef(booking.reference)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100 disabled:opacity-50"
                                title="Cancel Booking"
                              >
                                {isCancellingRef === booking.reference ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>

                              {/* Manual Request Refund */}
                              {parseFloat((booking.total_paid || 0).toString()) > 0 && (
                                <button
                                  onClick={() => {
                                    setRefundTarget(booking);
                                    setRefundAmount((booking.total_paid || 0).toString());
                                    setRefundNotes("");
                                  }}

                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                                  title="Request Manual Refund"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                                  Refund
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>



      {/* MODAL 2: Reschedule Booking Voyage */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 border border-slate-100 animate-slideUp relative">
            <button
              onClick={() => {
                setRescheduleTarget(null);
                setSelectedNewScheduleId("");
              }}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CalendarDays className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-800">Reschedule Guest Voyage</h2>
            </div>

            <div className="space-y-4 py-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-1.5">
                <div className="text-xs text-slate-400 uppercase font-bold">Guest Details</div>
                <div className="font-bold text-slate-800 text-sm">{rescheduleTarget.booked_by_name || "Walk-In Guest"}</div>
                <div className="text-xs text-slate-500 font-medium">Current sailing: <span className="font-semibold text-slate-700">{rescheduleTarget.schedule_date} ({rescheduleTarget.schedule_meal_type || "Voyage"})</span></div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Select Alternative Sailing Voyage</label>
                <select
                  disabled={isSavingReschedule || loadingSchedules}
                  value={selectedNewScheduleId}
                  onChange={(e) => setSelectedNewScheduleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                >
                  <option value="">-- Choose Upcoming open Trip --</option>
                  {loadingSchedules ? (
                    <option>Loading voyages...</option>
                  ) : openSchedules.length === 0 ? (
                    <option>No upcoming open sailings scheduled</option>
                  ) : (
                    openSchedules
                      .filter(s => s.id !== rescheduleTarget.schedule)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.date} - {s.dhow_name} ({s.meal_type_display}) [{s.available_capacity} seats available]
                        </option>
                      ))
                  )}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSavingReschedule}
                onClick={() => {
                  setRescheduleTarget(null);
                  setSelectedNewScheduleId("");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors border border-slate-300 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingReschedule || !selectedNewScheduleId}
                onClick={handleConfirmReschedule}
                className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingReschedule ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" style={{ borderRadius: "50%" }} />
                    Updating...
                  </>
                ) : (
                  "Confirm Reschedule"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={cancelTargetRef !== null}
        title="Cancel Walk-In Booking"
        message={`Are you sure you want to cancel booking ${cancelTargetRef}? This action will permanently release table allocations.`}
        confirmText="Cancel Booking"
        cancelText="Go Back"
        type="danger"
        isLoading={isCancellingRef !== null && isCancellingRef === cancelTargetRef}
        onConfirm={() => {
          if (cancelTargetRef) handleCancelBooking(cancelTargetRef);
        }}
        onCancel={() => setCancelTargetRef(null)}
      />

      {/* MODAL 3: Manual Refund Request Form */}
      {refundTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 relative animate-scaleIn">
            <button
              onClick={() => setRefundTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-lg">
              Manual Refund Request
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Request a refund for walk-in reservation <span className="font-mono font-bold text-slate-700">{refundTarget.reference}</span>.
            </p>

            {loadingPayments ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                <span className="text-xs text-slate-400 font-semibold">Loading payment transactions...</span>
              </div>
            ) : refundPayments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                No completed payments found on this booking to refund.
              </div>
            ) : (
              <form onSubmit={handleRequestRefund} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Payment Transaction
                  </label>
                  <select
                    value={selectedPaymentId}
                    onChange={(e) => {
                      setSelectedPaymentId(e.target.value);
                      const payment = refundPayments.find(p => p.id === e.target.value);
                      if (payment) setRefundAmount(payment.amount.toString());
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold bg-white"
                  >
                    {refundPayments.map(p => (
                      <option key={p.id} value={p.id}>
                        Ref: {p.reference} (KES {parseFloat(p.amount.toString()).toLocaleString()} - {p.payment_method.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Refund Amount (KES)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold bg-white"
                  >
                    <option value="sailing_cancelled">Sailing Cancelled</option>
                    <option value="weather">Bad Weather</option>
                    <option value="other">Other Reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Explanatory Notes
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide refund explanation..."
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRefundTarget(null)}
                    disabled={isSavingRefund}
                    className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-xs font-bold disabled:opacity-60"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRefund}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white transition-all rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingRefund ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Refund Request"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

