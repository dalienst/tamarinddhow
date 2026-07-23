"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/services/bookings";
import { createPayment } from "@/services/payments";
import { useFetchSchedules, useFetchPackages } from "@/hooks/vessels/actions";
import { useSession } from "next-auth/react";
import { UserPlus, DollarSign, CheckCircle2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function WalkInBookingPage() {
  const router = useRouter();

  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedulesData } = useFetchSchedules({ is_open: true });
  const { data: packagesData } = useFetchPackages();

  const schedules = schedulesData?.results || [];
  const packages = packagesData?.results || [];

  // Form State
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [cancellationPreference, setCancellationPreference] = useState<"reschedule" | "refund">("refund");
  const [tableRequest, setTableRequest] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentState, setPaymentState] = useState<"unpaid" | "cash" | "card" | "mpesa">("cash");

  useEffect(() => {
    if (schedules.length > 0 && !selectedScheduleId) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  useEffect(() => {
    if (packages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packages[0].id);
    }
  }, [packages, selectedPackageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) return toast.error("Please select an open schedule.");
    if (!guestName) return toast.error("Please enter guest name.");

    try {
      // 1. Create Booking
      const booking = await createBooking(
        {
          schedule: selectedScheduleId,
          package: selectedPackageId || undefined,
          party_size: parseInt(partySize, 10),
          booking_type: "walk_in",
          cancellation_preference: cancellationPreference,
          table_request: tableRequest || undefined,
          special_requests: specialRequests || undefined,
          status: paymentState === "unpaid" ? "pending" : "confirmed",
        },
        token
      );

      // 2. Record Payment if paid
      if (paymentState !== "unpaid") {
        await createPayment(
          {
            booking: booking.id,
            amount: booking.total_amount || 5500,
            payment_method: paymentState === "cash" ? "cash" : paymentState === "card" ? "cash" : "mpesa",
            status: "completed",
            phone_number: guestPhone || undefined,
            notes: `Walk-in payment collected by manager via ${paymentState.toUpperCase()}`,
          },
          token
        );
      }

      toast.success(`Walk-in booking ${booking.reference} registered successfully!`);
      router.push("/dhow-manager/dashboard");
    } catch (err: any) {
      toast.error("Failed to create walk-in booking.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-amber-600" /> Walk-In & Phone Reservation Entry
        </h1>
        <p className="text-sm text-slate-500">
          Book walk-in guests or phone reservations with explicit payment collection states.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Schedule & Package Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Sailing Schedule</label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.dhow_name} - {s.date} ({s.meal_type_display}) [{s.available_capacity} seats left]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dining Package</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (KES {p.base_price})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guest Contact Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Guest Contact Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 0712345678"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Booking Details & Preferences */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Reservation Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Party Size (Number of Guests)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cancellation Preference (If Sailing Cancelled)</label>
              <select
                value={cancellationPreference}
                onChange={(e) => setCancellationPreference(e.target.value as any)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="refund">Refund Money</option>
                <option value="reschedule">Reschedule Date</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Seating Request (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Deck seat, Window table"
                value={tableRequest}
                onChange={(e) => setTableRequest(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* EXPLICIT PAYMENT STATES */}
        <div className="space-y-3 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border">
          <label className="block font-bold text-slate-800 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Explicit Payment State Selection
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "cash", label: "Paid — Cash", desc: "Cash collected" },
              { id: "card", label: "Paid — Card", desc: "POS card processed" },
              { id: "mpesa", label: "Paid — M-Pesa", desc: "M-Pesa code verified" },
              { id: "unpaid", label: "Unpaid", desc: "Pay on arrival / Pending" },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setPaymentState(p.id as any)}
                className={`cursor-pointer p-3 rounded-lg border text-center transition-all ${
                  paymentState === p.id
                    ? "bg-amber-600 text-white border-amber-700 shadow-sm font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                }`}
              >
                <div className="text-xs font-bold">{p.label}</div>
                <div className={`text-[10px] ${paymentState === p.id ? "text-amber-100" : "text-slate-400"}`}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-base rounded-xl transition-colors shadow-sm"
        >
          Confirm & Save Walk-In Booking
        </button>
      </form>
    </div>
  );
}
