"use client";

import React, { useState } from "react";
import { getBookingDetail, updateBooking } from "@/services/bookings";
import { useSession } from "next-auth/react";
import { QrCode, Search, CheckCircle, AlertTriangle, Users, HelpCircle, ArrowRight, Table, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface ScanLogItem {
  id: string;
  reference: string;
  guestName: string;
  partySize: number;
  tableNumber: string;
  timestamp: string;
  status: "success" | "already_checked_in" | "error";
  message: string;
}

export default function TicketScannerPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const [inputCode, setInputCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("manual");
  const [scanLog, setScanLog] = useState<ScanLogItem[]>([]);

  // Current scanned ticket details
  const [scannedBooking, setScannedBooking] = useState<any | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "loading" | "success" | "warning" | "error">("idle");
  const [scanMessage, setScanMessage] = useState("");

  const handleScanCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    
    setScanStatus("loading");
    setScannedBooking(null);
    setScanMessage("");

    try {
      // 1. Fetch Booking Detail
      const booking = await getBookingDetail(cleanCode, {
        headers: { Authorization: `Token ${token}` }
      });

      setScannedBooking(booking);

      // 2. Evaluate check-in criteria
      if (booking.status === "completed") {
        setScanStatus("warning");
        setScanMessage("This guest is already checked in.");
        addLogItem(cleanCode, booking, "already_checked_in", "Already checked in previously.");
      } else if (booking.status === "cancelled") {
        setScanStatus("error");
        setScanMessage("Warning: This booking has been CANCELLED!");
        addLogItem(cleanCode, booking, "error", "Ticket is cancelled.");
      } else if (booking.status === "no_show") {
        setScanStatus("error");
        setScanMessage("Warning: This booking was previously marked as No Show.");
        addLogItem(cleanCode, booking, "error", "Marked as No Show.");
      } else {
        // 3. Confirm Check-In / Boarding (status confirmed -> completed)
        await updateBooking(cleanCode, { status: "completed" }, token);
        setScanStatus("success");
        setScanMessage("Checked in successfully! Welcome aboard.");
        addLogItem(cleanCode, booking, "success", "Checked in successfully.");
      }
    } catch (err: any) {
      setScanStatus("error");
      setScanMessage(
        err?.response?.status === 404
          ? "Invalid Ticket: Booking reference code not found."
          : "Server Error: Failed to fetch booking details."
      );
      addLogItem(cleanCode, { booked_by_name: "Unknown Guest", party_size: 0, table_number: "—" }, "error", "Invalid or missing reference code.");
    }
  };

  const addLogItem = (ref: string, booking: any, status: "success" | "already_checked_in" | "error", message: string) => {
    const newItem: ScanLogItem = {
      id: Math.random().toString(),
      reference: ref,
      guestName: booking.booked_by_name || "Unknown Guest",
      partySize: booking.party_size || 0,
      tableNumber: booking.table_number || "—",
      timestamp: new Date().toLocaleTimeString(),
      status,
      message,
    };
    setScanLog(prev => [newItem, ...prev]);
  };

  const triggerMockScan = (mockCode: string) => {
    setInputCode(mockCode);
    handleScanCode(mockCode);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-8 h-8 text-amber-600" /> Digital Ticket Scanner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Scan passenger ticket QR codes or enter reservation references manually to check in boarding guests instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Scanner Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Tab switchers */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl text-sm font-semibold max-w-xs shadow-inner">
              <button
                onClick={() => setActiveTab("manual")}
                className={`w-1/2 py-2 rounded-xl transition-all ${
                  activeTab === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab("camera")}
                className={`w-1/2 py-2 rounded-xl transition-all ${
                  activeTab === "camera" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Camera Scanner
              </button>
            </div>

            {/* Manual scanner layout */}
            {activeTab === "manual" && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Type Booking Reference Code
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleScanCode(inputCode);
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. BK-2026-XXXX"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 uppercase font-mono font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    Lookup Ticket
                  </button>
                </form>
              </div>
            )}

            {/* Camera mock scanner */}
            {activeTab === "camera" && (
              <div className="space-y-6">
                <div className="bg-slate-950 text-slate-400 rounded-2xl aspect-video relative overflow-hidden flex flex-col items-center justify-center border border-slate-800">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent animate-pulse" />
                  
                  {/* Camera overlay grids */}
                  <div className="w-48 h-48 border-2 border-dashed border-amber-600/60 rounded-3xl relative flex items-center justify-center flex-col p-4 shadow-2xl">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-600 rounded-tl-xl -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-600 rounded-tr-xl -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-600 rounded-bl-xl -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-600 rounded-br-xl -mb-1 -mr-1" />
                    <QrCode className="w-16 h-16 text-slate-700 animate-pulse" />
                  </div>
                  
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mt-4 block">Camera Active (Simulation)</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Scan Simulations for Testing:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => triggerMockScan("BK-7890")}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-xs font-bold rounded-lg border text-slate-700 shadow-sm"
                    >
                      Scan Group Agent Ticket
                    </button>
                    <button
                      onClick={() => triggerMockScan("BK-INVALID")}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-xs font-bold rounded-lg border text-slate-700 shadow-sm"
                    >
                      Scan Invalid Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCANNING OUTCOME / DETAILS CARD */}
            {scanStatus !== "idle" && (
              <div className="pt-6 border-t border-slate-100">
                {scanStatus === "loading" ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" style={{ borderRadius: "50%" }} />
                    <span className="text-xs font-semibold text-slate-500">Querying boarding gates...</span>
                  </div>
                ) : (
                  <div className={`p-6 rounded-2xl border transition-all ${
                    scanStatus === "success" 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                      : scanStatus === "warning"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}>
                    <div className="flex items-start gap-4">
                      {scanStatus === "success" && <CheckCircle className="w-8 h-8 text-emerald-600 mt-0.5 flex-shrink-0" />}
                      {scanStatus === "warning" && <AlertTriangle className="w-8 h-8 text-amber-600 mt-0.5 flex-shrink-0" />}
                      {scanStatus === "error" && <AlertTriangle className="w-8 h-8 text-rose-600 mt-0.5 flex-shrink-0" />}

                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-75">Boarding Result</span>
                          <h3 className="font-extrabold text-base leading-tight">{scanMessage}</h3>
                        </div>

                        {scannedBooking && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-900/10 text-xs">
                            <div className="space-y-1">
                              <span className="opacity-75 block uppercase font-bold text-[9px]">Guest Name</span>
                              <span className="font-extrabold text-slate-900 block">{scannedBooking.booked_by_name || "Walk-In Guest"}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="opacity-75 block uppercase font-bold text-[9px]">Party Size</span>
                              <span className="font-extrabold text-slate-900 block flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                {scannedBooking.party_size} Pax
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="opacity-75 block uppercase font-bold text-[9px]">Assigned Seating</span>
                              <span className="font-extrabold text-slate-900 block flex items-center gap-1">
                                <Table className="w-3.5 h-3.5 text-slate-400" />
                                {scannedBooking.table_number ? `Table ${scannedBooking.table_number}` : "Unassigned"}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="opacity-75 block uppercase font-bold text-[9px]">Dietary / Requests</span>
                              <span className="font-extrabold text-slate-900 block">{scannedBooking.special_requests || "None"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Scan Logs */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Boarding logs</h3>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md">Realtime</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 max-h-[500px] overflow-y-auto">
            {scanLog.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                <p>Waiting for ticket scans...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scanLog.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border text-xs flex justify-between gap-3 items-start ${
                      log.status === "success"
                        ? "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                        : log.status === "already_checked_in"
                        ? "bg-amber-50/50 border-amber-100 text-amber-950"
                        : "bg-rose-50/50 border-rose-100 text-rose-950"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold font-mono uppercase">{log.reference}</span>
                        <span className="text-[9px] font-medium opacity-60">• {log.timestamp}</span>
                      </div>
                      <p className="font-bold text-[11px] text-slate-800">{log.guestName} ({log.partySize} Pax)</p>
                      <p className="text-[10px] opacity-75">{log.message}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="px-1.5 py-0.5 font-bold uppercase tracking-wider rounded text-[9px] bg-white border border-slate-200 block">
                        Table {log.tableNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
