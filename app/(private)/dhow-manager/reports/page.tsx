"use client";

import React, { useState, useMemo } from "react";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { useFetchSchedules, useFetchDhows } from "@/hooks/vessels/actions";
import { useFetchPayments } from "@/hooks/payments/actions";
import { FileSpreadsheet, TrendingUp, BarChart3, ShieldAlert, Download, DollarSign, Users, Calendar, Filter, CreditCard, Coins, Receipt } from "lucide-react";
import toast from "react-hot-toast";

export default function ManagerReportsPage() {
  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDhow, setSelectedDhow] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentMethodFilter, setSelectedPaymentMethodFilter] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"bookings" | "attendance" | "analytics">("bookings");
  const [selectedAnalyticsScheduleId, setSelectedAnalyticsScheduleId] = useState<string>("");


  // Query Hooks
  const { data: dhowsData } = useFetchDhows();
  const { data: schedulesData, isLoading: loadingSchedules } = useFetchSchedules({ page_size: 1000 });
  const { data: bookingsData, isLoading: loadingBookings } = useFetchBookings({ page_size: 1000 });
  const { data: paymentsData } = useFetchPayments({ page_size: 1000 });

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

  const filteredPayments = useMemo(() => {
    const bookingIds = new Set(filteredBookings.map((b) => b.id));
    return (paymentsData?.results || []).filter(
      (p) => bookingIds.has(p.booking) && p.status === "completed"
    );
  }, [paymentsData, filteredBookings]);

  const displayedBookings = useMemo(() => {
    if (!selectedPaymentMethodFilter) return filteredBookings;
    const matchingBookingIds = new Set(
      filteredPayments
        .filter((p) => p.payment_method === selectedPaymentMethodFilter)
        .map((p) => p.booking)
    );
    return filteredBookings.filter((b) => matchingBookingIds.has(b.id));
  }, [filteredBookings, filteredPayments, selectedPaymentMethodFilter]);



  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;
      if (selectedDhow && s.dhow !== selectedDhow) return false;
      return true;
    });
  }, [schedules, startDate, endDate, selectedDhow]);

  // Auto-select first schedule for analytics if not set or if it's no longer in the list
  React.useEffect(() => {
    if (filteredSchedules.length > 0) {
      const exists = filteredSchedules.some(s => s.id === selectedAnalyticsScheduleId);
      if (!exists) {
        setSelectedAnalyticsScheduleId(filteredSchedules[0].id);
      }
    } else {
      setSelectedAnalyticsScheduleId("");
    }
  }, [filteredSchedules, selectedAnalyticsScheduleId]);

  // Aggregated Stat Calculations
  const stats = useMemo(() => {
    // 1. Gross Revenue (KES): confirmed/completed bookings total expected billing
    const grossRevenue = filteredBookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + parseFloat((b.total_amount || 0).toString()), 0);

    // 1b. Actual Cash Collected (KES): sum of total_paid for confirmed/completed bookings
    const cashCollected = filteredBookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + parseFloat((b.total_paid || 0).toString()), 0);

    // 1c. Outstanding Balances / Accounts Receivable (KES): sum of outstanding_balance for active/completed bookings
    const outstandingBalance = filteredBookings
      .filter((b) => b.status !== "cancelled" && b.status !== "no_show")
      .reduce((sum, b) => sum + parseFloat((b.outstanding_balance || 0).toString()), 0);

    // 1d. Total Discounts Granted (KES): sum of discount_amount for active bookings
    const totalDiscounts = filteredBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + parseFloat((b.discount_amount || 0).toString()), 0);

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

    // 5. Payment method breakdowns
    const mpesaTotal = filteredPayments
      .filter((p) => p.payment_method === "mpesa")
      .reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

    const cashTotal = filteredPayments
      .filter((p) => p.payment_method === "cash")
      .reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

    const visaTotal = filteredPayments
      .filter((p) => p.payment_method === "visa")
      .reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

    const mastercardTotal = filteredPayments
      .filter((p) => p.payment_method === "mastercard")
      .reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

    const staffCardTotal = filteredPayments
      .filter((p) => p.payment_method === "staff_card")
      .reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

    const agentCreditTotal = filteredPayments
      .filter((p) => p.payment_method === "agent_credit")
      .reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

    const waivedTotal = filteredPayments
      .filter((p) => p.payment_method === "waived")
      .reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

    return {
      grossRevenue,
      cashCollected,
      outstandingBalance,
      totalDiscounts,
      avgOccupancy,
      quotaFulfillment,
      refundRate,
      totalBookings,
      mpesaTotal,
      cashTotal,
      visaTotal,
      mastercardTotal,
      staffCardTotal,
      agentCreditTotal,
      waivedTotal,
    };
  }, [filteredBookings, filteredSchedules, dhows, filteredPayments]);


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
      "Custom Price Adult (KES)",
      "Custom Price Child (KES)",
      "Total Cost (KES)",
      "Discount Type",
      "Discount Value",
      "Discount (KES)",
      "Cash Collected (KES)",
      "Outstanding Balance (KES)",
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
        b.custom_price_per_person || "—",
        b.custom_price_per_child || "—",
        b.total_amount,
        b.discount_type || "amount",
        b.discount_value || 0,
        b.discount_amount || 0,
        b.total_paid || 0,
        b.outstanding_balance || 0,
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

  // Sailing Attendance Aggregation
  const sailingAttendanceStats = useMemo(() => {
    return filteredSchedules.map((s) => {
      // Find all bookings for this schedule (excluding cancelled)
      const associatedBookings = bookings.filter((b) => b.schedule === s.id && b.status !== "cancelled");
      
      const bookedPax = associatedBookings.reduce((sum, b) => sum + b.party_size, 0);
      
      let onboardedPax = 0;
      let noShowPax = 0;
      
      associatedBookings.forEach((b) => {
        const guests = b.booking_guests || [];
        const checkedInCount = guests.filter((g) => g.status === "checked_in").length;
        const noShowCount = guests.filter((g) => g.status === "no_show").length;
        
        onboardedPax += checkedInCount;
        noShowPax += noShowCount;
      });

      const isCompleted = s.status === "completed";
      const totalNoShows = isCompleted ? Math.max(0, bookedPax - onboardedPax) : noShowPax;
      const plateVariance = isCompleted ? Math.max(0, bookedPax - onboardedPax) : 0;
      const attendanceRate = bookedPax > 0 ? (onboardedPax / bookedPax) * 100 : 0;
      
      return {
        scheduleId: s.id,
        reference: s.reference,
        date: s.date,
        dhowName: s.dhow_name || "Unknown Vessel",
        mealType: s.meal_type_display || "Voyage",
        status: s.status,
        bookedPax,
        onboardedPax,
        noShowPax: totalNoShows,
        plateVariance,
        attendanceRate,
      };
    });
  }, [filteredSchedules, bookings]);

  // Export Sailing Attendance CSV
  const handleExportAttendanceCSV = () => {
    if (sailingAttendanceStats.length === 0) {
      toast.error("No sailing records found for the current filters.");
      return;
    }

    const headers = [
      "Voyage Date",
      "Vessel / Dhow",
      "Meal Session",
      "Sailing Status",
      "Booked Passengers",
      "Onboarded Passengers",
      "No Shows / Absentees",
      "Variance (Wasted Plates)",
      "Attendance Rate (%)"
    ];

    const rows = sailingAttendanceStats.map((s) => [
      s.date,
      s.dhowName,
      s.mealType,
      s.status.toUpperCase(),
      s.bookedPax,
      s.onboardedPax,
      s.noShowPax,
      s.plateVariance,
      s.attendanceRate.toFixed(1)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sailing_Attendance_Report_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendance report CSV downloaded successfully!");
  };

  // Voyage-specific granular analytics calculation
  const selectedSailingAnalytics = useMemo(() => {
    if (!selectedAnalyticsScheduleId) return null;
    
    // Find the schedule details
    const schedule = schedules.find((s) => s.id === selectedAnalyticsScheduleId);
    if (!schedule) return null;

    // Filter bookings for this schedule (exclude cancelled)
    const activeBookings = bookings.filter(
      (b) => b.schedule === selectedAnalyticsScheduleId && b.status !== "cancelled"
    );

    // Compute standard metrics
    const bookedPax = activeBookings.reduce((sum, b) => sum + b.party_size, 0);
    const adultCount = activeBookings.reduce((sum, b) => sum + (b.adult_count || b.party_size), 0);
    const childCount = activeBookings.reduce((sum, b) => sum + (b.child_count || 0), 0);

    let onboardedPax = 0;
    let noShowPax = 0;
    let pendingPax = 0;

    activeBookings.forEach((b) => {
      const guests = b.booking_guests || [];
      const checkedIn = guests.filter((g) => g.status === "checked_in").length;
      const noShow = guests.filter((g) => g.status === "no_show").length;
      const pending = guests.filter((g) => g.status === "pending" || !g.status).length;

      onboardedPax += checkedIn;
      noShowPax += noShow;
      pendingPax += pending;
    });

    const isCompleted = schedule.status === "completed";
    const finalNoShows = isCompleted ? Math.max(0, bookedPax - onboardedPax) : noShowPax;
    const finalPending = isCompleted ? 0 : pendingPax;

    // Financials
    const totalExpected = activeBookings.reduce((sum, b) => sum + parseFloat((b.total_amount || 0).toString()), 0);
    const totalPaid = activeBookings.reduce((sum, b) => sum + parseFloat((b.total_paid || 0).toString()), 0);
    const totalOutstanding = activeBookings.reduce((sum, b) => sum + parseFloat((b.outstanding_balance || 0).toString()), 0);

    // Occupancy
    const dhow = dhows.find((d) => d.id === schedule.dhow);
    const capacity = dhow?.total_capacity || 60;
    const occupancyRate = capacity > 0 ? (bookedPax / capacity) * 100 : 0;
    const checkinRate = bookedPax > 0 ? (onboardedPax / bookedPax) * 100 : 0;

    // Menu packages composition
    const packageMap: Record<string, number> = {};
    activeBookings.forEach((b) => {
      const pkg = b.package_name || "Standard Menu";
      packageMap[pkg] = (packageMap[pkg] || 0) + b.party_size;
    });
    const packages = Object.entries(packageMap).map(([name, count]) => ({ name, count }));

    // Addons composition
    const addonMap: Record<string, { count: number; value: number }> = {};
    activeBookings.forEach((b) => {
      (b.booking_addons || []).forEach((ba) => {
        const name = ba.addon_name || "Addon";
        const val = parseFloat((ba.total_price || 0).toString());
        if (!addonMap[name]) {
          addonMap[name] = { count: 0, value: 0 };
        }
        addonMap[name].count += ba.quantity;
        addonMap[name].value += val;
      });
    });
    const addons = Object.entries(addonMap).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value,
    }));

    return {
      schedule,
      bookedPax,
      adultCount,
      childCount,
      onboardedPax,
      noShowPax: finalNoShows,
      pendingPax: finalPending,
      totalExpected,
      totalPaid,
      totalOutstanding,
      capacity,
      occupancyRate,
      checkinRate,
      packages,
      addons,
    };
  }, [selectedAnalyticsScheduleId, schedules, bookings, dhows]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedDhow("");
    setSelectedStatus("");
    setSelectedPaymentMethodFilter("");
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
          onClick={activeTab === "bookings" ? handleExportCSV : handleExportAttendanceCSV}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Download className="w-4 h-4" /> {activeTab === "bookings" ? "Export Operations Log (CSV)" : "Export Sailing Attendance (CSV)"}
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
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            KES {stats.grossRevenue.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 font-medium">Total expected booking value</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Actual Cash Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            KES {stats.cashCollected.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600/90 font-medium">Total realized cash collections</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Outstanding Receivable</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-700">
            KES {stats.outstandingBalance.toLocaleString()}
          </div>
          <span className="text-xs text-amber-600 font-medium">Expected remaining due balances</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Discounts Allowed</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-700">
            KES {stats.totalDiscounts.toLocaleString()}
          </div>
          <span className="text-xs text-rose-500 font-medium">Total discounts applied to voyages</span>
        </div>
      </div>
      {/* COLLECTIONS BREAKDOWN SECTION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-800 text-sm font-bold uppercase tracking-wider border-b border-slate-100 pb-3 gap-2">
          <span className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" /> Cash Collected Breakdown by Payment Method
          </span>
          <span className="text-xs text-emerald-700 font-extrabold font-mono bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
            Total realized: KES {stats.cashCollected.toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-xs pt-1">
          {[
            { id: "mpesa", label: "M-Pesa", total: stats.mpesaTotal, color: "emerald" },
            { id: "cash", label: "Cash", total: stats.cashTotal, color: "emerald" },
            { id: "visa", label: "Visa", total: stats.visaTotal, color: "indigo" },
            { id: "mastercard", label: "Mastercard", total: stats.mastercardTotal, color: "indigo" },
            { id: "staff_card", label: "Staff Card", total: stats.staffCardTotal, color: "amber" },
            { id: "agent_credit", label: "Agent Credit", total: stats.agentCreditTotal, color: "slate" },
            { id: "waived", label: "Waived", total: stats.waivedTotal, color: "slate" },
          ].map((p) => {
            const isSelected = selectedPaymentMethodFilter === p.id;
            
            // Custom card themes depending on choice
            let cardStyle = "bg-slate-50 border-slate-200 text-slate-800";
            let labelStyle = "text-slate-400";
            if (p.color === "amber") {
              cardStyle = "bg-amber-50/50 border-amber-200/60 text-slate-800";
              labelStyle = "text-amber-700";
            }
            
            // Apply selected highlight classes
            if (isSelected) {
              cardStyle = "bg-amber-600 text-white border-amber-700 ring-2 ring-amber-500/30 shadow-sm font-semibold";
              labelStyle = "text-amber-100";
            }

            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedPaymentMethodFilter((prev) => prev === p.id ? "" : p.id)}
                className={`space-y-1 p-3 border rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-sm active:scale-95 flex flex-col justify-between ${cardStyle}`}
                title={`Click to filter list by ${p.label}`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${labelStyle}`}>
                  {p.label}
                </span>
                <span className="text-base font-black">
                  KES {p.total.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* OPERATIONAL RATIOS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "bookings"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Detailed Bookings
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "attendance"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Sailing Attendance & Food Cost
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "analytics"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Sailing List Analytics
        </button>
      </div>

      {activeTab === "bookings" ? (
        /* DETAILED BOOKING LOG */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                Detailed Passenger Booking Records ({displayedBookings.length})
                {selectedPaymentMethodFilter && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                    Filtered by: {selectedPaymentMethodFilter.replace("_", " ")}
                  </span>
                )}
              </h2>
              {selectedPaymentMethodFilter && (
                <p className="text-[11px] text-slate-400 font-semibold">
                  Showing only reservations with completed payments matching the clicked method.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedPaymentMethodFilter && (
                <button
                  onClick={() => setSelectedPaymentMethodFilter("")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors mr-2"
                >
                  Show All Methods
                </button>
              )}
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Historical Logs</span>
            </div>
          </div>

          {loadingBookings ? (
            <div className="p-12 text-center text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
              Loading operational tables...
            </div>
          ) : displayedBookings.length === 0 ? (
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
                    <th className="px-6 py-3.5 text-center">Pax</th>
                    <th className="px-6 py-3.5">Total Cost</th>
                    <th className="px-6 py-3.5">Discount</th>
                    <th className="px-6 py-3.5">Paid</th>
                    <th className="px-6 py-3.5">Balance</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedBookings.map((b) => {
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
                        <td className="px-6 py-4 font-bold text-slate-800 text-center">{b.party_size}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          KES {parseFloat((b.total_amount || 0).toString()).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-rose-700">
                          {parseFloat((b.discount_amount || 0).toString()) > 0 
                            ? `KES ${parseFloat((b.discount_amount || 0).toString()).toLocaleString()}` 
                            : "—"}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-700">
                          KES {parseFloat((b.total_paid || 0).toString()).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-amber-700">
                          KES {parseFloat((b.outstanding_balance || 0).toString()).toLocaleString()}
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
      ) : activeTab === "attendance" ? (
        /* SAILING ATTENDANCE LOG */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-800 text-base">
                Sailing Attendance & Food Cost Variance ({sailingAttendanceStats.length})
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold">
                Variance tracks prepared plates not consumed (Booked Pax minus Checked-in Pax) on completed voyages.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Attendance Logs</span>
          </div>

          {loadingSchedules || loadingBookings ? (
            <div className="p-12 text-center text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
              Loading sailing reports...
            </div>
          ) : sailingAttendanceStats.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium">
              No sailing voyages found for the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Voyage Details</th>
                    <th className="px-6 py-3.5">Vessel</th>
                    <th className="px-6 py-3.5">Meal Session</th>
                    <th className="px-6 py-3.5 text-center">Booked Pax</th>
                    <th className="px-6 py-3.5 text-center">Onboarded Pax</th>
                    <th className="px-6 py-3.5 text-center">No Shows</th>
                    <th className="px-6 py-3.5 text-center bg-rose-50/50">Wasted Plates (Variance)</th>
                    <th className="px-6 py-3.5 text-right">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sailingAttendanceStats.map((s) => {
                    const isCompleted = s.status === "completed";
                    return (
                      <tr key={s.scheduleId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{s.date}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {s.reference}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{s.dhowName}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-600 text-xs">{s.mealType}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">{s.bookedPax}</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-700">{s.onboardedPax}</td>
                        <td className="px-6 py-4 text-center font-semibold text-rose-600">{s.noShowPax}</td>
                        <td className={`px-6 py-4 text-center font-extrabold bg-rose-50/20 ${s.plateVariance > 0 ? "text-amber-600" : "text-slate-400"}`}>
                          {isCompleted ? (
                            s.plateVariance > 0 ? `+${s.plateVariance} plates` : "0 (Perfect match)"
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold italic">Sailing Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">
                          {s.attendanceRate.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* SAILING LIST ANALYTICS */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-800 text-base">Sailing Manifest Logistics & Insights</h2>
              <p className="text-[11px] text-slate-400 font-semibold">Select a voyage to analyze its check-in ratios, prepared dining menus, and extra add-ons.</p>
            </div>
            <div className="w-full sm:w-72">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Voyage</label>
              {filteredSchedules.length === 0 ? (
                <div className="text-xs text-rose-500 font-bold">No active voyages found.</div>
              ) : (
                <select
                  value={selectedAnalyticsScheduleId}
                  onChange={(e) => setSelectedAnalyticsScheduleId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-amber-500/20"
                >
                  {filteredSchedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.date} • {s.dhow_name} ({s.meal_type_display})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {selectedSailingAnalytics ? (
            <div className="space-y-6">
              {/* Sub Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity Occupancy</span>
                  <span className="text-lg font-black text-slate-900">
                    {selectedSailingAnalytics.bookedPax} / {selectedSailingAnalytics.capacity} seats
                  </span>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, selectedSailingAnalytics.occupancyRate)}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    {selectedSailingAnalytics.occupancyRate.toFixed(1)}% Capacity Filled
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                  <span className="text-lg font-black text-emerald-800">
                    {selectedSailingAnalytics.onboardedPax} / {selectedSailingAnalytics.bookedPax} onboarded
                  </span>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, selectedSailingAnalytics.checkinRate)}%` }} />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                    {selectedSailingAnalytics.checkinRate.toFixed(1)}% Boarded
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guest Composition</span>
                  <span className="text-lg font-black text-slate-900">
                    {selectedSailingAnalytics.bookedPax} total guests
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-3">
                    {selectedSailingAnalytics.adultCount} Adults • {selectedSailingAnalytics.childCount} Children
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sailing Collections</span>
                  <span className="text-lg font-black text-emerald-800">
                    KES {selectedSailingAnalytics.totalPaid.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-3">
                    KES {selectedSailingAnalytics.totalOutstanding.toLocaleString()} Outstanding (KES {selectedSailingAnalytics.totalExpected.toLocaleString()} Expected)
                  </span>
                </div>
              </div>

              {/* Detailed breakdown grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Prepared Plates / Dining Menu counts */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30 space-y-3 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Dining Plates Required
                  </h3>
                  {selectedSailingAnalytics.packages.length === 0 ? (
                    <div className="text-slate-400 text-xs font-semibold py-8 text-center">No plate orders recorded.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSailingAnalytics.packages.map((pkg) => (
                        <div key={pkg.name} className="flex items-center justify-between text-xs py-1">
                          <span className="font-semibold text-slate-600">{pkg.name}</span>
                          <span className="font-extrabold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                            {pkg.count} plates
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Add-ons */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30 space-y-3 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Custom Add-ons Ordered
                  </h3>
                  {selectedSailingAnalytics.addons.length === 0 ? (
                    <div className="text-slate-400 text-xs font-semibold py-8 text-center">No extra add-ons ordered.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSailingAnalytics.addons.map((add) => (
                        <div key={add.name} className="flex items-center justify-between text-xs py-1">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-600">{add.name}</span>
                            <span className="text-[10px] text-slate-400 block font-semibold">Value: KES {add.value.toLocaleString()}</span>
                          </div>
                          <span className="font-extrabold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                            x{add.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attendance & Check-in Checklist composition */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30 space-y-3 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Check-in Attendance Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-800">Boarded / Checked-in</span>
                      <span className="font-extrabold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {selectedSailingAnalytics.onboardedPax} guests
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-700">No Shows / Absentees</span>
                      <span className="font-extrabold text-rose-900 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        {selectedSailingAnalytics.noShowPax} guests
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">Pending Attendance</span>
                      <span className="font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                        {selectedSailingAnalytics.pendingPax} guests
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">No voyage selected or no data available.</div>
          )}
        </div>
      )}
    </div>
  );
}
