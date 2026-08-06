"use client";

import React, { useState } from "react";
import { apiActions as axios } from "@/tools/axios";
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  Ticket 
} from "lucide-react";
import toast from "react-hot-toast";

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

interface SupervisorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleData;
  manifestToken: string;
  onSuccess: () => void;
}

export function SupervisorBookingModal({
  isOpen,
  onClose,
  schedule,
  manifestToken,
  onSuccess
}: SupervisorBookingModalProps) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  
  const [adultCount, setAdultCount] = useState("2");
  const [childCount, setChildCount] = useState("0");
  
  const [customAdultPrice, setCustomAdultPrice] = useState("");
  const [customChildPrice, setCustomChildPrice] = useState("");
  
  const [cancellationPreference, setCancellationPreference] = useState<"reschedule" | "refund" | "confirmed">("confirmed");
  const [tableRequest, setTableRequest] = useState("");
  const [tableAllocation, setTableAllocation] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  
  const [paymentState, setPaymentState] = useState<"unpaid" | "cash" | "mpesa" | "visa" | "mastercard" | "staff_card" | "agent_credit" | "waived">("cash");
  const [transactionRef, setTransactionRef] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);

  // Pricing math helper values
  const baseAdultPrice = schedule.price_per_person;
  const baseChildPrice = schedule.price_per_child;
  
  const effectiveAdultPrice = customAdultPrice ? parseFloat(customAdultPrice) || 0 : baseAdultPrice;
  const effectiveChildPrice = customChildPrice ? parseFloat(customChildPrice) || 0 : baseChildPrice;

  const adults = parseInt(adultCount, 10) || 1;
  const children = parseInt(childCount, 10) || 0;
  
  const ticketSubtotal = (adults * effectiveAdultPrice) + (children * effectiveChildPrice);
  const finalTotal = ticketSubtotal; // No discounts supported on quick supervisor check-in

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return toast.error("Please enter guest name.");
    
    setIsSaving(true);
    const toastId = toast.loading("Registering guest booking...");
    
    try {
      // 1. Create walk-in booking unauthenticated via manifest token query param
      const bookingRes = await axios.post(
        `/api/v1/bookings/?token=${encodeURIComponent(manifestToken)}`,
        {
          schedule: schedule.id,
          party_size: adults + children,
          adult_count: adults,
          child_count: children,
          booking_type: "walk_in",
          cancellation_preference: cancellationPreference,
          table_request: tableRequest.trim() || undefined,
          table_allocation: tableAllocation.trim() || undefined,
          special_requests: specialRequests.trim() || undefined,
          status: paymentState === "unpaid" ? "pending" : "confirmed",
          primary_guest_name: guestName.trim(),
          primary_guest_email: guestEmail.trim() || undefined,
          primary_guest_phone: guestPhone.trim() || undefined,
          custom_price_per_person: customAdultPrice ? parseFloat(customAdultPrice) : undefined,
          custom_price_per_child: customChildPrice ? parseFloat(customChildPrice) : undefined,
        }
      );

      const booking = bookingRes.data;

      // 2. Create payment record if paid
      if (paymentState !== "unpaid") {
        await axios.post(
          `/api/v1/payments/?token=${encodeURIComponent(manifestToken)}`,
          {
            booking: booking.id,
            amount: finalTotal,
            payment_method: paymentState,
            transaction_ref: transactionRef.trim() || undefined,
            status: "completed",
          }
        );
      }

      toast.success(`Booking ${booking.reference} registered successfully!`, { id: toastId });
      onSuccess();
      onClose();
      
      // Reset form states
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setAdultCount("2");
      setChildCount("0");
      setCustomAdultPrice("");
      setCustomChildPrice("");
      setCancellationPreference("confirmed");
      setTableRequest("");
      setTableAllocation("");
      setSpecialRequests("");
      setPaymentState("cash");
      setTransactionRef("");
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 
                     (err.response?.data ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(", ") : "") ||
                     err.message || 
                     "Failed to complete reservation.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-slate-100 animate-scaleUp relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pier Side Walk-In Registration</h2>
            <p className="text-xs text-slate-500 font-medium">Quick boarding gate bookings on {schedule.dhow_name} ({schedule.meal_type_display})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Guest Details */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" /> Guest Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
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
                  <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Counts and Custom prices */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">Reservation & Pricing overrides</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adults Count</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      disabled={isSaving}
                      value={adultCount}
                      onChange={(e) => setAdultCount(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Children Count</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      disabled={isSaving}
                      value={childCount}
                      onChange={(e) => setChildCount(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Custom Adult Price (KES)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={isSaving}
                      placeholder={`Standard: KES ${baseAdultPrice.toLocaleString()}`}
                      value={customAdultPrice}
                      onChange={(e) => setCustomAdultPrice(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-amber-50/20 border-amber-200/60 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Custom Kid Price (KES)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={isSaving}
                      placeholder={`Standard: KES ${baseChildPrice.toLocaleString()}`}
                      value={customChildPrice}
                      onChange={(e) => setCustomChildPrice(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-amber-50/20 border-amber-200/60 font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing Math Box */}
              <div className="bg-amber-50/55 border border-amber-200/50 rounded-2xl p-4.5 text-xs text-amber-900 font-semibold space-y-2">
                <div className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Pricing Math Summary</div>
                <div className="flex justify-between">
                  <span>{adults} Adults x KES {effectiveAdultPrice.toLocaleString()} + {children} Kids x KES {effectiveChildPrice.toLocaleString()}</span>
                  <span>KES {ticketSubtotal.toLocaleString()}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 pt-2 border-t border-amber-200/40 flex justify-between">
                  <span>Final Total Cost:</span>
                  <span>KES {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">Payment Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Select Payment Method</label>
                    <select
                      value={paymentState}
                      disabled={isSaving}
                      onChange={(e) => setPaymentState(e.target.value as any)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 font-semibold text-slate-800"
                    >
                      <option value="cash">Paid — Cash</option>
                      <option value="mpesa">Paid — M-Pesa</option>
                      <option value="visa">Paid — Visa</option>
                      <option value="mastercard">Paid — Mastercard</option>
                      <option value="staff_card">Staff Card</option>
                      <option value="agent_credit">Agent Credit</option>
                      <option value="waived">Waived</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>

                  {paymentState !== "unpaid" && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Ref / Code</label>
                      <input
                        type="text"
                        disabled={isSaving}
                        placeholder="e.g. QX12345678"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 uppercase font-semibold text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Seating and Cancellation Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seating Request (Optional)</label>
                  <input
                    type="text"
                    disabled={isSaving}
                    placeholder="e.g. Deck seat, Table 4"
                    value={tableRequest}
                    onChange={(e) => setTableRequest(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Preference</label>
                  <select
                    value={cancellationPreference}
                    disabled={isSaving}
                    onChange={(e) => setCancellationPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  >
                    <option value="confirmed">Confirmed (Sailing Guaranteed)</option>
                    <option value="refund">Refund Money</option>
                    <option value="reschedule">Reschedule Date</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Allocated Table (Optional)</label>
                  <input
                    type="text"
                    disabled={isSaving}
                    placeholder="e.g. Table 5, T10"
                    value={tableAllocation}
                    onChange={(e) => setTableAllocation(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-amber-50/10 border-amber-200/50 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div className="pt-4 border-t border-slate-100 space-y-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special requests / dietary needs (Optional)</label>
                <textarea
                  disabled={isSaving}
                  placeholder="e.g. Vegetarian diet, birthday celebration setup..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500/20 h-16 bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/60 text-white font-bold text-base rounded-xl transition-all shadow-md shadow-amber-600/10 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" style={{ borderRadius: "50%" }} />
                Registering Booking...
              </>
            ) : (
              "Confirm & Register Boarding Walk-In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
