"use client";

import React, { useState, useEffect } from "react";
import { Booking } from "@/types/booking";
import { updateBooking } from "@/services/bookings";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface BookingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  token: string;
  onSuccess: () => void;
}

export const BookingEditModal: React.FC<BookingEditModalProps> = ({
  isOpen,
  onClose,
  booking,
  token,
  onSuccess,
}) => {
  const [adultCount, setAdultCount] = useState(booking.adult_count || 1);
  const [childCount, setChildCount] = useState(booking.child_count || 0);
  const [customPriceAdult, setCustomPriceAdult] = useState(
    booking.custom_price_per_person ? String(booking.custom_price_per_person) : ""
  );
  const [customPriceChild, setCustomPriceChild] = useState(
    booking.custom_price_per_child ? String(booking.custom_price_per_child) : ""
  );
  const [discountType, setDiscountType] = useState<"amount" | "percentage">(
    (booking.discount_type as "amount" | "percentage") || "amount"
  );
  const [discountValue, setDiscountValue] = useState(String(booking.discount_value || 0));
  const [discountReason, setDiscountReason] = useState(booking.discount_reason || "");
  const [specialRequests, setSpecialRequests] = useState(booking.special_requests || "");
  const [internalNotes, setInternalNotes] = useState(booking.internal_notes || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Reset values when booking changes or modal opens
    setAdultCount(booking.adult_count || 1);
    setChildCount(booking.child_count || 0);
    setCustomPriceAdult(
      booking.custom_price_per_person ? String(booking.custom_price_per_person) : ""
    );
    setCustomPriceChild(
      booking.custom_price_per_child ? String(booking.custom_price_per_child) : ""
    );
    setDiscountType((booking.discount_type as "amount" | "percentage") || "amount");
    setDiscountValue(String(booking.discount_value || 0));
    setDiscountReason(booking.discount_reason || "");
    setSpecialRequests(booking.special_requests || "");
    setInternalNotes(booking.internal_notes || "");
  }, [booking, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adultCount < 1) {
      toast.error("At least 1 adult is required.");
      return;
    }

    setIsSaving(true);
    const updatedData: Partial<Booking> = {
      party_size: adultCount + childCount,
      adult_count: adultCount,
      child_count: childCount,
      custom_price_per_person: customPriceAdult ? Number(customPriceAdult) : null,
      custom_price_per_child: customPriceChild ? Number(customPriceChild) : null,
      discount_type: discountType,
      discount_value: Number(discountValue) || 0,
      discount_reason: discountReason || null,
      special_requests: specialRequests || null,
      internal_notes: internalNotes || null,
    };

    try {
      await updateBooking(booking.reference, updatedData, token);
      toast.success("Booking modified successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || "Failed to update booking.";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Modify Booking Details
            </h3>
            <p className="text-[11px] font-mono text-slate-500 font-bold mt-0.5">
              Ref: {booking.reference}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Guest Party Size */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Party Sizes & Seat Allocations
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Adults (18+ yrs)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adultCount}
                  onChange={(e) => setAdultCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Children (0-17 yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={childCount}
                  onChange={(e) => setChildCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing Overrides */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Pricing Overrides (Optional)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Adult Price Override
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPriceAdult}
                  onChange={(e) => setCustomPriceAdult(e.target.value)}
                  placeholder="Leave blank for standard"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Child Price Override
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPriceChild}
                  onChange={(e) => setCustomPriceChild(e.target.value)}
                  placeholder="Leave blank for standard"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Discounts */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Discounts & Price Deductions
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "amount" | "percentage")}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="amount">KES Flat Amount</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Discount Reason
              </label>
              <input
                type="text"
                placeholder="e.g. Corporate partner discount"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Notes & Special Requests */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Dietary & Special Requests
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Gluten-free, birthday cake request..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Internal Management Notes
              </label>
              <textarea
                rows={2}
                placeholder="Agent notes, billing notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 bg-white sticky bottom-0 z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-xs font-bold disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white transition-all rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Modifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
