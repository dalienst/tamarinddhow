"use client";

import React, { useState, useEffect } from "react";
import { createBookingBulk } from "@/services/bookings";
import { useFetchSchedules, useFetchAddOns } from "@/hooks/vessels/actions";
import { 
  Plus, 
  Trash2, 
  HelpCircle, 
  DollarSign, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Tag, 
  Sparkles, 
  Ticket
} from "lucide-react";
import toast from "react-hot-toast";

interface BulkWalkInBookingFormProps {
  token: string;
  onSuccess: () => void;
}

interface BulkBookingRow {
  scheduleId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  adultCount: string;
  childCount: string;
  customAdultPrice: string;
  customChildPrice: string;
  cancellationPreference: "reschedule" | "refund" | "confirmed";
  tableRequest: string;
  tableAllocation: string;
  specialRequests: string;
  discountType: "amount" | "percentage";
  discountValue: string;
  discountReason: string;
  paymentState: "unpaid" | "cash" | "mpesa" | "agent_credit" | "waived" | "staff_card" | "mastercard" | "visa";
  transactionRef: string;
  isPartialPayment: boolean;
  partialPaymentType: "amount" | "percentage";
  partialPaidAmount: string;
  selectedAddons: { id: string; name: string; price: number; quantity: number }[];
}

