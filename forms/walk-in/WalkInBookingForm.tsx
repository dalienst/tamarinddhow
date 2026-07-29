"use client";

import React, { useState, useEffect } from "react";
import { createBooking } from "@/services/bookings";
import { createPayment } from "@/services/payments";
import { useFetchSchedules, useFetchAddOns } from "@/hooks/vessels/actions";
import { UserPlus, DollarSign, Plus, Minus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

interface WalkInBookingFormProps {
  token: string;
  onSuccess: () => void;
  initialScheduleId?: string;
}

export default function WalkInBookingForm({ token, onSuccess, initialScheduleId }: WalkInBookingFormProps) {
  // Query Hooks
  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules({ is_open: true });
  const { data: addonsData, isLoading: loadingAddons } = useFetchAddOns();

  const schedules = schedulesData?.results || [];
  const addonsList = addonsData?.results || [];

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
  
  // Custom prices
  const [customAdultPrice, setCustomAdultPrice] = useState("");
  const [customChildPrice, setCustomChildPrice] = useState("");

  // Discount options
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount");
  const [discountValue, setDiscountValue] = useState("0");
  const [discountReason, setDiscountReason] = useState("");

  // Selected addons
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);

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
  const baseAdultPrice = selectedSchedule ? parseFloat(selectedSchedule.price_per_person.toString()) : 0;
  const baseChildPrice = selectedSchedule ? parseFloat((selectedSchedule.price_per_child || 0).toString()) : 0;

  const effectiveAdultPrice = customAdultPrice ? parseFloat(customAdultPrice) || 0 : baseAdultPrice;
  const effectiveChildPrice = customChildPrice ? parseFloat(customChildPrice) || 0 : baseChildPrice;

  const adults = parseInt(adultCount, 10) || 1;
  const children = parseInt(childCount, 10) || 0;
  
  const ticketSubtotal = (adults * effectiveAdultPrice) + (children * effectiveChildPrice);
  const addonsSubtotal = selectedAddons.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCalculated = ticketSubtotal + addonsSubtotal;

  const discount = discountType === "percentage"
    ? ticketSubtotal * ((parseFloat(discountValue) || 0) / 100)
    : parseFloat(discountValue) || 0;

  const finalTotal = Math.max(0, totalCalculated - discount);

  // Addon handlers
  const handleAddAddon = (addon: any) => {
    setSelectedAddons((prev) => {
      const existing = prev.find((item) => item.id === addon.id);
      if (existing) {
        return prev.map((item) =>
          item.id === addon.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: addon.id, name: addon.name, price: parseFloat(addon.price.toString()), quantity: 1 }];
    });
  };

  const handleRemoveAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const existing = prev.find((item) => item.id === addonId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === addonId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== addonId);
    });
  };

  const handleUpdateAddonPrice = (addonId: string, priceStr: string) => {
    setSelectedAddons((prev) =>
      prev.map((item) =>
        item.id === addonId ? { ...item, price: parseFloat(priceStr) || 0 } : item
      )
    );
  };

  const getAddonQuantity = (addonId: string) => {
    return selectedAddons.find((item) => item.id === addonId)?.quantity || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) return toast.error("Please select an open schedule.");
    if (!guestName) return toast.error("Please enter guest name.");
    if (parseFloat(discountValue) > 0 && !discountReason.trim()) {
      return toast.error("Please provide a reason for the discount.");
    }
    
    setIsSaving(true);
    try {
      // 1. Create Booking with primary guest details, custom price overrides, and addons list
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
          custom_price_per_person: customAdultPrice ? parseFloat(customAdultPrice) : undefined,
          custom_price_per_child: customChildPrice ? parseFloat(customChildPrice) : undefined,
          discount_type: discountType,
          discount_value: parseFloat(discountValue) || 0,
          discount_reason: discountReason || undefined,
          addons: selectedAddons.map((sa) => ({ addon: sa.id, quantity: sa.quantity, unit_price: sa.price })),
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
      setCustomAdultPrice("");
      setCustomChildPrice("");
      setTableRequest("");
      setSpecialRequests("");
      setDiscountType("amount");
      setDiscountValue("0");
      setDiscountReason("");
      setSelectedAddons([]);
      setIsPartialPayment(false);
      setPartialPaidAmount("");
      setPaymentState("cash");
      onSuccess();
    } catch (err: any) {
      console.error("Booking error details:", err.response?.data);
      const errMsg = err.response?.data?.detail ||
                     err.response?.data?.non_field_errors?.[0] || 
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
        <h3 className="font-bold text-slate-800 text-sm">Reservation & Pricing Customization</h3>
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
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 font-semibold"
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
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Custom Price per Adult (Override KES)</label>
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Custom Price per Kid (Override KES)</label>
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

          {/* Dynamic math details */}
          <div className="sm:col-span-2 bg-amber-50/55 border border-amber-200/50 rounded-xl p-4 text-xs text-amber-900 font-semibold space-y-2">
            <div className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Pricing Math Summary</div>
            <div className="flex justify-between">
              <span>{adults} Adults x KES {effectiveAdultPrice.toLocaleString()} + {children} Children x KES {effectiveChildPrice.toLocaleString()}</span>
              <span>KES {ticketSubtotal.toLocaleString()}</span>
            </div>
            
            {selectedAddons.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-amber-200/25">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Add-ons subtotal:</span>
                {selectedAddons.map((item) => (
                  <div key={item.id} className="flex justify-between font-medium text-slate-700">
                    <span>— {item.name} (x{item.quantity})</span>
                    <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-slate-800 text-[11px] pt-1">
                  <span>Add-ons Total</span>
                  <span>KES {addonsSubtotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-rose-700 pt-1 border-t border-amber-200/25">
                <span>Discount Applied ({discountType === "percentage" ? `${discountValue}%` : "Flat"})</span>
                <span>- KES {discount.toLocaleString()}</span>
              </div>
            )}

            <div className="text-sm font-bold text-slate-900 mt-1 pt-2 border-t border-amber-200/40 flex justify-between">
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
      </div>

      {/* Booking Addons Selector Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-800 text-sm">Custom Add-Ons (Cakes & Extras)</h3>
        </div>
        
        {loadingAddons ? (
          <div className="text-xs text-slate-400">Loading available addons...</div>
        ) : addonsList.length === 0 ? (
          <div className="text-xs text-slate-400 italic">No available addons registered in vessel management.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {addonsList.map((addon) => {
              const qty = getAddonQuantity(addon.id);
              return (
                <div key={addon.id} className={`p-3 border rounded-xl flex flex-col justify-between transition-all ${
                  qty > 0 ? "border-amber-400 bg-amber-50/10" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                }`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-slate-800 truncate">{addon.name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Standard: KES {parseFloat(addon.price.toString()).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {qty > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddon(addon.id)}
                            className="p-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-extrabold text-slate-800 w-4 text-center">{qty}</span>
                        </>
                      ) : null}
                      
                      <button
                        type="button"
                        onClick={() => handleAddAddon(addon)}
                        className="p-1 rounded-md bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 text-slate-600 flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {qty > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">Price (Override):</span>
                      <input
                        type="number"
                        min="0"
                        value={selectedAddons.find((item) => item.id === addon.id)?.price ?? ""}
                        onChange={(e) => handleUpdateAddonPrice(addon.id, e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500/20 bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Discounts & Partial Payments */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">Discounts & Partial Payments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Discount Option</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold w-fit bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setDiscountType("amount");
                  setDiscountValue("0");
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  discountType === "amount" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                }`}
              >
                Flat KES
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiscountType("percentage");
                  setDiscountValue("0");
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  discountType === "percentage" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                }`}
              >
                Percentage (%)
              </button>
            </div>
            
            <input
              type="number"
              min="0"
              max={discountType === "percentage" ? 100 : undefined}
              disabled={isSaving}
              placeholder={discountType === "percentage" ? "e.g. 10%" : "e.g. 1000 KES"}
              value={discountValue}
              onChange={(e) => {
                setDiscountValue(e.target.value);
                setIsPartialPayment(false);
                setPartialPaidAmount("");
              }}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-white font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Discount Reason (Required if Discount applied)</label>
            <input
              type="text"
              disabled={isSaving}
              required={parseFloat(discountValue) > 0}
              placeholder="e.g. Manager approval, group discount"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              className="w-full px-3.5 py-2 mt-[26px] border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-white"
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

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Special Dietary / Voyage Requests (Optional)</label>
          <textarea
            disabled={isSaving}
            placeholder="e.g. Vegetarian diet, birthday celebration setup..."
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
              onClick={() => {
                setPaymentState(p.id as any);
                if (p.id === "unpaid") {
                  setIsPartialPayment(false);
                  setPartialPaidAmount("");
                }
              }}
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
            <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" style={{ borderRadius: "50%" }} />
            Saving booking...
          </>
        ) : (
          "Confirm & Save Walk-In Booking"
        )}
      </button>
    </form>
  );
}
