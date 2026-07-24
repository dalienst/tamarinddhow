"use client";

import React from "react";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { cancelBooking } from "@/services/bookings";
import { useSession } from "next-auth/react";
import { UserPlus, Calendar, ShieldCheck, XCircle, Users, Receipt, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import WalkInBookingForm from "@/forms/walk-in/WalkInBookingForm";

export default function WalkInBookingPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hook
  const { data: walkInsData, refetch: refetchWalkIns, isLoading: loadingWalkins } = useFetchBookings({
    booking_type: "walk_in",
  });

  const walkIns = walkInsData?.results || [];

  const handleCancelBooking = async (reference: string) => {
    if (!confirm(`Are you sure you want to cancel booking ${reference}?`)) return;
    try {
      await cancelBooking(reference, token);
      toast.success("Booking cancelled successfully.");
      refetchWalkIns();
    } catch (err) {
      toast.error("Failed to cancel booking.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-amber-600" /> Walk-In Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register single guests, groups, or exclusive charter bookings directly. Walk-in payments bypass digital escrows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Walk-in Form - Left/Span 2 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Reservation Entry Form</h3>
            <WalkInBookingForm token={token} onSuccess={refetchWalkIns} />
          </div>
        </div>

        {/* Recent Walk-Ins List - Right/Span 1 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Recent Walk-ins</h3>
              <button 
                onClick={() => refetchWalkIns()}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                title="Refresh Listing"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingWalkins ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-medium">
                Loading walk-in history...
              </div>
            ) : walkIns.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-medium">
                No walk-ins registered yet.
              </div>
            ) : (
              <div className="space-y-4">
                {walkIns.slice(0, 8).map((booking) => (
                  <div 
                    key={booking.id} 
                    className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3 relative transition-all hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-extrabold text-sm text-slate-800 block leading-tight">
                          {booking.booked_by_name || "Walk-In Guest"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block uppercase">
                          Ref: {booking.reference}
                        </span>
                      </div>
                      
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelBooking(booking.reference)}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors absolute top-3 right-3"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.schedule_date || "Sailing Day"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.party_size} Guests</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span>KES {parseFloat((booking.total_amount || 0).toString()).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="capitalize">{booking.cancellation_preference} pref.</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-[10px]">
                      <span className="font-bold text-slate-400 block uppercase tracking-wider">
                        {booking.package_name || "Standard menu"}
                      </span>
                      <span 
                        className={`px-2 py-0.5 font-bold uppercase tracking-wider rounded-full ${
                          booking.status === "confirmed" || booking.status === "completed"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            : booking.status === "cancelled"
                            ? "bg-red-50 text-red-800 border border-red-100"
                            : "bg-amber-50 text-amber-800 border border-amber-100"
                        }`}
                      >
                        {booking.status_display || booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
