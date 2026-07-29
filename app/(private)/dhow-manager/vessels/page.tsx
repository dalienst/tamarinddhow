"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  useFetchDhows, 
  useFetchPackages 
} from "@/hooks/vessels/actions";
import { updateDhow } from "@/services/vessels";
import { 
  Ship, 
  Edit, 
  Plus, 
  X, 
  Package as PackageIcon 
} from "lucide-react";
import toast from "react-hot-toast";

import CreateDhowForm from "@/forms/vessels/CreateDhowForm";
import EditDhowForm from "@/forms/vessels/EditDhowForm";
import CreatePackageForm from "@/forms/vessels/CreatePackageForm";
import { Dhow } from "@/types/dhow";

export default function VesselsManagementPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const [activeTab, setActiveTab] = useState<"dhows" | "packages">("dhows");

  // Query Hooks
  const { data: dhowsData, refetch: refetchDhows, isLoading: loadingDhows } = useFetchDhows();
  const { data: packagesData, refetch: refetchPackages, isLoading: loadingPackages } = useFetchPackages();

  const dhows = dhowsData?.results || [];
  const packages = packagesData?.results || [];

  // Modals / Editing States
  const [editingDhow, setEditingDhow] = useState<Dhow | null>(null);
  const [isDhowModalOpen, setIsDhowModalOpen] = useState(false);

  // New Package Form Toggle State
  const [showPackageForm, setShowPackageForm] = useState(false);

  const openEditModal = (dhow: Dhow) => {
    setEditingDhow(dhow);
    setIsDhowModalOpen(true);
  };

  const toggleDhowStatus = async (dhow: Dhow, field: "is_active" | "is_available", currentValue: boolean) => {
    try {
      await updateDhow(dhow.reference, {
        [field]: !currentValue,
      }, token);
      toast.success(`Updated ${dhow.name} status.`);
      refetchDhows();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Ship className="w-8 h-8 text-amber-600" /> Vessels & Fleet Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure your Tamarind Dhow fleet vessels, capacity limits, and dining menu packages.</p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl text-sm font-semibold self-start md:self-center shadow-sm">
          <button
            onClick={() => setActiveTab("dhows")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
              activeTab === "dhows" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Ship className="w-4 h-4" /> Dhow Vessels
          </button>
          <button
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
              activeTab === "packages" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PackageIcon className="w-4 h-4" /> Dining Packages
          </button>
        </div>
      </div>

      {/* Dhows Tab Content */}
      {activeTab === "dhows" && (
        <div className="space-y-8 animate-fadeIn">
          {/* New Dhow Registration Card */}
          <CreateDhowForm token={token} onSuccess={refetchDhows} />

          {/* Dhows Grid */}
          {loadingDhows ? (
            <div className="p-12 text-center text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent animate-spin rounded-full" />
              Loading vessels fleet...
            </div>
          ) : dhows.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 text-sm font-medium">
              No vessels registered yet. Use the registration form above to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {dhows.map((d) => (
                <div key={d.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl shadow-inner flex-shrink-0">
                        <Ship className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">{d.name}</h3>
                          <div className="flex gap-2">
                            <span 
                              onClick={() => toggleDhowStatus(d, "is_active", d.is_active)}
                              className={`px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full cursor-pointer transition-all ${
                                d.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {d.is_active ? "Active" : "Inactive"}
                            </span>
                            <span 
                              onClick={() => toggleDhowStatus(d, "is_available", d.is_available)}
                              className={`px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full cursor-pointer transition-all ${
                                d.is_available ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {d.is_available ? "Available" : "Maintenance"}
                            </span>
                          </div>
                        </div>
                        {d.description && <p className="text-sm text-slate-500 font-medium">{d.description}</p>}
                        <span className="text-[10px] text-slate-400 font-mono block uppercase">Ref: {d.reference}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap md:flex-nowrap border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm mr-4">
                        <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Max Capacity</span>
                          <span className="font-extrabold text-slate-800 text-base">{d.total_capacity} Pax</span>
                        </div>
                        <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Min Quota</span>
                          <span className="font-extrabold text-amber-800 text-base">{d.min_quota} Pax</span>
                        </div>
                      </div>

                      <button
                        onClick={() => openEditModal(d)}
                        className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                        title="Edit Vessel Info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Packages Tab Content */}
      {activeTab === "packages" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <PackageIcon className="w-5 h-5 text-amber-600" /> Dining & Package Menus
            </h2>
            <button
              onClick={() => setShowPackageForm(!showPackageForm)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
            >
              {showPackageForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showPackageForm ? "Cancel" : "Add Dining Package"}
            </button>
          </div>

          {/* New Package Form */}
          {showPackageForm && (
            <CreatePackageForm 
              onSuccess={() => {
                setShowPackageForm(false);
                refetchPackages();
              }}
              token={token}
            />
          )}

          {/* Packages Grid */}
          {loadingPackages ? (
            <div className="p-12 text-center text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent animate-spin rounded-full" />
              Loading packages list...
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 text-sm font-medium">
              No packages currently registered. Click "Add Dining Package" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{pkg.name}</h3>
                      <span className="font-extrabold text-amber-700 text-base bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl">
                        KES {parseFloat(pkg.base_price.toString()).toLocaleString()}
                      </span>
                    </div>
                    <span className="inline-block text-[9px] uppercase tracking-widest font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {pkg.meal_type_display || pkg.meal_type}
                    </span>
                    {pkg.description && <p className="text-sm text-slate-500">{pkg.description}</p>}
                  </div>
                  {pkg.includes && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                      <span className="font-bold text-slate-500 uppercase block tracking-wider text-[9px] mb-1">Menu Includes</span>
                      {pkg.includes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Dhow Modal */}
      {isDhowModalOpen && editingDhow && (
        <EditDhowForm 
          dhow={editingDhow}
          onClose={() => {
            setIsDhowModalOpen(false);
            setEditingDhow(null);
          }}
          onSuccess={() => {
            setIsDhowModalOpen(false);
            setEditingDhow(null);
            refetchDhows();
          }}
          token={token}
        />
      )}
    </div>
  );
}
