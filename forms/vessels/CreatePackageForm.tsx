"use client";

import React, { useState } from "react";
import { MealType } from "@/types/dhow";
import { createPackage } from "@/services/vessels";
import toast from "react-hot-toast";

interface CreatePackageFormProps {
  onSuccess: () => void;
  token: string;
}

export default function CreatePackageForm({ onSuccess, token }: CreatePackageFormProps) {
  const [pkgName, setPkgName] = useState("");
  const [pkgMealType, setPkgMealType] = useState<MealType>("sunset_cruise");
  const [pkgPrice, setPkgPrice] = useState("4500");
  const [pkgDescription, setPkgDescription] = useState("");
  const [pkgIncludes, setPkgIncludes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName) return toast.error("Please fill in package name.");
    setIsSaving(true);
    try {
      await createPackage({
        name: pkgName,
        meal_type: pkgMealType,
        base_price: parseFloat(pkgPrice),
        description: pkgDescription,
        includes: pkgIncludes,
        is_active: true,
      }, token);
      toast.success("Dining Package created successfully!");
      setPkgName("");
      setPkgPrice("4500");
      setPkgDescription("");
      setPkgIncludes("");
      onSuccess();
    } catch (err) {
      toast.error("Failed to create dining package.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-slideDown">
      <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2 uppercase tracking-wider text-xs">New Package Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase">Package Name</label>
          <input
            type="text"
            required
            disabled={isSaving}
            placeholder="e.g. Seafood Extravaganza"
            value={pkgName}
            onChange={(e) => setPkgName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase">Base Price (KES)</label>
          <input
            type="number"
            required
            disabled={isSaving}
            placeholder="5000"
            value={pkgPrice}
            onChange={(e) => setPkgPrice(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase">Meal Type</label>
          <select
            value={pkgMealType}
            disabled={isSaving}
            onChange={(e) => setPkgMealType(e.target.value as MealType)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
          >
            <option value="lunch">Lunch</option>
            <option value="sunset_cruise">Sunset Cruise</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase">Inclusions / Features</label>
          <input
            type="text"
            disabled={isSaving}
            placeholder="e.g. 5-course dinner, welcome wine"
            value={pkgIncludes}
            onChange={(e) => setPkgIncludes(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-600 uppercase">Description</label>
        <textarea
          placeholder="Provide details about the cuisine, timing, and unique selling points..."
          value={pkgDescription}
          disabled={isSaving}
          onChange={(e) => setPkgDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all h-20 disabled:opacity-60"
        />
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/60 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-600/10 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
            Saving...
          </>
        ) : (
          "Save Package"
        )}
      </button>
    </form>
  );
}
