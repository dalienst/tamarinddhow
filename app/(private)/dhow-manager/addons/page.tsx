"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useFetchAddOns } from "@/hooks/vessels/actions";
import CreateAddonForm from "@/forms/vessels/CreateAddonForm";
import { Layers, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AddonsManagementPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const [showAddonForm, setShowAddonForm] = useState(false);

  // Query Hooks
  const { data: addonsData, refetch: refetchAddons, isLoading: loadingAddons } = useFetchAddOns();
  const addons = addonsData?.results || [];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-8 h-8 text-amber-600" /> Onboard Add-ons & Drinks
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure and manage cakes, customized dining amenities, extra services, and drinks available for booking.</p>
        </div>

        <button
          onClick={() => setShowAddonForm(!showAddonForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm self-start md:self-center"
        >
          {showAddonForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddonForm ? "Cancel" : "Add Extra Add-on"}
        </button>
      </div>

      {/* New Addon Form */}
      {showAddonForm && (
        <CreateAddonForm 
          onSuccess={() => {
            setShowAddonForm(false);
            refetchAddons();
          }}
          token={token}
        />
      )}

      {/* Addons Grid */}
      {loadingAddons ? (
        <div className="p-12 text-center text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent animate-spin rounded-full" />
          Loading onboard add-ons...
        </div>
      ) : addons.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 text-sm font-medium">
          No add-ons currently registered. Click "Add Extra Add-on" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {addons.map((ad) => (
            <div key={ad.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-extrabold text-slate-800 text-base tracking-tight">{ad.name}</h4>
                  <span className="font-extrabold text-amber-700 text-sm">
                    KES {parseFloat(ad.price.toString()).toLocaleString()}
                  </span>
                </div>
                {ad.description && <p className="text-xs text-slate-500 leading-relaxed">{ad.description}</p>}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                <span>Available Onboard</span>
                <span className="px-2 py-0.5 font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase tracking-widest text-[8px]">
                  In Stock
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
