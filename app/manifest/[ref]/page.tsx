"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getPublicManifest } from "@/services/vessels";
import { Ship, Printer, Search, Copy, Check, Clock, UserCheck, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface ManifestGuest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_primary: boolean;
  status: string;
}

interface ManifestBooking {
  id: string;
  reference: string;
  booked_by_name: string;
  party_size: number;
  adult_count: number;
  child_count: number;
  table_number: string;
  special_requests: string;
  status: string;
  booking_guests: ManifestGuest[];
}

interface ScheduleData {
  reference: string;
  dhow_name: string;
  date: string;
  meal_type_display: string;
  departure_time: string;
  return_time: string;
  status: string;
}

interface PublicManifestResponse {
  schedule: ScheduleData;
  manifest: ManifestBooking[];
}

export default function PublicManifestPage() {
  const { ref } = useParams() as { ref: string };
  const [data, setData] = useState<PublicManifestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Local state to keep track of checked-in guests at the dock
  const [boardedGuests, setBoardedGuests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!ref) return;
    getPublicManifest(ref)
      .then((res) => {
        setData(res);
        // Pre-populate boarded guests state based on database check-in status
        const initialBoarded: Record<string, boolean> = {};
        res.manifest.forEach((b: ManifestBooking) => {
          b.booking_guests.forEach((g) => {
            if (g.status === "checked_in" || b.status === "completed") {
              initialBoarded[g.id] = true;
            }
          });
        });
        setBoardedGuests(initialBoarded);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load sailing manifest. Verify reference link.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ref]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Manifest sharing link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBoarding = (guestId: string) => {
    setBoardedGuests((prev) => ({
      ...prev,
      [guestId]: !prev[guestId],
    }));
  };

  const filteredManifest = useMemo(() => {
    if (!data) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return data.manifest;

    return data.manifest.filter((b) => {
      const matchBooker = b.booked_by_name.toLowerCase().includes(query);
      const matchRef = b.reference.toLowerCase().includes(query);
      const matchTable = b.table_number.toLowerCase().includes(query);
      const matchGuests = b.booking_guests.some(
        (g) =>
          g.first_name.toLowerCase().includes(query) ||
          g.last_name.toLowerCase().includes(query)
      );
      return matchBooker || matchRef || matchTable || matchGuests;
    });
  }, [data, searchQuery]);

  const stats = useMemo(() => {
    if (!data) return { totalGuests: 0, checkedIn: 0 };
    let total = 0;
    data.manifest.forEach((b) => {
      total += b.party_size;
    });
    const checked = Object.values(boardedGuests).filter(Boolean).length;
    return {
      totalGuests: total,
      checkedIn: checked,
    };
  }, [data, boardedGuests]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderRadius: "50%" }} />
          <p className="text-sm font-semibold text-slate-500">Loading daily manifest...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-lg text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Manifest Error</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error || "Could not retrieve manifest."}</p>
        </div>
      </div>
    );
  }

  const { schedule } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      {/* CSS Print Stylesheet injected inline */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
          }
          .manifest-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .manifest-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .manifest-table th, .manifest-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px !important;
            font-size: 10px !important;
            color: black !important;
          }
          .print-page-break {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Print-only Official Header */}
        <div className="hidden print-header text-center space-y-2 pb-6 border-b-2 border-slate-900">
          <h1 className="text-xl font-black uppercase tracking-widest text-slate-900">Tamarind Dhow Mombasa</h1>
          <p className="text-xs font-bold text-slate-700">Official Passenger Boarding Manifest</p>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-800 mt-4 text-left border border-slate-300 p-3 rounded-lg">
            <div><strong>Vessel:</strong> {schedule.dhow_name}</div>
            <div><strong>Date:</strong> {schedule.date}</div>
            <div><strong>Cruise:</strong> {schedule.meal_type_display}</div>
            <div><strong>Departure:</strong> {schedule.departure_time.substring(0, 5)} - {schedule.return_time.substring(0, 5)}</div>
            <div><strong>Total Guests:</strong> {stats.totalGuests}</div>
            <div><strong>Boarded Count:</strong> {stats.checkedIn}</div>
          </div>
        </div>

        {/* Regular Header Panel */}
        <div className="no-print bg-gradient-to-r from-amber-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
            <Ship className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                  Crew Access Link
                </span>
                <h1 className="text-2xl font-black tracking-tight mt-1">{schedule.dhow_name} Passenger List</h1>
                <p className="text-xs text-amber-200/80 font-medium">
                  {schedule.date} • {schedule.meal_type_display} ({schedule.departure_time.substring(0, 5)} - {schedule.return_time.substring(0, 5)})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Share Link
                </button>
                 <button
                  onClick={async () => {
                    const loadingToast = toast.loading("Generating PDF manifest...");
                    try {
                      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                      const response = await fetch(`${apiBase}/api/v1/schedules/${ref}/download-pdf/`);
                      if (!response.ok) throw new Error("Failed to download PDF");
                      
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `sailing-manifest-${ref}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      
                      toast.success("PDF manifest downloaded successfully!", { id: loadingToast });
                    } catch (err) {
                      toast.error("Failed to generate PDF manifest.", { id: loadingToast });
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Manifest
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs">
              <div>
                <span className="block text-amber-300 font-semibold uppercase tracking-wider text-[10px]">Total Booked</span>
                <span className="text-lg font-black">{stats.totalGuests} Passengers</span>
              </div>
              <div>
                <span className="block text-amber-300 font-semibold uppercase tracking-wider text-[10px]">Boarding Status</span>
                <span className="text-lg font-black">{stats.checkedIn} / {stats.totalGuests} Boarded</span>
              </div>
              <div>
                <span className="block text-amber-300 font-semibold uppercase tracking-wider text-[10px]">Vessel Status</span>
                <span className="text-lg font-black uppercase">{schedule.status}</span>
              </div>
              <div>
                <span className="block text-amber-300 font-semibold uppercase tracking-wider text-[10px]">Escort Captain</span>
                <span className="text-lg font-black">Shared Manifest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Searching & Filters */}
        <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by passenger name, booking reference or table seating..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-800 text-sm font-medium focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Boarding List Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden manifest-card">
          {/* Table view for print, interactive layout for screen */}
          <div className="print-header hidden">
            <table className="manifest-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Primary Booker</th>
                  <th>Pax</th>
                  <th>Table</th>
                  <th>Special Requests / Dietaries</th>
                  <th>Boarding List</th>
                </tr>
              </thead>
              <tbody>
                {data.manifest.map((b) => {
                  const tables = b.table_number || "—";
                  const guestsList = b.booking_guests
                    .map((g) => `${g.first_name} ${g.last_name} (${boardedGuests[g.id] ? "Boarded" : "Absent"})`)
                    .join(", ");
                  return (
                    <tr key={b.id} className="print-page-break">
                      <td><strong>{b.reference}</strong></td>
                      <td>{b.booked_by_name}</td>
                      <td>{b.party_size} pax</td>
                      <td>{tables}</td>
                      <td>{b.special_requests || "None"}</td>
                      <td>{guestsList}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Interactive Screen View */}
          <div className="no-print divide-y divide-slate-100">
            {filteredManifest.map((b) => (
              <div key={b.id} className="p-6 hover:bg-slate-50/50 transition-colors space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {b.reference}
                      </span>
                      {b.table_number && (
                        <span className="font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                          Table {b.table_number}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mt-1">{b.booked_by_name}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Party of {b.party_size} ({b.adult_count} Adults, {b.child_count} Kids)
                    </p>
                  </div>

                  {b.special_requests && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl max-w-sm text-xs font-semibold">
                      Dietaries / Requests: {b.special_requests}
                    </div>
                  )}
                </div>

                {/* Granular passenger checklists */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Passenger Boarding Checklist
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {b.booking_guests.map((g) => {
                      const isBoarded = !!boardedGuests[g.id];
                      return (
                        <button
                          key={g.id}
                          onClick={() => handleToggleBoarding(g.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all group ${
                            isBoarded
                              ? "bg-emerald-50/60 border-emerald-200 text-emerald-950 font-bold"
                              : "bg-white border-slate-200 text-slate-700 font-semibold"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="text-xs truncate">{g.first_name} {g.last_name}</div>
                            {g.is_primary && <div className="text-[8px] text-amber-700 uppercase tracking-wider">Primary</div>}
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isBoarded ? "bg-emerald-600 text-white" : "bg-slate-100 text-transparent group-hover:bg-slate-200"
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {filteredManifest.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <p className="text-sm text-slate-400 font-bold">No passengers found</p>
                <p className="text-xs text-slate-500">Try matching booking reference, guest names or tables.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
