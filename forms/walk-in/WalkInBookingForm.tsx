"use client";

import React, { useState, useEffect } from "react";
import { createBooking } from "@/services/bookings";
import { createPayment } from "@/services/payments";
import { useFetchSchedules, useFetchPackages } from "@/hooks/vessels/actions";
import { UserPlus, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

interface WalkInBookingFormProps {
  token: string;
  onSuccess: () => void;
}

export default function WalkInBookingForm({ token, onSuccess }: WalkInBookingFormProps) {
  // Query Hooks
  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules({ is_open: true });
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
  const [isSaving, setIsSaving] = useState(false);

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
    
    setIsSaving(true);
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

      // 2. Record Payment if paid (Walk-in payments bypass escrow)
      if (paymentState !== "unpaid") {
        await createPayment(
          {
            booking: booking.id,
            amount: booking.total_amount || 5500,
            payment_method: paymentState === "cash" ? "cash" : paymentState === "card" ? "card" : "mpesa",
            status: "completed",
            phone_number: guestPhone || undefined,
            notes: `Walk-in payment collected by manager via ${paymentState.toUpperCase()}`,
          },
          token
        );
      }

      toast.success(`Walk-in booking ${booking.reference} registered successfully!`);
      // Reset form states
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setPartySize("2");
      setTableRequest("");
      setSpecialRequests("");
      setPaymentState("cash");
      onSuccess();
    } catch (err: any) {
      toast.error("Failed to create walk-in booking.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Schedule & Package Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Sailing Schedule</label>
          <select
            value={selectedScheduleId}
            disabled={isSaving || loadingSchedules}
            onChange={(e) => setSelectedScheduleId(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
          >
            {loadingSchedules ? (
              <option>Loading active voyages...</option>
            ) : schedules.length === 0 ? (
              <option>No active voyages scheduled</option>
            ) : (
              schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.dhow_name} - {s.date} ({s.meal_type_display}) [{s.available_capacity} seats left]
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Dining Package</label>
          <select
            value={selectedPackageId}
            disabled={isSaving}
            onChange={(e) => setSelectedPackageId(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
          >
            {packages.length === 0 ? (
              <option>No dining packages available</option>
            ) : (
              packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (KES {parseFloat(p.base_price.toString()).toLocaleString()})
                </option>
              ))
            )}
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
              required
              disabled={isSaving}
              placeholder="e.g. John Doe"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email (Optional)</label>
            <input
              type="email"
              disabled={isSaving}
              placeholder="guest@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              disabled={isSaving}
              placeholder="e.g. 0712345678"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
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
              disabled={isSaving}
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Cancellation Preference (If Sailing Cancelled)</label>
            <select
              value={cancellationPreference}
              disabled={isSaving}
              onChange={(e) => setCancellationPreference(e.target.value as any)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            >
              <option value="refund">Refund Money</option>
              <option value="reschedule">Reschedule Date</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Seating Request (Optional)</label>
            <input
              type="text"
              disabled={isSaving}
              placeholder="e.g. Deck seat, Window table"
              value={tableRequest}
              onChange={(e) => setTableRequest(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Special Dietary / Voyage Requests (Optional)</label>
          <textarea
            disabled={isSaving}
            placeholder="e.g. Vegetarian diet, birthday celebration cakes..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 h-16 disabled:opacity-60"
          />
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
            <button
              type="button"
              key={p.id}
              disabled={isSaving}
              onClick={() => setPaymentState(p.id as any)}
              className={`p-3 rounded-lg border text-center transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                paymentState === p.id
                  ? "bg-amber-600 text-white border-amber-700 shadow-sm font-semibold"
                  : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
              }`}
            >
              <div className="text-xs font-bold">{p.label}</div>
              <div className={`text-[10px] ${paymentState === p.id ? "text-amber-100" : "text-slate-400"}`}>
                {p.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/60 text-white font-bold text-base rounded-xl transition-all shadow-md shadow-amber-600/10 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
            Saving booking...
          </>
        ) : (
          "Confirm & Save Walk-In Booking"
        )}
      </button>
    </form>
  );
}
