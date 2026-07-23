"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Schedule, Dhow } from "@/types/dhow";
import { openSchedule, closeSchedule, confirmSchedule, cancelSchedule, createSchedule } from "@/services/vessels";
import { useFetchSchedules, useFetchDhows } from "@/hooks/vessels/actions";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Calendar, Ship, CheckCircle, XCircle, Users, Table, QrCode, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function ScheduleCenterPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedulesData, refetch: refetchSchedules } = useFetchSchedules();
  const { data: dhowsData } = useFetchDhows();

  const schedules = schedulesData?.results || [];
  const dhows = dhowsData?.results || [];

  // New Schedule form state
  const [selectedDhow, setSelectedDhow] = useState("");
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState<"lunch" | "sunset_cruise">("sunset_cruise");
  const [departureTime, setDepartureTime] = useState("18:30");
  const [returnTime, setReturnTime] = useState("22:30");
  const [pricePerPerson, setPricePerPerson] = useState("5500");

  useEffect(() => {
    if (dhows.length > 0 && !selectedDhow) {
      setSelectedDhow(dhows[0].id);
    }
  }, [dhows, selectedDhow]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDhow || !date) return toast.error("Please select a dhow and date.");
    try {
      await createSchedule({
        dhow: selectedDhow,
        date,
        meal_type: mealType,
        departure_time: departureTime,
        return_time: returnTime,
        price_per_person: pricePerPerson,
        status: "scheduled",
        is_open: true,
      }, token);
      toast.success("New sailing schedule created!");
      refetchSchedules();
    } catch (err) {
      toast.error("Failed to create schedule.");
    }
  };

  const handleAction = async (ref: string, action: "open" | "close" | "confirm" | "cancel") => {
    try {
      if (action === "open") await openSchedule(ref, token);
      if (action === "close") await closeSchedule(ref, token);
      if (action === "confirm") await confirmSchedule(ref, token);
      if (action === "cancel") {
        const reason = prompt("Enter cancellation reason (e.g. Bad weather):", "Low quota / weather");
        if (!reason) return;
        await cancelSchedule(ref, reason, token);
      }
      toast.success(`Schedule ${ref} updated!`);
      refetchSchedules();
    } catch (err) {
      toast.error(`Failed to ${action} schedule.`);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sailing Schedule Control Center</h1>
          <p className="text-sm text-slate-500">Manage daily sailings, open/close availability, confirm sailing & release escrow.</p>
        </div>
      </div>

      {/* New Schedule Form */}
      <form onSubmit={handleCreateSchedule} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-600" /> Create Ad-hoc Sailing Schedule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dhow Vessel</label>
            <select
              value={selectedDhow}
              onChange={(e) => setSelectedDhow(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              {dhows.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="sunset_cruise">Sunset Cruise</option>
              <option value="lunch">Lunch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Departure</label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Return</label>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Price/Person (KES)</label>
            <input
              type="number"
              value={pricePerPerson}
              onChange={(e) => setPricePerPerson(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg transition-colors"
        >
          Create Schedule
        </button>
      </form>

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-lg">{s.dhow_name}</span>
                  <StatusBadge status={s.status} type="schedule" />
                  {s.is_open ? (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">Bookings Open</span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">Bookings Closed</span>
                  )}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  📅 <span className="font-semibold text-slate-700">{s.date}</span> ({s.meal_type_display}) | ⏰ {s.departure_time} - {s.return_time}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/dhow-manager/schedules/${s.reference}/manifest`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold text-xs rounded-lg transition-colors"
                >
                  <QrCode className="w-4 h-4" /> Manifest & Check-In
                </Link>

                <Link
                  href={`/dhow-manager/schedules/${s.reference}/tables`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-semibold text-xs rounded-lg transition-colors"
                >
                  <Table className="w-4 h-4" /> Seating & Tables
                </Link>

                {s.is_open ? (
                  <button
                    onClick={() => handleAction(s.reference, "close")}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Close Bookings
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(s.reference, "open")}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg"
                  >
                    Open Bookings
                  </button>
                )}

                {s.status !== "confirmed" && (
                  <button
                    onClick={() => handleAction(s.reference, "confirm")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                    title="Confirm sailing & release escrow funds to finance"
                  >
                    Confirm Sailing
                  </button>
                )}

                {s.status !== "cancelled" && (
                  <button
                    onClick={() => handleAction(s.reference, "cancel")}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                    title="Cancel sailing & trigger guest refund/reschedule"
                  >
                    Cancel Sailing
                  </button>
                )}
              </div>
            </div>

            {/* Quota Progress Meter */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Confirmed Guests: <strong className="text-slate-900">{s.current_pax_count}</strong></span>
              </div>
              <div>
                Quota Status: {s.is_quota_met ? (
                  <strong className="text-emerald-600">Quota Met! Sailing Confirmed</strong>
                ) : (
                  <strong className="text-amber-600">Needs more guests to sail</strong>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
