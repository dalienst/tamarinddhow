"use client";

import React, { useState } from "react";
import { FileSpreadsheet, TrendingUp, BarChart3, ShieldAlert, Download, DollarSign, Users } from "lucide-react";

export default function ManagerReportsPage() {
  const [timeframe, setTimeframe] = useState<"daily" | "monthly">("monthly");

  const revenueData = [
    { period: "July 2026", total_revenue: 1245000, total_bookings: 28, confirmed: 26, cancelled: 2 },
    { period: "June 2026", total_revenue: 1180000, total_bookings: 25, confirmed: 24, cancelled: 1 },
    { period: "May 2026", total_revenue: 950000, total_bookings: 20, confirmed: 18, cancelled: 2 },
  ];

  const occupancyData = [
    { dhow: "Tamarind Dhow I", capacity_offered: 1200, guests_sailed: 1050, occupancy_rate: 87.5, quota_fulfillment: 92.0 },
    { dhow: "Tamarind Dhow II", capacity_offered: 900, guests_sailed: 720, occupancy_rate: 80.0, quota_fulfillment: 85.0 },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-600" /> Manager Operational & Financial Reports
          </h1>
          <p className="text-sm text-slate-500">
            Comprehensive reporting for revenues, occupancy rates, minimum quota fulfillment, escrow holdings, and refund audits.
          </p>
        </div>

        <button
          onClick={() => alert("Report CSV export generated!")}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export All Reports (CSV)
        </button>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">KES 3,375,000</div>
          <span className="text-xs text-emerald-600 font-semibold">+14.2% from last quarter</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Avg Occupancy Rate</span>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">84.2%</div>
          <span className="text-xs text-slate-500 font-medium">Across all vessel sailings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Quota Fulfillment</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">89.5%</div>
          <span className="text-xs text-amber-600 font-semibold">Min quota met on 89.5% sailings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Refund Rate</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">4.8%</div>
          <span className="text-xs text-slate-500 font-medium">Weather & low quota cancellations</span>
        </div>
      </div>

      {/* Revenue Report Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">Monthly Revenue Breakdown</h2>
          <div className="text-xs text-slate-500 font-medium">Currency: KES</div>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Period</th>
              <th className="px-6 py-3.5">Total Bookings</th>
              <th className="px-6 py-3.5">Confirmed</th>
              <th className="px-6 py-3.5">Cancelled</th>
              <th className="px-6 py-3.5">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {revenueData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80">
                <td className="px-6 py-4 font-bold text-slate-900">{row.period}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{row.total_bookings}</td>
                <td className="px-6 py-4 text-emerald-700 font-semibold">{row.confirmed}</td>
                <td className="px-6 py-4 text-rose-600 font-semibold">{row.cancelled}</td>
                <td className="px-6 py-4 font-extrabold text-amber-700">KES {row.total_revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Occupancy & Quota Report Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Vessel Occupancy & Minimum Quota Fulfillment</h2>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Vessel Name</th>
              <th className="px-6 py-3.5">Capacity Offered</th>
              <th className="px-6 py-3.5">Guests Sailed</th>
              <th className="px-6 py-3.5">Occupancy Rate</th>
              <th className="px-6 py-3.5">Quota Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {occupancyData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80">
                <td className="px-6 py-4 font-bold text-slate-900">{row.dhow}</td>
                <td className="px-6 py-4">{row.capacity_offered} Seats</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{row.guests_sailed} Guests</td>
                <td className="px-6 py-4 font-bold text-indigo-700">{row.occupancy_rate}%</td>
                <td className="px-6 py-4 font-bold text-emerald-700">{row.quota_fulfillment}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
