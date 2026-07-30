"use client";

import React, { useState } from "react";
import { MealType } from "@/types/dhow";
import { createScheduleTemplate } from "@/services/vessels";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface CreateScheduleTemplateFormProps {
  dhowId: string;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export default function CreateScheduleTemplateForm({
  dhowId,
  onClose,
  onSuccess,
  token,
}: CreateScheduleTemplateFormProps) {
  const [tempMealType, setTempMealType] = useState<MealType>("sunset_cruise");
  const [tempDepTime, setTempDepTime] = useState("17:00");
  const [tempRetTime, setTempRetTime] = useState("20:00");
  const [tempDays, setTempDays] = useState<string[]>([]);
  const [tempPrice, setTempPrice] = useState("5000");
  const [tempPriceChild, setTempPriceChild] = useState("2500");
  const [tempFlatFee, setTempFlatFee] = useState("272000");
  const [tempNotes, setTempNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeekOptions = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const toggleDaySelection = (day: string) => {
    setTempDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempDays.length === 0) return toast.error("Please select at least one day of the week.");
    setIsSaving(true);
    try {
      await createScheduleTemplate({
        dhow: dhowId,
        meal_type: tempMealType,
        departure_time: tempDepTime,
        return_time: tempRetTime,
        days_of_week: tempDays,
        price_per_person: parseFloat(tempPrice),
        price_per_child: parseFloat(tempPriceChild),
        exclusive_flat_fee: parseFloat(tempFlatFee),
        is_active: true,
        notes: tempNotes,
      }, token);
      toast.success("Schedule template added!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to create template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="font-bold text-xs text-slate-700 uppercase tracking-widest">New Blueprint Details</span>
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase">Meal Type</label>
          <select
            value={tempMealType}
            disabled={isSaving}
            onChange={(e) => setTempMealType(e.target.value as MealType)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white disabled:opacity-60"
          >
            <option value="lunch">Lunch</option>
            <option value="sunset_cruise">Sunset Cruise</option>
            <option value="booze_cruise">Booze Cruise</option>
            <option value="special_cruise">Special Cruise</option>
            <option value="dinner_cruise">Dinner Cruise</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase">Departs (HH:MM)</label>
          <input
            type="text"
            disabled={isSaving}
            placeholder="17:00"
            value={tempDepTime}
            onChange={(e) => setTempDepTime(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white disabled:opacity-60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase">Returns (HH:MM)</label>
          <input
            type="text"
            disabled={isSaving}
            placeholder="20:00"
            value={tempRetTime}
            onChange={(e) => setTempRetTime(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white disabled:opacity-60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase">Price per Adult (KES)</label>
          <input
            type="number"
            disabled={isSaving}
            value={tempPrice}
            onChange={(e) => setTempPrice(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white disabled:opacity-60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase">Price per Child (KES)</label>
          <input
            type="number"
            disabled={isSaving}
            value={tempPriceChild}
            onChange={(e) => setTempPriceChild(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white disabled:opacity-60"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase">Exclusive Flat Fee (KES)</label>
          <input
            type="number"
            disabled={isSaving}
            value={tempFlatFee}
            onChange={(e) => setTempFlatFee(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white disabled:opacity-60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase">Internal Notes</label>
          <input
            type="text"
            disabled={isSaving}
            placeholder="e.g. Saturday special, corporate charter defaults"
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white disabled:opacity-60"
          />
        </div>
      </div>

      {/* Days selector */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-slate-600 uppercase">Operating Days</label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeekOptions.map((day) => {
            const isSelected = tempDays.includes(day);
            return (
              <button
                type="button"
                key={day}
                disabled={isSaving}
                onClick={() => toggleDaySelection(day)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-60 ${isSelected
                    ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-800/60 text-white font-bold text-xs rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
              Saving...
            </>
          ) : (
            "Add Blueprint"
          )}
        </button>
      </div>
    </form>
  );
}
