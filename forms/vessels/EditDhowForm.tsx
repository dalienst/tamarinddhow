"use client";

import React, { useState } from "react";
import { Dhow } from "@/types/dhow";
import { updateDhow } from "@/services/vessels";
import { Edit, X } from "lucide-react";
import toast from "react-hot-toast";

interface EditDhowFormProps {
  dhow: Dhow;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export default function EditDhowForm({ dhow, onClose, onSuccess, token }: EditDhowFormProps) {
  const [editName, setEditName] = useState(dhow.name);
  const [editCapacity, setEditCapacity] = useState(dhow.total_capacity.toString());
  const [editMinQuota, setEditMinQuota] = useState(dhow.min_quota.toString());
  const [editDescription, setEditDescription] = useState(dhow.description || "");
  const [editIsActive, setEditIsActive] = useState(dhow.is_active);
  const [editIsAvailable, setEditIsAvailable] = useState(dhow.is_available);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateDhow(dhow.reference, {
        name: editName,
        total_capacity: parseInt(editCapacity, 10),
        min_quota: parseInt(editMinQuota, 10),
        description: editDescription,
        is_active: editIsActive,
        is_available: editIsAvailable,
      }, token);
      toast.success(`Dhow ${editName} updated!`);
      onSuccess();
    } catch (err) {
      toast.error("Failed to update Dhow.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <h3 className="font-extrabold tracking-tight flex items-center gap-2">
            <Edit className="w-5 h-5 text-amber-500" /> Edit Vessel Details
          </h3>
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase">Vessel Name</label>
            <input
              type="text"
              required
              disabled={isSaving}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase">Max Capacity</label>
              <input
                type="number"
                required
                disabled={isSaving}
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase">Minimum Quota</label>
              <input
                type="number"
                required
                disabled={isSaving}
                value={editMinQuota}
                onChange={(e) => setEditMinQuota(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase">Description</label>
            <textarea
              value={editDescription}
              disabled={isSaving}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 h-20 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                disabled={isSaving}
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="h-4.5 w-4.5 text-amber-600 border-slate-300 rounded focus:ring-amber-500 disabled:opacity-60"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Vessel Active</span>
                <span className="text-[10px] text-slate-400">Can be assigned to sailings</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                disabled={isSaving}
                checked={editIsAvailable}
                onChange={(e) => setEditIsAvailable(e.target.checked)}
                className="h-4.5 w-4.5 text-amber-600 border-slate-300 rounded focus:ring-amber-500 disabled:opacity-60"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Available</span>
                <span className="text-[10px] text-slate-400">Vessel is in service</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
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
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
