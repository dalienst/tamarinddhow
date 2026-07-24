"use client";

import React, { useState, useMemo } from "react";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { useFetchSchedules, useFetchDhows } from "@/hooks/vessels/actions";
import { FileSpreadsheet, TrendingUp, BarChart3, ShieldAlert, Download, DollarSign, Users, Calendar, Filter } from "lucide-react";
import toast from "react-hot-toast";

export default function ManagerReportsPage() {
  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDhow, setSelectedDhow] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Query Hooks
  const { data: dhowsData } = useFetchDhows();
  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules();
  const { data: bookingsData, isLoading: loadingBookings } = useFetchBookings();

  const dhows = dhowsData?.results || [];
  const schedules = schedulesData?.results || [];
  const bookings = bookingsData?.results || [];

  // Filter logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Date filter (based on schedule date if available, or created_at)
      const bookingDateStr = b.schedule_date || b.created_at.substring(0, 10);
      if (startDate && bookingDateStr < startDate) return false;
      if (endDate && bookingDateStr > endDate) return false;

      // 2. Dhow filter (requires schedule lookup or checking package/vessel name)
      // Since booking doesn't have dhow ID directly, we map dhow name if filtered
      if (selectedDhow) {
        // Find matching schedule to get dhow ID
        const sched = schedules.find((s) => s.id === b.schedule);
        if (!sched || sched.dhow !== selectedDhow) return false;
      }

      // 3. Status filter
      if (selectedStatus && b.status !== selectedStatus) return false;

      return true;
    });
  }, [bookings, schedules, startDate, endDate, selectedDhow, selectedStatus]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;
      if (selectedDhow && s.dhow !== selectedDhow) return false;
      return true;
    });
  }, [schedules, startDate, endDate, selectedDhow]);

  // Aggregated Stat Calculations
  const stats = useMemo(() => {
    // 1. Gross Revenue (KES): confirmed/completed bookings total
    const grossRevenue = filteredBookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + parseFloat((b.total_amount || 0).toString()), 0);

    // 2. Occupancy rate (%): (sum of actual passengers / sum of vessel capacities)
    let totalCap = 0;
    let totalPax = 0;
    filteredSchedules.forEach((s) => {
      // Lookup vessel capacity
      const vessel = dhows.find((d) => d.id === s.dhow);
      const cap = vessel?.total_capacity || 60; // default dhow cap
      totalCap += cap;
      totalPax += s.current_pax_count;
    });
    const avgOccupancy = totalCap > 0 ? (totalPax / totalCap) * 100 : 0;

    // 3. Quota fulfillment (%): % of active (not cancelled) schedules that met min quota
    const activeScheds = filteredSchedules.filter((s) => s.status !== "cancelled");
    const quotaMetCount = activeScheds.filter((s) => s.is_quota_met).length;
    const quotaFulfillment = activeScheds.length > 0 ? (quotaMetCount / activeScheds.length) * 100 : 0;

    // 4. Refund Rate (%): percentage of cancelled bookings
    const totalBookings = filteredBookings.length;
    const cancelledCount = filteredBookings.filter((b) => b.status === "cancelled").length;
    const refundRate = totalBookings > 0 ? (cancelledCount / totalBookings) * 100 : 0;

    return {
      grossRevenue,
      avgOccupancy,
      quotaFulfillment,
      refundRate,
      totalBookings,
    };
  }, [filteredBookings, filteredSchedules, dhows]);

  // CSV Exporter
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error("No booking records found for the current filters.");
      return;
    }

    const headers = [
      "Booking Reference",
      "Guest Name",
      "Email Address",
      "Voyage Date",
      "Sailing Time",
      "Vessel / Dhow",
      "Party Size",
      "Dining Menu",
      "Amount Paid (KES)",
      "Booking Status",
      "Cancellation Choice"
    ];

    const rows = filteredBookings.map((b) => {
      const sched = schedules.find((s) => s.id === b.schedule);
      return [
        b.reference,
        b.booked_by_name || "Walk-In Guest",
        b.booked_by_email || "—",
        b.schedule_date || "—",
        sched ? `${sched.departure_time.substring(0,5)} - ${sched.return_time.substring(0,5)}` : "—",
        sched?.dhow_name || "—",
        b.party_size,
        b.package_name || "Standard",
        b.total_amount,
        b.status_display || b.status,
        b.cancellation_preference
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Dhow_Operational_Report_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedDhow("");
    setSelectedStatus("");
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-8 h-8 text-amber-600" /> Operational Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze revenues, vessel occupancy ratios, passenger counts, and download audit logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Operations Log (CSV)
        </button>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Filter className="w-4 h-4 text-slate-500" /> Filter Criteria
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Vessel</label>
            <select
              value={selectedDhow}
              onChange={(e) => setSelectedDhow(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All Vessels</option>
              {dhows.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Booking Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed (Sailed)</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
          <div>
            <button
              onClick={clearFilters}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW METRIC CARD WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            KES {stats.grossRevenue.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 font-medium">From verified confirmed sailings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Avg Occupancy Rate</span>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats.avgOccupancy.toFixed(1)}%
          </div>
          <span className="text-xs text-slate-500 font-medium">Capacity filled across selected period</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Quota Fulfillment</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats.quotaFulfillment.toFixed(1)}%
          </div>
          <span className="text-xs text-slate-500 font-medium">Sailings meeting minimum quota limit</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Cancellation Rate</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats.refundRate.toFixed(1)}%
          </div>
          <span className="text-xs text-slate-500 font-medium">Out of {stats.totalBookings} total bookings</span>
        </div>
      </div>

      {/* DETAILED BOOKING LOG */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-800 text-base">Detailed Passenger Booking Records ({filteredBookings.length})</h2>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Historical Logs</span>
        </div>

        {loadingBookings ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
            Loading operational tables...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            No bookings match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Guest & Contact</th>
                  <th className="px-6 py-3.5">Voyage Date</th>
                  <th className="px-6 py-3.5">Dhow</th>
                  <th className="px-6 py-3.5 text-center">Pax</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const sched = schedules.find((s) => s.id === b.schedule);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">{b.reference}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{b.booked_by_name || "Walk-In Guest"}</div>
                        <div className="text-[10px] text-slate-400">{b.booked_by_email || "no-email@walkin.com"}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-500 text-xs">
                        {b.schedule_date || "—"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-xs">
                        {sched?.dhow_name || "—"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-center">{b.party_size}</td>
                      <td className="px-6 py-4 font-extrabold text-amber-700">
                        KES {parseFloat((b.total_amount || 0).toString()).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {b.booking_type.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === "confirmed" || b.status === "completed"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            : b.status === "cancelled"
                            ? "bg-rose-50 text-rose-800 border border-rose-100"
                            : "bg-amber-50 text-amber-800 border border-amber-100"
                        }`}>
                          {b.status_display || b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
