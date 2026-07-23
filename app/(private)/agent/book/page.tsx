"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking, createBookingGuest } from "@/services/bookings";
import { useFetchSchedules, useFetchPackages } from "@/hooks/vessels/actions";
import { useSession } from "next-auth/react";
import { Users, Plus, Trash2, CheckCircle2, Shield } from "lucide-react";
import toast from "react-hot-toast";

interface GuestRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dietary_needs: string;
  is_primary: boolean;
}

export default function AgentGroupBookPage() {
  const router = useRouter();

  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedulesData } = useFetchSchedules({ is_open: true });
  const { data: packagesData } = useFetchPackages();

  const schedules = schedulesData?.results || [];
  const packages = packagesData?.results || [];

  // Form state
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [cancellationPreference, setCancellationPreference] = useState<"reschedule" | "refund">("refund");
  const [tableRequest, setTableRequest] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Passenger roster list
  const [guestList, setGuestList] = useState<GuestRow[]>([
    { first_name: "", last_name: "", email: "", phone: "", dietary_needs: "", is_primary: true },
  ]);

  useEffect(() => {
    if (schedules.length > 0 && !selectedScheduleId) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  useEffect(() => {
    if (packages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packages[0].id);
    }
  }, [packages, selectedPackageId]);

  const handleAddGuestRow = () => {
    setGuestList((prev) => [
      ...prev,
      { first_name: "", last_name: "", email: "", phone: "", dietary_needs: "", is_primary: false },
    ]);
  };

  const handleRemoveGuestRow = (index: number) => {
    if (guestList.length === 1) return toast.error("Must have at least one primary guest.");
    setGuestList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGuestChange = (index: number, field: keyof GuestRow, val: any) => {
    setGuestList((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: val } : g))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) return toast.error("Please select a schedule.");
    if (guestList.some((g) => !g.first_name || !g.last_name)) {
      return toast.error("Please fill in first and last names for all guests in the roster.");
    }

    try {
      // 1. Create Group Booking
      const booking = await createBooking(
        {
          schedule: selectedScheduleId,
          package: selectedPackageId || undefined,
          party_size: guestList.length,
          booking_type: "group_agent",
          cancellation_preference: cancellationPreference,
          table_request: tableRequest || undefined,
          special_requests: specialRequests || undefined,
          status: "confirmed",
        },
        token
      );

      // 2. Create Guest Roster Records
      for (const guest of guestList) {
        await createBookingGuest(
          {
            booking: booking.id,
            first_name: guest.first_name,
            last_name: guest.last_name,
            email: guest.email || undefined,
            phone: guest.phone || undefined,
            dietary_needs: guest.dietary_needs || undefined,
            is_primary: guest.is_primary,
          },
          token
        );
      }

      toast.success(`Group booking ${booking.reference} with ${guestList.length} guests created!`);
      router.push("/agent/dashboard");
    } catch (err) {
      toast.error("Failed to create group booking.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" /> Book Group Sailing & Passenger Roster
        </h1>
        <p className="text-sm text-slate-500">
          Register a tour group sailing, attach passenger details, and consolidate single payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Schedule & Package */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Sailing Schedule</label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.dhow_name} - {s.date} ({s.meal_type_display}) [{s.available_capacity} seats available]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Package</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (KES {p.base_price}/person)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cancellation Preference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Preference (Upfront)</label>
            <select
              value={cancellationPreference}
              onChange={(e) => setCancellationPreference(e.target.value as any)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="refund">Refund Payment</option>
              <option value="reschedule">Reschedule Date</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Seating Request (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Deck seating together"
              value={tableRequest}
              onChange={(e) => setTableRequest(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* PASSENGER ROSTER FORM */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Passenger Roster ({guestList.length} Guests)</h3>
            <button
              type="button"
              onClick={handleAddGuestRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Guest to Roster
            </button>
          </div>

          <div className="space-y-3">
            {guestList.map((g, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-900 uppercase tracking-wider">
                    Guest #{idx + 1} {g.is_primary ? "(Primary Contact)" : ""}
                  </span>
                  {guestList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGuestRow(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name *"
                      value={g.first_name}
                      onChange={(e) => handleGuestChange(idx, "first_name", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name *"
                      value={g.last_name}
                      onChange={(e) => handleGuestChange(idx, "last_name", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dietary Needs (e.g. Vegetarian, Halal)"
                      value={g.dietary_needs}
                      onChange={(e) => handleGuestChange(idx, "dietary_needs", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-colors shadow-sm"
        >
          Confirm Group Booking & Passenger Roster
        </button>
      </form>
    </div>
  );
}