export default function BulkWalkInBookingForm({ token, onSuccess }: BulkWalkInBookingFormProps) {
  // Query Hooks
  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules({ is_open: true });
  const { data: addonsData } = useFetchAddOns();

  const schedules = schedulesData?.results || [];
  const addonsList = addonsData?.results || [];

  // Filter out past voyages from selection
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingSchedules = schedules.filter((s) => s.date >= todayStr);

  const defaultRow: BulkBookingRow = {
    scheduleId: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    adultCount: "2",
    childCount: "0",
    customAdultPrice: "",
    customChildPrice: "",
    cancellationPreference: "confirmed",
    tableRequest: "",
    tableAllocation: "",
    specialRequests: "",
    discountType: "amount",
    discountValue: "0",
    discountReason: "",
    paymentState: "cash",
    transactionRef: "",
    isPartialPayment: false,
    partialPaymentType: "amount",
    partialPaidAmount: "",
    selectedAddons: [],
  };

  const [rows, setRows] = useState<BulkBookingRow[]>([{ ...defaultRow }]);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(0); // First card expanded by default
  const [isSaving, setIsSaving] = useState(false);

  // Initialize first row schedule selection once schedules load
  useEffect(() => {
    if (upcomingSchedules.length > 0 && !rows[0].scheduleId) {
      setRows((prev) => {
        const copy = [...prev];
        copy[0].scheduleId = upcomingSchedules[0].id;
        return copy;
      });
    }
  }, [upcomingSchedules, rows]);

  const addRow = () => {
    const nextScheduleId = upcomingSchedules.length > 0 ? upcomingSchedules[0].id : "";
    setRows([
      ...rows,
      { ...defaultRow, scheduleId: nextScheduleId },
    ]);
    setExpandedRowIndex(rows.length); // Automatically expand the newly created row, collapse previous
  };

  const removeRow = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling accordion when clicking delete
    if (rows.length === 1) {
      toast.error("You must register at least one booking.");
      return;
    }
    const filteredRows = rows.filter((_, idx) => idx !== index);
    setRows(filteredRows);
    if (expandedRowIndex === index) {
      setExpandedRowIndex(Math.max(0, index - 1));
    } else if (expandedRowIndex !== null && expandedRowIndex > index) {
      setExpandedRowIndex(expandedRowIndex - 1);
    }
  };

  const updateRow = <K extends keyof BulkBookingRow>(index: number, field: K, value: BulkBookingRow[K]) => {
    setRows((prev) =>
      prev.map((row, idx) => {
        if (idx === index) {
          const updatedRow = { ...row, [field]: value };
          // If payment status becomes unpaid, turn off partial payments and trans ref
          if (field === "paymentState" && value === "unpaid") {
            updatedRow.isPartialPayment = false;
            updatedRow.partialPaymentType = "amount";
            updatedRow.partialPaidAmount = "";
            updatedRow.transactionRef = "";
          }
          if (field === "discountType") {
            updatedRow.discountValue = "0";
          }
          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleAddAddon = (rowIndex: number, addon: any) => {
    setRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== rowIndex) return row;
        const selected = [...row.selectedAddons];
        const existing = selected.find((item) => item.id === addon.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          selected.push({ id: addon.id, name: addon.name, price: parseFloat(addon.price.toString()), quantity: 1 });
        }
        return { ...row, selectedAddons: selected };
      })
    );
  };

  const handleRemoveAddon = (rowIndex: number, addonId: string) => {
    setRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== rowIndex) return row;
        let selected = [...row.selectedAddons];
        const existing = selected.find((item) => item.id === addonId);
        if (existing && existing.quantity > 1) {
          existing.quantity -= 1;
        } else {
          selected = selected.filter((item) => item.id !== addonId);
        }
        return { ...row, selectedAddons: selected };
      })
    );
  };

  const handleUpdateAddonPrice = (rowIndex: number, addonId: string, priceStr: string) => {
    setRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== rowIndex) return row;
        const selected = row.selectedAddons.map((item) =>
          item.id === addonId ? { ...item, price: parseFloat(priceStr) || 0 } : item
        );
        return { ...row, selectedAddons: selected };
      })
    );
  };

  // Helper pricing calculators for aggregate panel
  const getRowPricing = (row: BulkBookingRow) => {
    const s = schedules.find((sched) => sched.id === row.scheduleId);
    const baseAdultPrice = s ? parseFloat(s.price_per_person.toString()) : 0;
    const baseChildPrice = s ? parseFloat((s.price_per_child || 0).toString()) : 0;
    
    const effectiveAdultPrice = row.customAdultPrice ? parseFloat(row.customAdultPrice) || 0 : baseAdultPrice;
    const effectiveChildPrice = row.customChildPrice ? parseFloat(row.customChildPrice) || 0 : baseChildPrice;

    const adults = parseInt(row.adultCount, 10) || 1;
    const children = parseInt(row.childCount, 10) || 0;
    
    const ticketSubtotal = (adults * effectiveAdultPrice) + (children * effectiveChildPrice);
    
    const addonsSubtotal = row.selectedAddons.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const totalCalculated = ticketSubtotal + addonsSubtotal;
    
    let discount = 0;
    const discountVal = parseFloat(row.discountValue) || 0;
    if (discountVal > 0) {
      if (row.discountType === "percentage") {
        discount = (totalCalculated * discountVal) / 100;
      } else {
        discount = discountVal;
      }
    }
    
    const finalTotal = Math.max(0, totalCalculated - discount);
    
    let paidAmount = finalTotal;
    if (row.paymentState === "unpaid") {
      paidAmount = 0;
    } else if (row.isPartialPayment) {
      const partialVal = parseFloat(row.partialPaidAmount) || 0;
      if (row.partialPaymentType === "percentage") {
        paidAmount = (finalTotal * partialVal) / 100;
      } else {
        paidAmount = partialVal;
      }
    }
    
    // Ensure paidAmount doesn't exceed finalTotal
    paidAmount = Math.min(paidAmount, finalTotal);
    const unpaidBalance = Math.max(0, finalTotal - paidAmount);
    return { ticketSubtotal, addonsSubtotal, totalCalculated, discount, finalTotal, paidAmount, unpaidBalance, baseAdultPrice, baseChildPrice };
  };

  const summary = rows.reduce(
    (sum, row) => {
      const p = getRowPricing(row);
      return {
        totalPax: sum.totalPax + (parseInt(row.adultCount, 10) || 1) + (parseInt(row.childCount, 10) || 0),
        totalGross: sum.totalGross + p.totalCalculated,
        totalDiscounts: sum.totalDiscounts + p.discount,
        totalFinal: sum.totalFinal + p.finalTotal,
        totalPaid: sum.totalPaid + p.paidAmount,
        totalReceivable: sum.totalReceivable + p.unpaidBalance,
      };
    },
    { totalPax: 0, totalGross: 0, totalDiscounts: 0, totalFinal: 0, totalPaid: 0, totalReceivable: 0 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.scheduleId) {
        toast.error(`Please select a voyage for booking #${i + 1}.`);
        return;
      }
      if (!row.guestName.trim()) {
        toast.error(`Please enter Guest Name for booking #${i + 1}.`);
        return;
      }
      const pricing = getRowPricing(row);
      if (pricing.discount > 0 && !row.discountReason.trim()) {
        toast.error(`Please enter a discount reason for booking #${i + 1}.`);
        return;
      }
      if (row.paymentState !== "unpaid" && row.isPartialPayment) {
        const depositVal = parseFloat(row.partialPaidAmount) || 0;
        if (row.partialPaymentType === "percentage" && (depositVal <= 0 || depositVal > 100)) {
          toast.error(`Booking #${i + 1}: Deposit percentage must be between 1% and 100%.`);
          return;
        }
        if (row.partialPaymentType === "amount" && (depositVal <= 0 || depositVal > pricing.finalTotal)) {
          toast.error(`Booking #${i + 1}: Deposit amount must be greater than 0 and less than final total KES ${pricing.finalTotal.toLocaleString()}.`);
          return;
        }
      }
    }

    setIsSaving(true);
    const toastId = toast.loading("Processing batch bookings registration...");
    try {
      const payload = rows.map((row) => {
        const pricing = getRowPricing(row);
        return {
          schedule: row.scheduleId,
          party_size: (parseInt(row.adultCount, 10) || 1) + (parseInt(row.childCount, 10) || 0),
          adult_count: parseInt(row.adultCount, 10) || 1,
          child_count: parseInt(row.childCount, 10) || 0,
          booking_type: "walk_in",
          cancellation_preference: row.cancellationPreference,
          table_request: row.tableRequest.trim() || undefined,
          table_allocation: row.tableAllocation.trim() || undefined,
          special_requests: row.specialRequests.trim() || undefined,
          status: (row.paymentState === "unpaid" || row.isPartialPayment) ? "pending" : "confirmed",
          primary_guest_name: row.guestName.trim(),
          primary_guest_email: row.guestEmail.trim() || undefined,
          primary_guest_phone: row.guestPhone.trim() || undefined,
          custom_price_per_person: row.customAdultPrice ? parseFloat(row.customAdultPrice) : undefined,
          custom_price_per_child: row.customChildPrice ? parseFloat(row.customChildPrice) : undefined,
          discount_type: row.discountType,
          discount_amount: pricing.discount,
          discount_value: parseFloat(row.discountValue) || 0,
          discount_reason: row.discountReason.trim() || undefined,
          payment_method: row.paymentState,
          transaction_ref: row.transactionRef.trim() || undefined,
          is_partial_payment: row.isPartialPayment,
          partial_paid_amount: pricing.paidAmount,
          addons: row.selectedAddons.map((sa) => ({ addon: sa.id, quantity: sa.quantity, unit_price: sa.price })),
        };
      });

      await createBookingBulk(payload, token);
      toast.success(`Successfully registered ${rows.length} walk-in bookings!`, { id: toastId });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.message || "Failed to process bulk bookings.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case "unpaid":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "waived":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "cash": return "Cash";
      case "mpesa": return "M-Pesa";
      case "visa": return "Visa";
      case "mastercard": return "Mastercard";
      case "staff_card": return "Staff Card";
      case "agent_credit": return "Agent Credit";
      case "waived": return "Waived";
      case "unpaid": return "Unpaid";
      default: return method;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Accordion List */}
      <div className="space-y-4">
        {rows.map((row, index) => {
          const isExpanded = expandedRowIndex === index;
          const pricing = getRowPricing(row);
          const nameDisplay = row.guestName.trim() || `Guest Booking #${index + 1}`;
          
          const sched = schedules.find((s) => s.id === row.scheduleId);
          const voyageDisplay = sched 
            ? `${sched.dhow_name} — ${sched.date} (${sched.meal_type_display})`
            : "No voyage selected";

          const totalPax = (parseInt(row.adultCount, 10) || 1) + (parseInt(row.childCount, 10) || 0);

          return (
            <div 
              key={index} 
              className={`bg-white border rounded-2xl transition-all shadow-sm overflow-hidden ${
                isExpanded ? "border-amber-400 ring-1 ring-amber-400/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Accordion Header */}
              <div 
                onClick={() => setExpandedRowIndex(isExpanded ? null : index)}
                className={`px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition-colors border-b ${
                  isExpanded ? "border-amber-100 bg-amber-50/10" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    isExpanded ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm truncate">{nameDisplay}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                        {totalPax} Pax
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPaymentBadge(row.paymentState)}`}>
                        {getPaymentLabel(row.paymentState)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      {voyageDisplay} • KES {pricing.finalTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    type="button"
                    disabled={isSaving || rows.length === 1}
                    onClick={(e) => removeRow(index, e)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Remove Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="p-6 sm:p-8 space-y-6 divide-y divide-slate-100 animate-fadeIn">
                  
                  {/* 1. Sailing Voyage Selection */}
                  <div className="pb-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Sailing Schedule</label>
                    <select
                      value={row.scheduleId}
                      disabled={isSaving || loadingSchedules}
                      onChange={(e) => updateRow(index, "scheduleId", e.target.value)}
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

                  {/* 2. Guest Details */}
                  <div className="space-y-4 pt-6 pb-6">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" /> Guest Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          disabled={isSaving}
                          placeholder="e.g. John Doe"
                          value={row.guestName}
                          onChange={(e) => updateRow(index, "guestName", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email (Optional)</label>
                        <input
                          type="email"
                          disabled={isSaving}
                          placeholder="guest@example.com"
                          value={row.guestEmail}
                          onChange={(e) => updateRow(index, "guestEmail", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          disabled={isSaving}
                          placeholder="e.g. 0712345678"
                          value={row.guestPhone}
                          onChange={(e) => updateRow(index, "guestPhone", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Reservation & Pricing Override */}
                  <div className="space-y-4 pt-6 pb-6">
                    <h3 className="font-bold text-slate-800 text-sm">Reservation & Pricing Customization</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Adults Count</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          disabled={isSaving}
                          value={row.adultCount}
                          onChange={(e) => updateRow(index, "adultCount", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Children Count (Kid Pricing)</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          disabled={isSaving}
                          value={row.childCount}
                          onChange={(e) => updateRow(index, "childCount", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Custom Price per Adult (Override KES)</label>
                        <input
                          type="number"
                          min="0"
                          disabled={isSaving}
                          placeholder={`Standard: KES ${pricing.baseAdultPrice.toLocaleString()}`}
                          value={row.customAdultPrice}
                          onChange={(e) => updateRow(index, "customAdultPrice", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-amber-50/20 border-amber-200/60 font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Custom Price per Kid (Override KES)</label>
                        <input
                          type="number"
                          min="0"
                          disabled={isSaving}
                          placeholder={`Standard: KES ${pricing.baseChildPrice.toLocaleString()}`}
                          value={row.customChildPrice}
                          onChange={(e) => updateRow(index, "customChildPrice", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-amber-50/20 border-amber-200/60 font-semibold text-slate-800"
                        />
                      </div>

                      {/* Pricing math details */}
                      <div className="sm:col-span-2 bg-amber-50/55 border border-amber-200/50 rounded-xl p-4 text-xs text-amber-900 font-semibold space-y-2">
                        <div className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Pricing Math Summary</div>
                        <div className="flex justify-between">
                          <span>{row.adultCount} Adults x KES {pricing.baseAdultPrice.toLocaleString()} + {row.childCount} Children x KES {pricing.baseChildPrice.toLocaleString()}</span>
                          <span>KES {pricing.ticketSubtotal.toLocaleString()}</span>
                        </div>
                        {row.selectedAddons.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-amber-200/25">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block">Add-ons subtotal:</span>
                            {row.selectedAddons.map((item) => (
                              <div key={item.id} className="flex justify-between font-medium text-slate-700 font-semibold">
                                <span>— {item.name} (x{item.quantity})</span>
                                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold text-slate-800 text-[10px] pt-1">
                              <span>Add-ons Total</span>
                              <span>KES {pricing.addonsSubtotal.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                        {pricing.discount > 0 && (
                          <div className="flex justify-between text-rose-700 pt-1 border-t border-amber-200/25">
                            <span>Discount ({row.discountType === "percentage" ? `${row.discountValue}%` : "Flat"})</span>
                            <span>- KES {pricing.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="text-sm font-bold text-slate-900 mt-1 pt-2 border-t border-amber-200/40 flex justify-between">
                          <span>Final Total Cost:</span>
                          <span>KES {pricing.finalTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Cancellation & Seating Request */}
                  <div className="space-y-4 pt-6 pb-6">
                    <h3 className="font-bold text-slate-800 text-sm">Booking Preferences</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Cancellation Preference</label>
                        <select
                          value={row.cancellationPreference}
                          disabled={isSaving}
                          onChange={(e) => updateRow(index, "cancellationPreference", e.target.value as any)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 text-slate-800 font-semibold"
                        >
                          <option value="confirmed">Confirmed (Sailing Guaranteed)</option>
                          <option value="refund">Refund Money</option>
                          <option value="reschedule">Reschedule Date</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Seating Request (Optional)</label>
                        <input
                          type="text"
                          disabled={isSaving}
                          placeholder="e.g. Deck seat, window table"
                          value={row.tableRequest}
                          onChange={(e) => updateRow(index, "tableRequest", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Allocated Table (Optional)</label>
                        <input
                          type="text"
                          disabled={isSaving}
                          placeholder="e.g. Table 5, T10"
                          value={row.tableAllocation}
                          onChange={(e) => updateRow(index, "tableAllocation", e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-amber-50/10 border-amber-200/50 font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Custom Add-ons */}
                  <div className="space-y-4 pt-6 pb-6">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-slate-800 text-sm">Custom Add-Ons (Cakes & Extras)</h3>
                    </div>
                    {addonsList.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">No available addons registered in vessel management.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {addonsList.map((addon) => {
                          const item = row.selectedAddons.find((a) => a.id === addon.id);
                          const qty = item?.quantity || 0;
                          return (
                            <div 
                              key={addon.id} 
                              className={`p-3 border rounded-xl flex flex-col justify-between transition-all ${
                                qty > 0 ? "border-amber-400 bg-amber-50/10" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-start justify-between w-full gap-2">
                                <div className="truncate">
                                  <div className="text-[11px] font-bold text-slate-800 truncate">{addon.name}</div>
                                  <div className="text-[9px] text-slate-500 font-semibold">
                                    Std: KES {parseFloat(addon.price.toString()).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {qty > 0 ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveAddon(index, addon.id)}
                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-[11px] font-extrabold text-slate-800 w-3 text-center">{qty}</span>
                                    </>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => handleAddAddon(index, addon)}
                                    className="p-1 rounded bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 flex items-center justify-center"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {qty > 0 && item && (
                                <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between gap-2">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase whitespace-nowrap">Price override:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.price}
                                    onChange={(e) => handleUpdateAddonPrice(index, addon.id, e.target.value)}
                                    className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-semibold text-slate-700 bg-white"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 6. Discounts & Partial Payments */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">Discounts & Partial Payments</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">Discount Option</label>
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold w-fit bg-slate-100 p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              updateRow(index, "discountType", "amount");
                              updateRow(index, "discountValue", "0");
                            }}
                            className={`px-3 py-1 rounded-md transition-all ${
                              row.discountType === "amount" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                            }`}
                          >
                            Flat KES
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateRow(index, "discountType", "percentage");
                              updateRow(index, "discountValue", "0");
                            }}
                            className={`px-3 py-1 rounded-md transition-all ${
                              row.discountType === "percentage" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                            }`}
                          >
                            Percentage (%)
                          </button>
                        </div>
                        
                        <input
                          type="number"
                          min="0"
                          max={row.discountType === "percentage" ? 100 : undefined}
                          disabled={isSaving}
                          placeholder={row.discountType === "percentage" ? "e.g. 10%" : "e.g. 1000 KES"}
                          value={row.discountValue}
                          onChange={(e) => {
                            updateRow(index, "discountValue", e.target.value);
                            updateRow(index, "isPartialPayment", false);
                            updateRow(index, "partialPaidAmount", "");
                          }}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-white font-semibold mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Discount Reason (Required if Discount applied)</label>
                        <input
                          type="text"
                          disabled={isSaving}
                          required={parseFloat(row.discountValue) > 0}
                          placeholder="e.g. Manager approval, group discount"
                          value={row.discountReason}
                          onChange={(e) => updateRow(index, "discountReason", e.target.value)}
                          className="w-full px-3.5 py-2 mt-[26px] border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-white"
                        />
                      </div>

                      {row.paymentState !== "unpaid" && (
                        <div className="sm:col-span-2 space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isSaving}
                              checked={row.isPartialPayment}
                              onChange={(e) => {
                                updateRow(index, "isPartialPayment", e.target.checked);
                                if (e.target.checked && !row.partialPaidAmount) {
                                  updateRow(index, "partialPaidAmount", Math.floor(pricing.finalTotal / 2).toString());
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                            />
                            This is a partial payment (Guest will pay a deposit)
                          </label>

                          {row.isPartialPayment && (
                            <div className="pt-1 space-y-2.5 animate-fadeIn">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Deposit Type</label>
                                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[10px] font-bold w-fit bg-slate-100 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateRow(index, "partialPaymentType", "amount");
                                      updateRow(index, "partialPaidAmount", Math.floor(pricing.finalTotal / 2).toString());
                                    }}
                                    className={`px-3 py-1 rounded-md transition-all ${
                                      row.partialPaymentType === "amount" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                                    }`}
                                  >
                                    Flat KES
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateRow(index, "partialPaymentType", "percentage");
                                      updateRow(index, "partialPaidAmount", "50");
                                    }}
                                    className={`px-3 py-1 rounded-md transition-all ${
                                      row.partialPaymentType === "percentage" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                                    }`}
                                  >
                                    Percentage (%)
                                  </button>
                                </div>
                              </div>

                              <div className="pt-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                  {row.partialPaymentType === "percentage" ? "Deposit Percentage (%)" : "Amount Paid Today (KES)"}
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max={row.partialPaymentType === "percentage" ? 100 : pricing.finalTotal}
                                  disabled={isSaving}
                                  placeholder={row.partialPaymentType === "percentage" ? "e.g. 50" : "e.g. 5000"}
                                  value={row.partialPaidAmount}
                                  onChange={(e) => updateRow(index, "partialPaidAmount", e.target.value)}
                                  className="w-full sm:w-48 px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 bg-white font-semibold"
                                />
                                <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                                  {(() => {
                                    const val = parseFloat(row.partialPaidAmount) || 0;
                                    const absoluteDeposit = row.partialPaymentType === "percentage" ? pricing.finalTotal * (val / 100) : val;
                                    const remaining = Math.max(0, pricing.finalTotal - absoluteDeposit);
                                    return (
                                      <>
                                        {row.partialPaymentType === "percentage" && (
                                          <span className="block text-slate-600 font-bold">
                                            Equivalent Deposit Amount: KES {absoluteDeposit.toLocaleString()}
                                          </span>
                                        )}
                                        Remaining unpaid balance of KES {remaining.toLocaleString()} will be due later.
                                      </>
                                    );
                                  })()}
                                </div>
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
                        value={row.specialRequests}
                        onChange={(e) => updateRow(index, "specialRequests", e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 h-16 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* 7. EXPLICIT PAYMENT STATES */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border">
                    <label className="block font-bold text-slate-800 text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Explicit Payment State Selection
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                      {[
                        { id: "cash", label: "Paid — Cash", desc: "Cash collected" },
                        { id: "mpesa", label: "Paid — M-Pesa", desc: "M-Pesa verified" },
                        { id: "visa", label: "Paid — Visa", desc: "Visa Card" },
                        { id: "mastercard", label: "Paid — Mastercard", desc: "Mastercard" },
                        { id: "staff_card", label: "Staff Card", desc: "Staff Special Card" },
                        { id: "agent_credit", label: "Agent Credit", desc: "Voucher / Invoice" },
                        { id: "waived", label: "Waived", desc: "Complimentary" },
                        { id: "unpaid", label: "Unpaid", desc: "Pay on arrival" },
                      ].map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          disabled={isSaving}
                          onClick={() => {
                            updateRow(index, "paymentState", p.id as any);
                            if (p.id === "unpaid") {
                              updateRow(index, "isPartialPayment", false);
                              updateRow(index, "partialPaidAmount", "");
                            }
                          }}
                          className={`p-3 rounded-lg border text-center transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            row.paymentState === p.id
                              ? "bg-amber-600 text-white border-amber-700 shadow-sm font-semibold"
                              : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                          }`}
                        >
                          <div className="text-xs font-bold">{p.label}</div>
                          <div className={`text-[10px] ${row.paymentState === p.id ? "text-amber-100" : "text-slate-400"}`}>
                            {p.desc}
                          </div>
                        </button>
                      ))}
                    </div>

                    {row.paymentState !== "unpaid" && (
                      <div className="pt-3 border-t border-slate-200/60 mt-3 animate-fadeIn">
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                          Transaction Ref / Code (Required for {row.paymentState.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          required
                          disabled={isSaving}
                          placeholder="e.g. QX12345678"
                          value={row.transactionRef}
                          onChange={(e) => updateRow(index, "transactionRef", e.target.value)}
                          className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 uppercase font-bold text-slate-800 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Controls - Add Row */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
        <button
          type="button"
          disabled={isSaving}
          onClick={addRow}
          className="flex items-center gap-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-slate-500" /> Add Booking Card
        </button>
        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> Accordion style guest manifest setup
        </span>
      </div>

      {/* Aggregate Group Summary Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-lg">
        <div className="text-xs text-amber-500 uppercase font-extrabold tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Real-time Batch Financial Summary
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Bookings</span>
            <span className="text-lg font-black text-white">{rows.length} Cards</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Headcount</span>
            <span className="text-lg font-black text-white">{summary.totalPax} Pax</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Discounts Allowed</span>
            <span className="text-lg font-black text-rose-400">KES {summary.totalDiscounts.toLocaleString()}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Cash Paid Today</span>
            <span className="text-lg font-black text-emerald-400">KES {summary.totalPaid.toLocaleString()}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Outstanding Balance</span>
            <span className="text-lg font-black text-amber-400">KES {summary.totalReceivable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/60 text-white font-bold text-base rounded-xl transition-all shadow-md shadow-amber-600/10 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" style={{ borderRadius: "50%" }} />
            Bulk registering bookings...
          </>
        ) : (
          `Submit Batch Registration (${rows.length} Bookings)`
        )}
      </button>
    </form>
  );
}
