"use client";

import React from "react";
import Link from "next/link";
import {
  Ship,
  Calendar,
  Users,
  DollarSign,
  UserPlus,
  QrCode,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function DhowManagerDashboard() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Ship className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Tamarind Dhow Control Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Manager Operations Dashboard
          </h1>
          <p className="text-amber-200/90 text-sm max-w-2xl">
            Real-time sailing capacity, minimum quota meters, digital passenger manifests, table seating assignments, escrow holdings, and financial reporting.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dhow-manager/schedules"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Schedule Center</h3>
          <p className="text-xs text-slate-500 mt-1">Manage sailings, templates, open/close, and sailing confirmations.</p>
        </Link>

        <Link
          href="/dhow-manager/walk-in"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserPlus className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Walk-In & Phone Booking</h3>
          <p className="text-xs text-slate-500 mt-1">Register walk-in guests with explicit payment states (Cash/Card/M-Pesa).</p>
        </Link>

        <Link
          href="/dhow-manager/finance"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <DollarSign className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Financials & Escrow</h3>
          <p className="text-xs text-slate-500 mt-1">Monitor escrow holdings & process guest refund reversals.</p>
        </Link>

        <Link
          href="/dhow-manager/reports"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Analytics & Reports</h3>
          <p className="text-xs text-slate-500 mt-1">Revenue, occupancy rates, quota fulfillment, and escrow audits.</p>
        </Link>
      </div>

      {/* Operational Highlights Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Ship className="w-5 h-5 text-amber-600" /> Key Dhow Management Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dhow-manager/vessels"
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors block"
          >
            <span className="font-semibold text-slate-800 text-sm block">Vessels & Packages</span>
            <span className="text-xs text-slate-500">Configure Dhow capacities, minimum quotas, and dining packages.</span>
          </Link>

          <Link
            href="/dhow-manager/schedules"
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors block"
          >
            <span className="font-semibold text-slate-800 text-sm block">Digital Check-In & Manifests</span>
            <span className="text-xs text-slate-500">Open a schedule to generate daily sailing list & check in guests.</span>
          </Link>

          <Link
            href="/dhow-manager/schedules"
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors block"
          >
            <span className="font-semibold text-slate-800 text-sm block">Dynamic Table Layouts</span>
            <span className="text-xs text-slate-500">Configure 8 or 12 tables dynamically per sailing and assign seats.</span>
          </Link>
        </div>
      </div>
    </div>
  );
}