"use client";

import React, { useState, useEffect } from "react";
import { createBookingBulk } from "@/services/bookings";
import { useFetchSchedules, useFetchAddOns } from "@/hooks/vessels/actions";
import { Plus, Trash2, HelpCircle, DollarSign, ShoppingBag, ChevronDown, ChevronUp, Minus } from "lucide-react";
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
  cancellationPreference: "reschedule" | "refund";
  tableRequest: string;
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
    cancellationPreference: "refund",
    tableRequest: "",
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
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
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
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) {
      toast.error("You must register at least one booking.");
      return;
    }
    setRows(rows.filter((_, idx) => idx !== index));
    if (expandedRowIndex === index) setExpandedRowIndex(null);
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
    const addonsSubtotal = row.selectedAddons.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCalculated = ticketSubtotal + addonsSubtotal;

    const discountValueParsed = parseFloat(row.discountValue) || 0;
    const discount = row.discountType === "percentage"
      ? ticketSubtotal * (discountValueParsed / 100)
      : discountValueParsed;

    const finalTotal = Math.max(0, totalCalculated - discount);
    const depositVal = parseFloat(row.partialPaidAmount) || 0;
    const depositAmount = row.isPartialPayment
      ? (row.partialPaymentType === "percentage" ? finalTotal * (depositVal / 100) : depositVal)
      : 0;
    const paidAmount = row.paymentState === "unpaid" 
      ? 0 
      : row.isPartialPayment 
        ? depositAmount 
        : finalTotal;
    const unpaidBalance = Math.max(0, finalTotal - paidAmount);
    return { ticketSubtotal, addonsSubtotal, totalCalculated, discount, finalTotal, paidAmount, unpaidBalance };
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
        toast.error(`Please select a voyage for row ${i + 1}.`);
        return;
      }
      if (!row.guestName.trim()) {
        toast.error(`Please enter Guest Name for row ${i + 1}.`);
        return;
      }
      const pricing = getRowPricing(row);
      if (pricing.discount > 0 && !row.discountReason.trim()) {
        toast.error(`Please enter a discount reason for row ${i + 1}.`);
        return;
      }
      if (row.paymentState !== "unpaid" && row.isPartialPayment) {
        const depositVal = parseFloat(row.partialPaidAmount) || 0;
        if (row.partialPaymentType === "percentage" && (depositVal <= 0 || depositVal > 100)) {
          toast.error(`Row ${i + 1}: Deposit percentage must be between 1% and 100%.`);
          return;
        }
        if (row.partialPaymentType === "amount" && (depositVal <= 0 || depositVal > pricing.finalTotal)) {
          toast.error(`Row ${i + 1}: Deposit amount must be greater than 0 and less than final total KES ${pricing.finalTotal.toLocaleString()}.`);
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
          special_requests: row.specialRequests.trim() || undefined,
          status: row.paymentState === "unpaid" ? "pending" : "confirmed",
          primary_guest_name: row.guestName.trim(),
          primary_guest_email: row.guestEmail.trim() || undefined,
          primary_guest_phone: row.guestPhone.trim() || undefined,
          custom_price_per_person: row.customAdultPrice ? parseFloat(row.customAdultPrice) : undefined,
          custom_price_per_child: row.customChildPrice ? parseFloat(row.customChildPrice) : undefined,
          discount_type: row.discountType,
          discount_amount: pricing.discount, // Send computed flat discount amount for backwards compat if needed, but backend takes discount_value
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Scrollable table row wrapper */}
      <div className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 min-w-[160px]">Voyage Selection</th>
                <th className="px-4 py-3 min-w-[150px]">Primary Guest</th>
                <th className="px-4 py-3 min-w-[120px]">Phone Number</th>
                <th className="px-4 py-3 min-w-[100px]">Guests</th>
                <th className="px-4 py-3 min-w-[120px]">Custom Pricing</th>
                <th className="px-4 py-3 min-w-[140px]">Discount & Reason</th>
                <th className="px-4 py-3 min-w-[120px]">Payment</th>
                <th className="px-4 py-3 text-center w-24">Add-Ons</th>
                <th className="px-4 py-3 text-center w-12">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => {
                const pricing = getRowPricing(row);
                const hasAddons = row.selectedAddons.length > 0;
                const isExpanded = expandedRowIndex === index;

                return (
                  <React.Fragment key={index}>
                    <tr className={`transition-colors ${isExpanded ? "bg-amber-50/30" : "hover:bg-slate-50/50"}`}>
                      {/* Voyage Dropdown */}
                      <td className="px-4 py-3 align-top">
                        <select
                          disabled={isSaving || loadingSchedules}
                          value={row.scheduleId}
                          onChange={(e) => updateRow(index, "scheduleId", e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20 bg-white font-semibold text-slate-800"
                        >
                          {loadingSchedules ? (
                            <option>Loading voyages...</option>
                          ) : upcomingSchedules.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.dhow_name} — {s.date} ({s.meal_type_display})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Guest Name & Optional Email */}
                      <td className="px-4 py-3 space-y-1 align-top">
                        <input
                          type="text"
                          required
                          disabled={isSaving}
                          placeholder="John Doe"
                          value={row.guestName}
                          onChange={(e) => updateRow(index, "guestName", e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                        />
                        <input
                          type="email"
                          disabled={isSaving}
                          placeholder="Email (Optional)"
                          value={row.guestEmail}
                          onChange={(e) => updateRow(index, "guestEmail", e.target.value)}
                          className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20 text-slate-500"
                        />
                      </td>

                      {/* Phone Number */}
                      <td className="px-4 py-3 align-top">
                        <input
                          type="tel"
                          disabled={isSaving}
                          placeholder="e.g. 0712345678"
                          value={row.guestPhone}
                          onChange={(e) => updateRow(index, "guestPhone", e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                        />
                      </td>

                      {/* Pax Count */}
                      <td className="px-4 py-3 space-y-1 align-top">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-[10px] text-slate-400 font-bold uppercase">A</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            required
                            disabled={isSaving}
                            value={row.adultCount}
                            onChange={(e) => updateRow(index, "adultCount", e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-[10px] text-slate-400 font-bold uppercase">K</span>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            required
                            disabled={isSaving}
                            value={row.childCount}
                            onChange={(e) => updateRow(index, "childCount", e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                          />
                        </div>
                      </td>

                      {/* Custom Pricing */}
                      <td className="px-4 py-3 space-y-1 align-top">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-[10px] text-slate-400 font-bold uppercase">A</span>
                          <input
                            type="number"
                            min="0"
                            disabled={isSaving}
                            placeholder="Standard"
                            value={row.customAdultPrice}
                            onChange={(e) => updateRow(index, "customAdultPrice", e.target.value)}
                            className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20 bg-amber-50/20 text-slate-700"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-[10px] text-slate-400 font-bold uppercase">K</span>
                          <input
                            type="number"
                            min="0"
                            disabled={isSaving}
                            placeholder="Standard"
                            value={row.customChildPrice}
                            onChange={(e) => updateRow(index, "customChildPrice", e.target.value)}
                            className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20 bg-amber-50/20 text-slate-700"
                          />
                        </div>
                      </td>

                      {/* Discount Input & Reason */}
                      <td className="px-4 py-3 space-y-1 align-top">
                        <div className="flex gap-1">
                          <select
                            disabled={isSaving}
                            value={row.discountType}
                            onChange={(e) => updateRow(index, "discountType", e.target.value as any)}
                            className="w-16 px-1 py-1 border border-slate-200 rounded-md bg-slate-50 text-[10px] font-semibold text-slate-700"
                          >
                            <option value="amount">KES</option>
                            <option value="percentage">%</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            max={row.discountType === "percentage" ? 100 : undefined}
                            disabled={isSaving}
                            value={row.discountValue}
                            onChange={(e) => updateRow(index, "discountValue", e.target.value)}
                            className="flex-1 px-2 py-1 text-[10px] border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                          />
                        </div>
                        {pricing.discount > 0 && (
                          <input
                            type="text"
                            required
                            disabled={isSaving}
                            placeholder="Reason required"
                            value={row.discountReason}
                            onChange={(e) => updateRow(index, "discountReason", e.target.value)}
                            className="w-full px-2 py-1 text-[10px] border border-rose-200 rounded-md focus:ring-1 focus:ring-rose-500/20 bg-rose-50/20 text-rose-800"
                          />
                        )}
                      </td>

                      {/* Payment Settings */}
                      <td className="px-4 py-3 space-y-1.5 align-top">
                        <select
                          disabled={isSaving}
                          value={row.paymentState}
                          onChange={(e) => updateRow(index, "paymentState", e.target.value as any)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20 bg-white"
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


                        {row.paymentState !== "unpaid" && (
                          <div className="flex flex-col gap-1 p-1 bg-slate-50 border border-slate-200/80 rounded-md text-[10px]">
                            <label className="flex items-center gap-1 cursor-pointer select-none font-medium">
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
                                className="rounded text-amber-600 focus:ring-amber-500 w-3 h-3"
                              />
                              Deposit
                            </label>

                            {row.isPartialPayment && (
                              <div className="mt-1 space-y-1">
                                <div className="flex gap-1">
                                  <select
                                    disabled={isSaving}
                                    value={row.partialPaymentType}
                                    onChange={(e) => {
                                      updateRow(index, "partialPaymentType", e.target.value as any);
                                      if (e.target.value === "percentage") {
                                        updateRow(index, "partialPaidAmount", "50");
                                      } else {
                                        updateRow(index, "partialPaidAmount", Math.floor(pricing.finalTotal / 2).toString());
                                      }
                                    }}
                                    className="px-1 py-0.5 border border-slate-200 rounded text-[9px] font-semibold bg-white"
                                  >
                                    <option value="amount">KES</option>
                                    <option value="percentage">%</option>
                                  </select>
                                  <input
                                    type="number"
                                    min="1"
                                    max={row.partialPaymentType === "percentage" ? 100 : pricing.finalTotal}
                                    required
                                    disabled={isSaving}
                                    value={row.partialPaidAmount}
                                    onChange={(e) => updateRow(index, "partialPaidAmount", e.target.value)}
                                    className="flex-1 px-1 py-0.5 border border-slate-200 rounded text-[10px] w-12"
                                  />
                                </div>
                                {row.partialPaymentType === "percentage" && (
                                  <div className="text-[8px] text-slate-500 font-semibold truncate">
                                    Dep: KES {pricing.paidAmount.toLocaleString()}
                                  </div>
                                )}
                                <div className="text-[8px] text-amber-700 font-medium truncate">
                                  Bal: KES {pricing.unpaidBalance.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Addons Toggler */}
                      <td className="px-4 py-3 text-center align-top">
                        <button
                          type="button"
                          onClick={() => setExpandedRowIndex(isExpanded ? null : index)}
                          className={`flex items-center gap-1 mx-auto px-2 py-1.5 rounded border text-[10px] font-bold transition-colors ${
                            hasAddons ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {row.selectedAddons.reduce((acc, curr) => acc + curr.quantity, 0) || "Add"}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>

                      {/* Delete button */}
                      <td className="px-4 py-3 text-center align-top">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => removeRow(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* EXPANDED ROW FOR ADDONS AND SPECIAL REQUESTS */}
                    {isExpanded && (
                      <tr className="bg-amber-50/20">
                        <td colSpan={9} className="px-4 py-4 border-t border-slate-200/50">
                          <div className="flex flex-col sm:flex-row gap-6 max-w-5xl">
                            {/* Special Requests & Transaction Ref */}
                            <div className="flex-1 space-y-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Special Dietary / Voyage Requests</label>
                                <textarea
                                  disabled={isSaving}
                                  placeholder="e.g. Vegetarian diet, birthday setup..."
                                  value={row.specialRequests}
                                  onChange={(e) => updateRow(index, "specialRequests", e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500/20 h-16 bg-white"
                                />
                              </div>

                              {row.paymentState !== "unpaid" && (
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                    {row.paymentState === "mpesa" ? "M-Pesa Transaction Reference Code" : "Transaction Reference / Code"}
                                  </label>
                                  <input
                                    type="text"
                                    disabled={isSaving}
                                    placeholder={row.paymentState === "mpesa" ? "e.g. QX12345678" : "e.g. Check No, bank ref"}
                                    value={row.transactionRef}
                                    onChange={(e) => updateRow(index, "transactionRef", e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500/20 bg-white uppercase font-semibold text-slate-800"
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Addons Configurator */}
                            <div className="flex-[2] space-y-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Optional Booking Add-ons</label>
                              {addonsList.length === 0 ? (
                                <div className="text-xs text-slate-400 italic py-2">No available addons registered in vessel management.</div>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {addonsList.map((addon) => {
                                    const qty = row.selectedAddons.find(a => a.id === addon.id)?.quantity || 0;
                                    const selectedAddon = row.selectedAddons.find(a => a.id === addon.id);
                                    return (
                                      <div key={addon.id} className={`p-2.5 border rounded-lg flex flex-col justify-between bg-white shadow-sm transition-all ${
                                        qty > 0 ? "border-amber-400 bg-amber-50/5" : "border-slate-200"
                                      }`}>
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="truncate">
                                            <div className="text-[11px] font-bold text-slate-800 truncate">{addon.name}</div>
                                            <div className="text-[9px] text-slate-500 font-medium">Std: KES {parseFloat(addon.price.toString()).toLocaleString()}</div>
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

                                        {qty > 0 && selectedAddon && (
                                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase whitespace-nowrap">Price:</span>
                                            <input
                                              type="number"
                                              min="0"
                                              value={selectedAddon.price}
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
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Form Controls */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between">
          <button
            type="button"
            disabled={isSaving}
            onClick={addRow}
            className="flex items-center gap-1 text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" /> Add Booking Row
          </button>
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Spreadsheet style bulk entry form
          </span>
        </div>
      </div>

      {/* Aggregate Group Summary Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner space-y-3.5">
        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-slate-400" /> Real-time Batch Financial Summary
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Bookings</span>
            <span className="text-lg font-bold text-slate-800">{rows.length} Rows</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Headcount</span>
            <span className="text-lg font-bold text-slate-800">{summary.totalPax} Pax</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Discounts Allowed</span>
            <span className="text-lg font-bold text-rose-700">KES {summary.totalDiscounts.toLocaleString()}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Cash Paid Today</span>
            <span className="text-lg font-bold text-emerald-700">KES {summary.totalPaid.toLocaleString()}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Outstanding Balance</span>
            <span className="text-lg font-bold text-amber-700">KES {summary.totalReceivable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/60 text-white font-bold text-base rounded-xl transition-all shadow-md shadow-amber-600/10 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
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
