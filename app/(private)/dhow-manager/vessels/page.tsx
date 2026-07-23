"use client";

import React, { useState } from "react";
import { Dhow, Package, AddOn } from "@/types/dhow";
import { createDhow } from "@/services/vessels";
import {
  useFetchDhows,
  useFetchPackages,
  useFetchAddOns,
} from "@/hooks/vessels/actions";
import { useSession } from "next-auth/react";
import { Ship, Package as PackageIcon, Sparkles, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function VesselsManagementPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const [activeTab, setActiveTab] = useState<"dhows" | "packages" | "addons">("dhows");

  // Query Hooks
  const { data: dhowsData, refetch: refetchDhows, isLoading: loadingDhows } = useFetchDhows();
  const { data: packagesData } = useFetchPackages();
  const { data: addonsData } = useFetchAddOns();

  const dhows = dhowsData?.results || [];
  const packages = packagesData?.results || [];
  const addons = addonsData?.results || [];

  // New Dhow Form State
  const [dhowName, setDhowName] = useState("");
  const [dhowCapacity, setDhowCapacity] = useState("50");
  const [dhowMinQuota, setDhowMinQuota] = useState("10");

  const handleCreateDhow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dhowName) return toast.error("Please enter vessel name.");
    try {
      await createDhow({
        name: dhowName,
        total_capacity: parseInt(dhowCapacity, 10),
        min_quota: parseInt(dhowMinQuota, 10),
        is_active: true,
        is_available: true,
      }, token);
      toast.success(`Dhow ${dhowName} created!`);
      setDhowName("");
      refetchDhows();
    } catch (err) {
      toast.error("Failed to create Dhow.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vessel & Asset Management</h1>
          <p className="text-sm text-slate-500">Configure Tamarind Dhows, dining packages, and extra add-ons.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab("dhows")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "dhows" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Dhow Vessels
          </button>
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "packages" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Dining Packages
          </button>
          <button
            onClick={() => setActiveTab("addons")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "addons" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Add-on Extras
          </button>
        </div>
      </div>

      {/* Dhows Tab Content */}
      {activeTab === "dhows" && (
        <div className="space-y-6">
          <form onSubmit={handleCreateDhow} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" /> Register New Dhow Vessel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vessel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tamarind Dhow I"
                  value={dhowName}
                  onChange={(e) => setDhowName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Max Capacity</label>
                <input
                  type="number"
                  placeholder="50"
                  value={dhowCapacity}
                  onChange={(e) => setDhowCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Quota Threshold</label>
                <input
                  type="number"
                  placeholder="10"
                  value={dhowMinQuota}
                  onChange={(e) => setDhowMinQuota(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Save Dhow Vessel
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dhows.map((d) => (
              <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                      <Ship className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{d.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">Ref: {d.reference}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Capacity</span>
                    <span className="font-bold text-slate-800">{d.total_capacity} Persons</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Minimum Quota</span>
                    <span className="font-bold text-amber-700">{d.min_quota} Persons</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packages Tab Content */}
      {activeTab === "packages" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-lg">{pkg.name}</h3>
                <span className="font-extrabold text-amber-700 text-lg">KES {pkg.base_price}</span>
              </div>
              <span className="inline-block text-xs uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {pkg.meal_type_display || pkg.meal_type}
              </span>
              <p className="text-xs text-slate-600 mt-2">{pkg.includes || pkg.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Addons Tab Content */}
      {activeTab === "addons" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {addons.map((ad) => (
            <div key={ad.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
              <h4 className="font-bold text-slate-800 text-base">{ad.name}</h4>
              <p className="text-sm font-semibold text-amber-700">KES {ad.price}</p>
              {ad.description && <p className="text-xs text-slate-500">{ad.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
