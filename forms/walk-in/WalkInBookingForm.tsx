"use client";

import React, { useState, useEffect } from "react";
import { createBooking } from "@/services/bookings";
import { createPayment } from "@/services/payments";
import { useFetchSchedules } from "@/hooks/vessels/actions";
import { UserPlus, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

interface WalkInBookingFormProps {
  token: string;
  onSuccess: () => void;
  initialScheduleId?: string;
}

export default function WalkInBookingForm({ token, onSuccess, initialScheduleId }: WalkInBookingFormProps) {
  // Query Hooks
  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules({ is_open: true });

  const schedules = schedulesData?.results || [];

  // Filter out past voyages from selection
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingSchedules = schedules.filter((s) => s.date >= todayStr);

  // Form State
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [adultCount, setAdultCount] = useState("2");
  const [childCount, setChildCount] = useState("0");
  const [cancellationPreference, setCancellationPreference] = useState<"reschedule" | "refund">("refund");
  const [tableRequest, setTableRequest] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentState, setPaymentState] = useState<"unpaid" | "cash" | "mpesa" | "agent_credit" | "waived">("cash");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [discountReason, setDiscountReason] = useState("");
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialPaidAmount, setPartialPaidAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialScheduleId) {
      setSelectedScheduleId(initialScheduleId);
    } else if (upcomingSchedules.length > 0 && !selectedScheduleId) {
      setSelectedScheduleId(upcomingSchedules[0].id);
    }
  }, [upcomingSchedules, selectedScheduleId, initialScheduleId]);

  // Compute pricing dynamically
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const adultPrice = selectedSchedule ? parseFloat(selectedSchedule.price_per_person.toString()) : 0;
  const childPrice = selectedSchedule ? parseFloat((selectedSchedule.price_per_child || 0).toString()) : 0;
  const adults = parseInt(adultCount, 10) || 1;
  const children = parseInt(childCount, 10) || 0;
  const totalCalculated = (adults * adultPrice) + (children * childPrice);
  const discount = parseFloat(discountAmount) || 0;
  const finalTotal = Math.max(0, totalCalculated - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) return toast.error("Please select an open schedule.");
    if (!guestName) return toast.error("Please enter guest name.");
    
    setIsSaving(true);
    try {
      // 1. Create Booking with primary guest details inline and discount info
      const booking = await createBooking(
        {
          schedule: selectedScheduleId,
          party_size: adults + children,
          adult_count: adults,
          child_count: children,
          booking_type: "walk_in",
          cancellation_preference: cancellationPreference,
          table_request: tableRequest || undefined,
          special_requests: specialRequests || undefined,
          status: paymentState === "unpaid" ? "pending" : "confirmed",
          primary_guest_name: guestName,
          primary_guest_email: guestEmail || undefined,
          primary_guest_phone: guestPhone || undefined,
          discount_amount: discount,
          discount_reason: discountReason || undefined,
        },
        token
      );

      // 2. Record Payment if paid (Walk-in payments bypass escrow)
      if (paymentState !== "unpaid") {
        const payAmount = isPartialPayment ? (parseFloat(partialPaidAmount) || 0) : finalTotal;
        await createPayment(
          {
            booking: booking.id,
            amount: payAmount,
            payment_method: paymentState,
            status: "completed",
            phone_number: guestPhone || undefined,
            notes: isPartialPayment 
              ? `Walk-in partial deposit collected by manager via ${paymentState.toUpperCase()}. Remaining balance: KES ${(finalTotal - payAmount).toLocaleString()}`
              : `Walk-in payment collected by manager via ${paymentState.toUpperCase()}`,
          },
          token
        );
      }

      toast.success(`Walk-in booking ${booking.reference} registered successfully!`);
      // Reset form states
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setAdultCount("2");
      setChildCount("0");
      setTableRequest("");
      setSpecialRequests("");
      setDiscountAmount("0");
      setDiscountReason("");
      setIsPartialPayment(false);
      setPartialPaidAmount("");
      setPaymentState("cash");
      onSuccess();
    } catch (err: any) {
      console.error("Booking error details:", err.response?.data);
      const errMsg = err.response?.data?.non_field_errors?.[0] || 
                     (err.response?.data ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(", ") : "") ||
                     err.message || 
                     "Failed to create walk-in booking.";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Schedule Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Select Sailing Schedule</label>
        <select
          value={selectedScheduleId}
          disabled={isSaving || loadingSchedules}
          onChange={(e) => setSelectedScheduleId(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 font-semibold text-slate-800"
        >
          {loadingSchedules ? (
             <option>Loading active voyages...</option>
          ) : upcomingSchedules.length === 0 ? (
             <option>No active voyages scheduled</option>
          ) : (
             upcomingSchedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.dhow_name} - {s.date} ({s.meal_type_display}) [{s.available_capacity} seats left]
              </option>
            ))
          )}
        </select>
      </div>

      {/* Guest Contact Details */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">Guest Contact Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Adults Count</label>
            <input
              type="number"
              min="1"
              max="50"
              disabled={isSaving}
              value={adultCount}
              onChange={(e) => setAdultCount(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Children Count (Kid Pricing Applies)</label>
            <input
              type="number"
              min="0"
              max="50"
              disabled={isSaving}
              value={childCount}
              onChange={(e) => setChildCount(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            />
          </div>

          <div className="sm:col-span-2 bg-amber-50/55 border border-amber-200/50 rounded-xl p-3 text-xs text-amber-900 font-semibold space-y-1">
            <div className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Pricing Math Summary</div>
            <div className="flex justify-between">
              <span>{adults} Adults x KES {adultPrice.toLocaleString()} + {children} Children x KES {childPrice.toLocaleString()}</span>
              <span>KES {totalCalculated.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>Discount applied</span>
                <span>- KES {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="text-sm font-bold text-slate-900 mt-1 pt-1 border-t border-amber-200/40 flex justify-between">
              <span>Final Total Cost:</span>
              <span>KES {finalTotal.toLocaleString()}</span>
            </div>
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

        {/* Discounts & Partial Payments */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Discounts & Partial Payments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Discount Amount (KES)</label>
              <input
                type="number"
                min="0"
                disabled={isSaving}
                placeholder="e.g. 1000"
                value={discountAmount}
                onChange={(e) => {
                  setDiscountAmount(e.target.value);
                  setIsPartialPayment(false);
                  setPartialPaidAmount("");
                }}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Discount Reason</label>
              <input
                type="text"
                disabled={isSaving}
                placeholder="e.g. Manager approval, VIP guest"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-white"
              />
            </div>

            {paymentState !== "unpaid" && (
              <div className="sm:col-span-2 space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isSaving}
                    checked={isPartialPayment}
                    onChange={(e) => {
                      setIsPartialPayment(e.target.checked);
                      if (e.target.checked && !partialPaidAmount) {
                        setPartialPaidAmount(Math.floor(finalTotal / 2).toString());
                      }
                    }}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  This is a partial payment (Guest will pay a deposit)
                </label>

                {isPartialPayment && (
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount Paid Today (KES)</label>
                    <input
                      type="number"
                      min="1"
                      max={finalTotal}
                      disabled={isSaving}
                      value={partialPaidAmount}
                      onChange={(e) => setPartialPaidAmount(e.target.value)}
                      className="w-full sm:w-48 px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-white"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Remaining unpaid balance of KES {Math.max(0, finalTotal - (parseFloat(partialPaidAmount) || 0)).toLocaleString()} will be due later.
                    </div>
                  </div>
                )}
              </div>
            )}
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: "cash", label: "Paid — Cash", desc: "Cash collected" },
            { id: "mpesa", label: "Paid — M-Pesa", desc: "M-Pesa verified" },
            { id: "agent_credit", label: "Agent Credit", desc: "Voucher / Invoice" },
            { id: "waived", label: "Waived", desc: "Complimentary" },
            { id: "unpaid", label: "Unpaid", desc: "Pay on arrival" },
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
