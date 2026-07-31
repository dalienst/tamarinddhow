"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Schedule, Dhow, MealType } from "@/types/dhow";
import { openSchedule, closeSchedule, confirmSchedule, cancelSchedule, createSchedule, updateSchedule } from "@/services/vessels";
import { useFetchSchedules, useFetchDhows } from "@/hooks/vessels/actions";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import {
  Calendar as CalendarIcon,
  Ship,
  CheckCircle,
  XCircle,
  Users,
  Table,
  QrCode,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  X,
  Info,
  Clock,
  AlertTriangle,
  Loader2,
  Pencil
} from "lucide-react";
import toast from "react-hot-toast";

export default function ScheduleCenterPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedulesData, isLoading: loadingSchedules, refetch: refetchSchedules } = useFetchSchedules();
  const { data: dhowsData, isLoading: loadingDhows } = useFetchDhows();

  const schedules = schedulesData?.results || [];
  const dhows = dhowsData?.results || [];

  // Toggle layout states
  const viewMode = "calendar";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Schedule form state
  const [selectedDhow, setSelectedDhow] = useState("");
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState<MealType>("sunset_cruise");
  const [departureTime, setDepartureTime] = useState("18:30");
  const [returnTime, setReturnTime] = useState("22:30");
  const [pricePerPerson, setPricePerPerson] = useState("6800");
  const [pricePerChild, setPricePerChild] = useState("3400");
  const [exclusiveFlatFee, setExclusiveFlatFee] = useState("272000");
  const [notes, setNotes] = useState("");
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean;
    ref: string;
  }>({ isOpen: false, ref: "" });
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Edit Schedule form state
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editDhow, setEditDhow] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editMealType, setEditMealType] = useState<MealType>("sunset_cruise");
  const [editDepartureTime, setEditDepartureTime] = useState("");
  const [editReturnTime, setEditReturnTime] = useState("");
  const [editPricePerPerson, setEditPricePerPerson] = useState("");
  const [editPricePerChild, setEditPricePerChild] = useState("");
  const [editExclusiveFlatFee, setEditExclusiveFlatFee] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (dhows.length > 0 && !selectedDhow) {
      setSelectedDhow(dhows[0].id);
    }
  }, [dhows, selectedDhow]);

  if (loadingSchedules || loadingDhows) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If a date is clicked on calendar, pre-fill and open drawer or modal
  const handleDayClick = (dayDate: Date) => {
    setSelectedDate(dayDate);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDhow || !date) return toast.error("Please select a dhow and date.");
    setIsSaving(true);
    try {
      await createSchedule({
        dhow: selectedDhow,
        date,
        meal_type: mealType,
        departure_time: departureTime,
        return_time: returnTime,
        price_per_person: parseFloat(pricePerPerson),
        price_per_child: parseFloat(pricePerChild),
        exclusive_flat_fee: parseFloat(exclusiveFlatFee),
        status: "scheduled",
        is_open: true,
        notes,
      }, token);
      toast.success("New sailing schedule created!");
      setIsCreateModalOpen(false);
      setDate("");
      setNotes("");
      refetchSchedules();
    } catch (err) {
      toast.error("Failed to create schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;
    setIsSaving(true);
    try {
      await updateSchedule(
        editingSchedule.reference,
        {
          dhow: editDhow,
          date: editDate,
          meal_type: editMealType,
          departure_time: editDepartureTime,
          return_time: editReturnTime,
          price_per_person: parseFloat(editPricePerPerson),
          price_per_child: parseFloat(editPricePerChild),
          exclusive_flat_fee: parseFloat(editExclusiveFlatFee),
          notes: editNotes,
        },
        token
      );
      toast.success("Voyage details updated successfully!");
      setEditingSchedule(null);
      refetchSchedules();
    } catch (err) {
      toast.error("Failed to update schedule details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = async (ref: string, action: "open" | "close" | "confirm" | "cancel") => {
    if (action === "cancel") {
      setCancelModalState({ isOpen: true, ref });
      return;
    }

    const key = `${ref}-${action}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      if (action === "open") await openSchedule(ref, token);
      if (action === "close") await closeSchedule(ref, token);
      if (action === "confirm") await confirmSchedule(ref, token);
      toast.success(`Schedule ${ref} updated!`);
      refetchSchedules();
    } catch (err) {
      toast.error(`Failed to ${action} schedule.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Calendar Math Helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const daysArray: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(year, month, i));
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper for Quota Progress Rendering
  const renderQuotaBar = (s: Schedule) => {
    const dhow = dhows.find((d) => d.id === s.dhow);
    const capacity = dhow ? dhow.total_capacity : (s.current_pax_count + s.available_capacity);
    const minQuota = dhow ? dhow.min_quota : 10;
    const pax = s.current_pax_count;

    const paxPercentage = Math.min((pax / capacity) * 100, 100);
    const quotaPercentage = Math.min((minQuota / capacity) * 100, 100);
    const isQuotaMet = pax >= minQuota;

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Guests Check-In: <strong className="text-slate-800">{pax} / {capacity} Pax</strong></span>
          <span className={`font-bold ${isQuotaMet ? "text-emerald-600" : "text-amber-600"}`}>
            {isQuotaMet ? "Quota Met" : `Quota Needs: ${minQuota}`}
          </span>
        </div>
        <div className="relative h-2 bg-slate-100 rounded-full overflow-visible border border-slate-200/50">
          {/* Progress fill */}
          <div
            className={`h-full rounded-full transition-all duration-300 ${isQuotaMet ? "bg-emerald-500 shadow-sm" : "bg-amber-500"
              }`}
            style={{ width: `${paxPercentage}%` }}
          />
          {/* Min Quota Marker */}
          <div
            className="absolute top-0 h-full w-[2px] bg-slate-400 border-l border-white"
            style={{ left: `${quotaPercentage}%` }}
            title={`Minimum Quota Threshold: ${minQuota}`}
          />
        </div>
      </div>
    );
  };

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(s => {
      const sDate = new Date(s.date);
      return sDate.getDate() === day.getDate() &&
        sDate.getMonth() === day.getMonth() &&
        sDate.getFullYear() === day.getFullYear();
    });
  };

  const selectedDaySchedules = selectedDate ? getSchedulesForDay(selectedDate) : [];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Controls Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-amber-600" /> Sailing Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Plan voyages, verify passenger quotas, control availability and release funds.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-600/10 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" /> Create Sailing
          </button>
        </div>
      </div>

      {/* Calendar View Mode */}
      {viewMode === "calendar" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          {/* Month Navigator */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-800">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-bold text-slate-500 uppercase tracking-widest py-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 auto-rows-[120px] bg-slate-100 gap-[1px]">
            {daysArray.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="bg-white" />;

              const daySchedules = getSchedulesForDay(day);
              const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div
                  key={`day-${day.getDate()}`}
                  onClick={() => handleDayClick(day)}
                  className={`bg-white p-3 cursor-pointer transition-all flex flex-col justify-between overflow-hidden relative border ${isSelected ? "border-amber-500 ring-1 ring-amber-500/20" : "border-transparent hover:bg-slate-50/50"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-bold ${isToday ? "bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm" : "text-slate-800"
                      }`}>
                      {day.getDate()}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {daySchedules.length} {daySchedules.length === 1 ? "sailing" : "sailings"}
                      </span>
                    )}
                  </div>

                  {/* Day Sailing Mini Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[70px] pr-1 mt-1 scrollbar-thin">
                    {daySchedules.slice(0, 3).map(s => {
                      let colorClass = "bg-blue-50 text-blue-800 border-blue-100"; // Scheduled
                      if (s.status === "confirmed") colorClass = "bg-emerald-50 text-emerald-800 border-emerald-100";
                      if (s.status === "cancelled") colorClass = "bg-rose-50 text-rose-800 border-rose-100";
                      if (!s.is_open) colorClass = "bg-gray-100 text-gray-700 border-gray-200";

                      return (
                        <div
                          key={s.id}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border truncate ${colorClass}`}
                          title={`${s.dhow_name} (${s.meal_type_display})`}
                        >
                          {s.departure_time.substring(0, 5)} {s.dhow_name}
                        </div>
                      );
                    })}
                    {daySchedules.length > 3 && (
                      <div className="text-[8px] text-slate-400 font-bold pl-1">
                        + {daySchedules.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Side Panel Drawer (When day is clicked in Calendar) */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/30 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white shadow-2xl h-full flex flex-col animate-slideLeft">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-900 text-white">
              <div>
                <h3 className="font-extrabold text-lg tracking-tight">Sailing Manifest</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDate.toDateString()}</p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-700 text-sm">Scheduled Trips</span>
                <button
                  onClick={() => {
                    const y = selectedDate.getFullYear();
                    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
                    const d = String(selectedDate.getDate()).padStart(2, "0");
                    setDate(`${y}-${m}-${d}`);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Plan Voyage
                </button>

              </div>

              {selectedDaySchedules.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm font-medium">
                  No voyages scheduled for this date.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDaySchedules.map(s => (
                    <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-base">{s.dhow_name}</span>
                            <StatusBadge status={s.status} type="schedule" />
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.departure_time.substring(0, 5)} - {s.return_time.substring(0, 5)} ({s.meal_type_display})
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${s.is_open ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          }`}>
                          {s.is_open ? "Open" : "Closed"}
                        </span>
                      </div>

                      {renderQuotaBar(s)}

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50">
                        <Link
                          href={`/dhow-manager/schedules/${s.reference}/manifest`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-amber-800 hover:bg-amber-50 font-bold text-xs rounded-lg border border-amber-200/60 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Manifest
                        </Link>
                        <Link
                          href={`/dhow-manager/schedules/${s.reference}/tables`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-800 hover:bg-indigo-50 font-bold text-xs rounded-lg border border-indigo-200/60 transition-colors"
                        >
                          <Table className="w-3.5 h-3.5" /> Seating
                        </Link>
                        <button
                          onClick={() => {
                            setEditingSchedule(s);
                            setEditDhow(s.dhow);
                            setEditDate(s.date);
                            setEditMealType(s.meal_type);
                            setEditDepartureTime(s.departure_time.substring(0, 5));
                            setEditReturnTime(s.return_time.substring(0, 5));
                            setEditPricePerPerson(String(s.price_per_person));
                            setEditPricePerChild(String(s.price_per_child));
                            setEditExclusiveFlatFee(String(s.exclusive_flat_fee));
                            setEditNotes(s.notes || "");
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 hover:bg-slate-50 font-bold text-xs rounded-lg border border-slate-200 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit details
                        </button>

                        {s.is_open ? (
                          <button
                            disabled={actionLoading[`${s.reference}-close`]}
                            onClick={() => handleAction(s.reference, "close")}
                            className="flex items-center justify-center min-w-[50px] px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all disabled:opacity-50"
                          >
                            {actionLoading[`${s.reference}-close`] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "Close"
                            )}
                          </button>
                        ) : (
                          <button
                            disabled={actionLoading[`${s.reference}-open`]}
                            onClick={() => handleAction(s.reference, "open")}
                            className="flex items-center justify-center min-w-[50px] px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-all disabled:opacity-50"
                          >
                            {actionLoading[`${s.reference}-open`] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-800" />
                            ) : (
                              "Open"
                            )}
                          </button>
                        )}

                        {s.status !== "confirmed" && s.status !== "cancelled" && (
                          <button
                            disabled={actionLoading[`${s.reference}-confirm`]}
                            onClick={() => handleAction(s.reference, "confirm")}
                            className="flex items-center justify-center min-w-[60px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                          >
                            {actionLoading[`${s.reference}-confirm`] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                              "Confirm"
                            )}
                          </button>
                        )}

                        {s.status !== "cancelled" && (
                          <button
                            disabled={actionLoading[`${s.reference}-cancel`]}
                            onClick={() => handleAction(s.reference, "cancel")}
                            className="flex items-center justify-center min-w-[60px] px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                          >
                            {actionLoading[`${s.reference}-cancel`] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                              "Cancel"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Sailing Schedule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-extrabold tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-500" /> Plan Sailing Voyage
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Dhow Vessel</label>
                <select
                  value={selectedDhow}
                  disabled={isSaving}
                  onChange={(e) => setSelectedDhow(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                >
                  {dhows.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Sailing Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    disabled={isSaving}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Meal Type</label>
                  <select
                    value={mealType}
                    disabled={isSaving}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  >
                    <option value="lunch">Lunch</option>
                    <option value="sunset_cruise">Sunset Cruise</option>
                    <option value="booze_cruise">Booze Cruise</option>
                    <option value="special_cruise">Special Cruise</option>
                    <option value="dinner_cruise">Dinner Cruise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Departure Time</label>
                  <input
                    type="time"
                    required
                    disabled={isSaving}
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Return Time</label>
                  <input
                    type="time"
                    required
                    disabled={isSaving}
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Price per Adult (KES)</label>
                  <input
                    type="number"
                    required
                    disabled={isSaving}
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Price per Child (KES)</label>
                  <input
                    type="number"
                    required
                    disabled={isSaving}
                    value={pricePerChild}
                    onChange={(e) => setPricePerChild(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Exclusive Flat Fee (KES)</label>
                <input
                  type="number"
                  required
                  disabled={isSaving}
                  value={exclusiveFlatFee}
                  onChange={(e) => setExclusiveFlatFee(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Voyage Notes</label>
                <textarea
                  placeholder="Special instructions for the crew, or details about boarding locations..."
                  value={notes}
                  disabled={isSaving}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 h-20 disabled:opacity-60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/60 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-600/10 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                      Saving...
                    </>
                  ) : (
                    "Plan Voyage"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      {/* Edit Sailing Schedule Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-extrabold tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-500" /> Edit Sailing Voyage
              </h3>
              <button
                onClick={() => setEditingSchedule(null)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSchedule} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Dhow Vessel</label>
                <select
                  value={editDhow}
                  disabled={isSaving}
                  onChange={(e) => setEditDhow(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                >
                  {dhows.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Sailing Date</label>
                  <input
                    type="date"
                    required
                    disabled={isSaving}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Meal Type</label>
                  <select
                    value={editMealType}
                    disabled={isSaving}
                    onChange={(e) => setEditMealType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  >
                    <option value="lunch">Lunch</option>
                    <option value="sunset_cruise">Sunset Cruise</option>
                    <option value="booze_cruise">Booze Cruise</option>
                    <option value="special_cruise">Special Cruise</option>
                    <option value="dinner_cruise">Dinner Cruise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Departure Time</label>
                  <input
                    type="time"
                    required
                    disabled={isSaving}
                    value={editDepartureTime}
                    onChange={(e) => setEditDepartureTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Return Time</label>
                  <input
                    type="time"
                    required
                    disabled={isSaving}
                    value={editReturnTime}
                    onChange={(e) => setEditReturnTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Price per Adult (KES)</label>
                  <input
                    type="number"
                    required
                    disabled={isSaving}
                    value={editPricePerPerson}
                    onChange={(e) => setEditPricePerPerson(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Price per Child (KES)</label>
                  <input
                    type="number"
                    required
                    disabled={isSaving}
                    value={editPricePerChild}
                    onChange={(e) => setEditPricePerChild(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Exclusive Flat Fee (KES)</label>
                <input
                  type="number"
                  required
                  disabled={isSaving}
                  value={editExclusiveFlatFee}
                  onChange={(e) => setEditExclusiveFlatFee(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Voyage Details & Notes</label>
                <textarea
                  placeholder="Boarding info, crew assignments, customized menus, special guests, weather warnings, or sailing details..."
                  value={editNotes}
                  disabled={isSaving}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 h-24 disabled:opacity-60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingSchedule(null)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/60 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-600/10 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                      Saving Voyage...
                    </>
                  ) : (
                    "Save Voyage Details"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <ConfirmationModal
        isOpen={cancelModalState.isOpen}
        title="Cancel Sailing Voyage"
        message="Please provide the reason for cancelling this sailing. This will trigger refunds/rescheduling logic for bookings."
        confirmText="Cancel Voyage"
        cancelText="Go Back"
        type="danger"
        placeholder="Enter cancellation reason..."
        defaultValue="Low quota / weather"
        isLoading={!!actionLoading[`${cancelModalState.ref}-cancel`]}
        onConfirm={async (reason) => {
          if (!reason) return;
          const key = `${cancelModalState.ref}-cancel`;
          setActionLoading(prev => ({ ...prev, [key]: true }));
          try {
            await cancelSchedule(cancelModalState.ref, reason, token);
            toast.success(`Schedule ${cancelModalState.ref} cancelled successfully!`);
            refetchSchedules();
          } catch (err) {
            toast.error("Failed to cancel schedule.");
          } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
            setCancelModalState({ isOpen: false, ref: "" });
          }
        }}
        onCancel={() => setCancelModalState({ isOpen: false, ref: "" })}
      />
    </div>
  );
}
