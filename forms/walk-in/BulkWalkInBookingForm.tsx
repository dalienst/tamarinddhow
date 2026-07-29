"use client";

import React, { useState, useEffect } from "react";
import { createBookingBulk } from "@/services/bookings";
import { useFetchSchedules } from "@/hooks/vessels/actions";
import { Plus, Trash2, HelpCircle, DollarSign } from "lucide-react";
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
  cancellationPreference: "reschedule" | "refund";
  tableRequest: string;
  specialRequests: string;
  discountAmount: string;
  discountReason: string;
  paymentState: "unpaid" | "cash" | "mpesa" | "agent_credit" | "waived";
  isPartialPayment: boolean;
  partialPaidAmount: string;
}

export default function BulkWalkInBookingForm({ token, onSuccess }: BulkWalkInBookingFormProps) {
  // Query Hooks
  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules({ is_open: true });
  const schedules = schedulesData?.results || [];

  // Filter out past voyages from selection
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingSchedules = schedules.filter((s) => s.date >= todayStr);

  const [rows, setRows] = useState<BulkBookingRow[]>([
    {
      scheduleId: "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      adultCount: "2",
      childCount: "0",
      cancellationPreference: "refund",
      tableRequest: "",
      specialRequests: "",
      discountAmount: "0",
      discountReason: "",
      paymentState: "cash",
      isPartialPayment: false,
      partialPaidAmount: "",
    },
  ]);

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
      {
        scheduleId: nextScheduleId,
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        adultCount: "2",
        childCount: "0",
        cancellationPreference: "refund",
        tableRequest: "",
        specialRequests: "",
        discountAmount: "0",
        discountReason: "",
        paymentState: "cash",
        isPartialPayment: false,
        partialPaidAmount: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) {
      toast.error("You must register at least one booking.");
      return;
    }
    setRows(rows.filter((_, idx) => idx !== index));
  };

  const updateRow = <K extends keyof BulkBookingRow>(index: number, field: K, value: BulkBookingRow[K]) => {
    setRows((prev) =>
      prev.map((row, idx) => {
        if (idx === index) {
          const updatedRow = { ...row, [field]: value };
          // If payment status becomes unpaid, turn off partial payments
          if (field === "paymentState" && value === "unpaid") {
            updatedRow.isPartialPayment = false;
            updatedRow.partialPaidAmount = "";
          }
          return updatedRow;
        }
        return row;
      })
    );
  };

  // Helper pricing calculators for aggregate panel
  const getRowPricing = (row: BulkBookingRow) => {
    const s = schedules.find((sched) => sched.id === row.scheduleId);
    const adultPrice = s ? parseFloat(s.price_per_person.toString()) : 0;
    const childPrice = s ? parseFloat((s.price_per_child || 0).toString()) : 0;
    const adults = parseInt(row.adultCount, 10) || 1;
    const children = parseInt(row.childCount, 10) || 0;
    const total = (adults * adultPrice) + (children * childPrice);
    const discount = parseFloat(row.discountAmount) || 0;
    const finalTotal = Math.max(0, total - discount);
    const paidAmount = row.paymentState === "unpaid" 
      ? 0 
      : row.isPartialPayment 
        ? parseFloat(row.partialPaidAmount) || 0 
        : finalTotal;
    const unpaidBalance = Math.max(0, finalTotal - paidAmount);
    return { total, discount, finalTotal, paidAmount, unpaidBalance };
  };

  const summary = rows.reduce(
    (sum, row) => {
      const p = getRowPricing(row);
      return {
        totalPax: sum.totalPax + (parseInt(row.adultCount, 10) || 1) + (parseInt(row.childCount, 10) || 0),
        totalGross: sum.totalGross + p.total,
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
      if (row.isPartialPayment) {
        const deposit = parseFloat(row.partialPaidAmount) || 0;
        if (deposit <= 0 || deposit > pricing.finalTotal) {
          toast.error(`Row ${i + 1}: Deposit must be greater than 0 and less than final total KES ${pricing.finalTotal.toLocaleString()}.`);
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
          discount_amount: pricing.discount,
          discount_reason: row.discountReason.trim() || undefined,
          payment_method: row.paymentState,
          is_partial_payment: row.isPartialPayment,
          partial_paid_amount: row.isPartialPayment ? parseFloat(row.partialPaidAmount) : 0,
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
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">Voyage Selection</th>
                <th className="px-4 py-3 min-w-[180px]">Primary Guest Name</th>
                <th className="px-4 py-3 min-w-[150px]">Phone Number</th>
                <th className="px-4 py-3 w-24">Adults</th>
                <th className="px-4 py-3 w-24">Kids</th>
                <th className="px-4 py-3 min-w-[140px]">Discount (KES)</th>
                <th className="px-4 py-3 min-w-[120px]">Payment</th>
                <th className="px-4 py-3 text-center w-16">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => {
                const pricing = getRowPricing(row);
                return (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    {/* Voyage Dropdown */}
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 space-y-1">
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
                    <td className="px-4 py-3">
                      <input
                        type="tel"
                        disabled={isSaving}
                        placeholder="e.g. 0712345678"
                        value={row.guestPhone}
                        onChange={(e) => updateRow(index, "guestPhone", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                      />
                    </td>

                    {/* Adults Count */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        required
                        disabled={isSaving}
                        value={row.adultCount}
                        onChange={(e) => updateRow(index, "adultCount", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                      />
                    </td>

                    {/* Children Count */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        required
                        disabled={isSaving}
                        value={row.childCount}
                        onChange={(e) => updateRow(index, "childCount", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                      />
                    </td>

                    {/* Discount Input & Reason */}
                    <td className="px-4 py-3 space-y-1">
                      <input
                        type="number"
                        min="0"
                        disabled={isSaving}
                        value={row.discountAmount}
                        onChange={(e) => updateRow(index, "discountAmount", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20"
                      />
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
                    <td className="px-4 py-3 space-y-1.5">
                      <select
                        disabled={isSaving}
                        value={row.paymentState}
                        onChange={(e) => updateRow(index, "paymentState", e.target.value as any)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-amber-500/20 bg-white"
                      >
                        <option value="cash">Paid — Cash</option>
                        <option value="mpesa">Paid — M-Pesa</option>
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
                            Partial Deposit
                          </label>

                          {row.isPartialPayment && (
                            <div className="mt-1 space-y-0.5">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">Amount Paid Today</span>
                              <input
                                type="number"
                                min="1"
                                max={pricing.finalTotal}
                                required
                                disabled={isSaving}
                                value={row.partialPaidAmount}
                                onChange={(e) => updateRow(index, "partialPaidAmount", e.target.value)}
                                className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[10px]"
                              />
                              <div className="text-[8px] text-amber-700 font-medium">
                                Bal: KES {pricing.unpaidBalance.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Delete button */}
                    <td className="px-4 py-3 text-center">
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
