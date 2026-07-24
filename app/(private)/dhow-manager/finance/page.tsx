"use client";

import React, { useState } from "react";
import { Refund } from "@/types/payment";
import { processRefund } from "@/services/payments";
import { useFetchEscrowRecords, useFetchRefunds } from "@/hooks/payments/actions";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DollarSign, ShieldCheck, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function FinancialControlPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const [activeTab, setActiveTab] = useState<"escrow" | "refunds">("escrow");

  // Query Hooks
  const { data: escrowData, refetch: refetchEscrows } = useFetchEscrowRecords();
  const { data: refundsData, refetch: refetchRefunds } = useFetchRefunds();

  const escrows = escrowData?.results || [];
  const refunds = refundsData?.results || [];

  // Selected Refund modal processing
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [mpesaRef, setMpesaRef] = useState("");
  const [processNotes, setProcessNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleProcess = async (statusChoice: "completed" | "rejected") => {
    if (!selectedRefund) return;
    setIsSaving(true);
    try {
      await processRefund(
        selectedRefund.reference,
        statusChoice,
        mpesaRef,
        processNotes,
        token
      );
      toast.success(`Refund ${selectedRefund.reference} marked as ${statusChoice}!`);
      setSelectedRefund(null);
      setMpesaRef("");
      setProcessNotes("");
      refetchRefunds();
      refetchEscrows();
    } catch (err) {
      toast.error("Failed to process refund.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Control & Escrow Center</h1>
          <p className="text-sm text-slate-500">Monitor guest escrow holdings and process cancellation refund reversals.</p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab("escrow")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "escrow" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Escrow Holdings
          </button>
          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "refunds" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Refund Processing
          </button>
        </div>
      </div>

      {/* Escrow Tab Content */}
      {activeTab === "escrow" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" /> Escrow Fund Holdings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Escrow Reference</th>
                  <th className="px-6 py-3.5">Payment / Booking Ref</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Resolution Method</th>
                  <th className="px-6 py-3.5">Held At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {escrows.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900">{e.reference}</td>
                    <td className="px-6 py-4 text-xs font-mono">{e.booking_reference || e.payment_reference}</td>
                    <td className="px-6 py-4 font-bold text-amber-700">KES {e.amount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={e.status} type="escrow" />
                    </td>
                    <td className="px-6 py-4 text-xs capitalize text-slate-600">
                      {e.resolution_method ? e.resolution_method.replace("_", " ") : "Pending Sailing"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(e.held_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refunds Tab Content */}
      {activeTab === "refunds" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-600" /> Pending & Processed Refunds
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Refund Ref</th>
                  <th className="px-6 py-3.5">Booking Ref</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">M-Pesa / B2C Ref</th>
                  <th className="px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900">{r.reference}</td>
                    <td className="px-6 py-4 text-xs font-mono">{r.booking_reference}</td>
                    <td className="px-6 py-4 font-bold text-rose-700">KES {r.amount}</td>
                    <td className="px-6 py-4 text-xs capitalize">{r.reason.replace("_", " ")}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} type="refund" />
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">{r.mpesa_ref || "—"}</td>
                    <td className="px-6 py-4">
                      {r.status === "pending" ? (
                        <button
                          onClick={() => setSelectedRefund(r)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg"
                        >
                          Process Refund
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Processing Refund */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">
              Process Refund {selectedRefund.reference}
            </h3>
            <p className="text-xs text-slate-500">
              Amount: <strong className="text-slate-900 font-bold">KES {selectedRefund.amount}</strong> | Booking: <span className="font-mono">{selectedRefund.booking_reference}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">M-Pesa B2C / Bank Ref Number</label>
              <input
                type="text"
                disabled={isSaving}
                placeholder="e.g. QX98765432"
                value={mpesaRef}
                onChange={(e) => setMpesaRef(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Processing Notes</label>
              <textarea
                placeholder="Accounts notes..."
                disabled={isSaving}
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedRefund(null)}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcess("rejected")}
                disabled={isSaving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                )}
                Reject Refund
              </button>
              <button
                onClick={() => handleProcess("completed")}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                )}
                Approve & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
