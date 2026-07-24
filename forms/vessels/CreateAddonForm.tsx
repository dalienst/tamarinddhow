"use client";

import React, { useState } from "react";
import { createAddOn } from "@/services/vessels";
import toast from "react-hot-toast";

interface CreateAddonFormProps {
  onSuccess: () => void;
  token: string;
}

export default function CreateAddonForm({ onSuccess, token }: CreateAddonFormProps) {
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState("1500");
  const [addonDescription, setAddonDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonName) return toast.error("Please fill in addon name.");
    setIsSaving(true);
    try {
      await createAddOn({
        name: addonName,
        price: parseFloat(addonPrice),
        description: addonDescription,
        is_available: true,
      }, token);
      toast.success("Add-on Extra created successfully!");
      setAddonName("");
      setAddonPrice("1500");
      setAddonDescription("");
      onSuccess();
    } catch (err) {
      toast.error("Failed to create addon extra.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-slideDown">
      <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2 uppercase tracking-wider text-xs">New Onboard Item Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase">Item Name</label>
          <input
            type="text"
            required
            disabled={isSaving}
            placeholder="e.g. Bottle of Dom Pérignon"
            value={addonName}
            onChange={(e) => setAddonName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase">Price (KES)</label>
          <input
            type="number"
            required
            disabled={isSaving}
            placeholder="12000"
            value={addonPrice}
            onChange={(e) => setAddonPrice(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase">Item Notes / Description</label>
          <input
            type="text"
            disabled={isSaving}
            placeholder="e.g. Served chilled with fresh strawberries"
            value={addonDescription}
            onChange={(e) => setAddonDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
          />
        </div>
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
          "Save Addon Item"
        )}
      </button>
    </form>
  );
}
