"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Schedule, Dhow, MealType } from "@/types/dhow";
import { openSchedule, closeSchedule, confirmSchedule, cancelSchedule, createSchedule } from "@/services/vessels";
import { useFetchSchedules, useFetchDhows } from "@/hooks/vessels/actions";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Skeleton, SkeletonCard } from "@/components/common/Skeleton";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { 
  Calendar as CalendarIcon, 
  Ship, 
  Plus, 
  List as ListIcon, 
  X, 
  Clock,
  Loader2,
  ChevronDown,
  UserPlus,
  MenuSquare
} from "lucide-react";
import WalkInBookingForm from "@/forms/walk-in/WalkInBookingForm";
import toast from "react-hot-toast";

export default function ScheduleListPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedulesData, isLoading: loadingSchedules, refetch: refetchSchedules } = useFetchSchedules();
  const { data: dhowsData, isLoading: loadingDhows } = useFetchDhows();

  const schedules = schedulesData?.results || [];
  const dhows = dhowsData?.results || [];

  // Toggle layout states
  const viewMode = "list";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Schedule form state
  const [selectedDhow, setSelectedDhow] = useState("");
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState<MealType>("sunset_cruise");
  const [departureTime, setDepartureTime] = useState("18:30");
  const [returnTime, setReturnTime] = useState("22:30");
  const [pricePerPerson, setPricePerPerson] = useState("5500");
  const [pricePerChild, setPricePerChild] = useState("2750");
  const [exclusiveFlatFee, setExclusiveFlatFee] = useState("150000");
  const [notes, setNotes] = useState("");
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean;
    ref: string;
  }>({ isOpen: false, ref: "" });
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [openMenuRef, setOpenMenuRef] = useState<string | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [selectedScheduleForWalkIn, setSelectedScheduleForWalkIn] = useState<string | null>(null);

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
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

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
            className={`h-full rounded-full transition-all duration-300 ${
              isQuotaMet ? "bg-emerald-500 shadow-sm" : "bg-amber-500"
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

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Controls Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ListIcon className="w-8 h-8 text-amber-600" /> Sailing List View
          </h1>
          <p className="text-sm text-slate-500 mt-1">Verify passenger quotas, check boarding statuses, cancel sailings and close checklists.</p>
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

      {/* List View Mode */}
      <div className="space-y-4 animate-fadeIn">
        {schedules.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-500 font-semibold text-sm shadow-sm">
            No sailing schedules planned yet. Click "Create Sailing" to plan a trip.
          </div>
        ) : (
          schedules.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                    <Ship className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-lg tracking-tight">{s.dhow_name}</span>
                      <StatusBadge status={s.status} type="schedule" />
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                        (s.is_open && s.status !== "completed" && s.status !== "cancelled") ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {(s.is_open && s.status !== "completed" && s.status !== "cancelled") ? "Bookings Open" : "Bookings Closed"}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{s.date}</span>
                      <span className="text-slate-300">|</span>
                      <span>{s.meal_type_display}</span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {s.departure_time.substring(0,5)} - {s.return_time.substring(0,5)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar Popover */}
                <div className="flex items-center gap-2 relative">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuRef(openMenuRef === s.reference ? null : s.reference)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-sm"
                    >
                      Actions <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {openMenuRef === s.reference && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenMenuRef(null)} 
                        />
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 animate-fadeIn">
                          <Link
                            href={`/dhow-manager/schedules/${s.reference}/manifest`}
                            onClick={() => setOpenMenuRef(null)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            Manifest Checklist
                          </Link>

                          <Link
                            href={`/dhow-manager/schedules/${s.reference}/tables`}
                            onClick={() => setOpenMenuRef(null)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            Seating Layout
                          </Link>

                          {s.status !== "completed" && s.status !== "cancelled" && (
                            <button
                              onClick={() => {
                                setSelectedScheduleForWalkIn(s.id);
                                setIsWalkInOpen(true);
                                setOpenMenuRef(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-850 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                            >
                              Book Walk-In
                            </button>
                          )}

                          <button
                            onClick={() => {
                              const publicUrl = `${window.location.origin}/manifest/${s.reference}`;
                              navigator.clipboard.writeText(publicUrl);
                              toast.success("Public manifest sharing link copied!");
                              setOpenMenuRef(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            Share Public Link
                          </button>

                          {s.status !== "completed" && s.status !== "cancelled" && (
                            <>
                              <div className="border-t border-slate-100 my-1.5" />
                              {s.is_open ? (
                                <button
                                  disabled={actionLoading[`${s.reference}-close`]}
                                  onClick={() => {
                                    handleAction(s.reference, "close");
                                    setOpenMenuRef(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                  Close Bookings
                                </button>
                              ) : (
                                <button
                                  disabled={actionLoading[`${s.reference}-open`]}
                                  onClick={() => {
                                    handleAction(s.reference, "open");
                                    setOpenMenuRef(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-850 hover:bg-emerald-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                  Open Bookings
                                </button>
                              )}
                            </>
                          )}

                          {s.status !== "confirmed" && s.status !== "cancelled" && s.status !== "completed" && (
                            <button
                              disabled={actionLoading[`${s.reference}-confirm`]}
                              onClick={() => {
                                handleAction(s.reference, "confirm");
                                setOpenMenuRef(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
                            >
                              Confirm Sailing
                            </button>
                          )}

                          {s.status !== "cancelled" && s.status !== "completed" && (
                            <button
                              disabled={actionLoading[`${s.reference}-cancel`]}
                              onClick={() => {
                                handleAction(s.reference, "cancel");
                                setOpenMenuRef(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
                            >
                              Cancel Sailing
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quota bar */}
              <div className="pt-4 border-t border-slate-100">
                {renderQuotaBar(s)}
              </div>
            </div>
          ))
        )}
      </div>

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
                    <option value="dinner_cruise">Dinner Cruise</option>
                    <option value="lunch">Lunch</option>
                    <option value="sunset_cruise">Sunset Cruise</option>
                    <option value="booze_cruise">Booze Cruise</option>
                    <option value="special_cruise">Special Cruise</option>
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

      {/* Walk-in Booking Modal */}
      {isWalkInOpen && selectedScheduleForWalkIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-slate-100 animate-scaleUp relative">
            <button
              onClick={() => {
                setIsWalkInOpen(false);
                setSelectedScheduleForWalkIn(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-800">Register Walk-In Booking</h2>
            </div>
            <div className="pt-2">
              <WalkInBookingForm 
                token={token} 
                initialScheduleId={selectedScheduleForWalkIn}
                onSuccess={() => {
                  setIsWalkInOpen(false);
                  setSelectedScheduleForWalkIn(null);
                  refetchSchedules();
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
