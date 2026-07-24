"use client";

import React, { useState } from "react";
import { createDhow } from "@/services/vessels";
import { Plus, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CreateDhowFormProps {
  token: string;
  onSuccess: () => void;
}

export default function CreateDhowForm({ token, onSuccess }: CreateDhowFormProps) {
  const [dhowName, setDhowName] = useState("");
  const [dhowCapacity, setDhowCapacity] = useState("50");
  const [dhowMinQuota, setDhowMinQuota] = useState("10");
  const [dhowDescription, setDhowDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dhowName) return toast.error("Please enter vessel name.");
    setIsSaving(true);
    try {
      await createDhow({
        name: dhowName,
        total_capacity: parseInt(dhowCapacity, 10),
        min_quota: parseInt(dhowMinQuota, 10),
        description: dhowDescription,
        is_active: true,
        is_available: true,
      }, token);
      toast.success(`Dhow ${dhowName} created!`);
      setDhowName("");
      setDhowDescription("");
      setDhowCapacity("50");
      setDhowMinQuota("10");
      onSuccess();
    } catch (err) {
      toast.error("Failed to create Dhow.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <PlusCircle className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold text-slate-800 text-base">Register New Dhow Vessel</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Vessel Name</label>
            <input
              type="text"
              required
              disabled={isSaving}
              placeholder="e.g. Tamarind Gold"
              value={dhowName}
              onChange={(e) => setDhowName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Total Max Capacity</label>
            <input
              type="number"
              required
              disabled={isSaving}
              placeholder="50"
              value={dhowCapacity}
              onChange={(e) => setDhowCapacity(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Minimum Quota</label>
            <input
              type="number"
              required
              disabled={isSaving}
              placeholder="10"
              value={dhowMinQuota}
              onChange={(e) => setDhowMinQuota(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Short Description</label>
            <input
              type="text"
              disabled={isSaving}
              placeholder="e.g. Elegant mahogany double-masted dhow"
              value={dhowDescription}
              onChange={(e) => setDhowDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/60 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-600/10 hover:shadow-lg disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Save Vessel
            </>
          )}
        </button>
      </form>
    </div>
  );
}
