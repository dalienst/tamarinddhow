"use client";

import React, { useState } from "react";
import { Dhow, Package, AddOn, ScheduleTemplate } from "@/types/dhow";
import { 
  updateDhow, 
  deleteScheduleTemplate 
} from "@/services/vessels";
import {
  useFetchDhows,
  useFetchPackages,
  useFetchAddOns,
  useFetchScheduleTemplates,
} from "@/hooks/vessels/actions";
import { useSession } from "next-auth/react";
import { 
  Ship, 
  Package as PackageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  X, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  Layers
} from "lucide-react";
import toast from "react-hot-toast";

// Decoupled Form Components
import CreateDhowForm from "@/forms/vessels/CreateDhowForm";
import EditDhowForm from "@/forms/vessels/EditDhowForm";
import CreateScheduleTemplateForm from "@/forms/vessels/CreateScheduleTemplateForm";
import CreatePackageForm from "@/forms/vessels/CreatePackageForm";
import CreateAddonForm from "@/forms/vessels/CreateAddonForm";

export default function VesselsManagementPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const [activeTab, setActiveTab] = useState<"dhows" | "packages" | "addons">("dhows");

  // Query Hooks
  const { data: dhowsData, refetch: refetchDhows } = useFetchDhows();
  const { data: packagesData, refetch: refetchPackages } = useFetchPackages();
  const { data: addonsData, refetch: refetchAddons } = useFetchAddOns();
  const { data: templatesData, refetch: refetchTemplates } = useFetchScheduleTemplates();

  const dhows = dhowsData?.results || [];
  const packages = packagesData?.results || [];
  const addons = addonsData?.results || [];
  const templates = templatesData?.results || [];

  // Expanded Dhow IDs state for viewing templates
  const [expandedDhows, setExpandedDhows] = useState<string[]>([]);
  
  // Modals / Editing States
  const [editingDhow, setEditingDhow] = useState<Dhow | null>(null);
  const [isDhowModalOpen, setIsDhowModalOpen] = useState(false);

  // Template Form State per Dhow ID
  const [activeTemplateFormDhowId, setActiveTemplateFormDhowId] = useState<string | null>(null);

  // New Package Form Toggle State
  const [showPackageForm, setShowPackageForm] = useState(false);

  // New Addon Form Toggle State
  const [showAddonForm, setShowAddonForm] = useState(false);

  const toggleDhowExpand = (dhowId: string) => {
    setExpandedDhows(prev =>
      prev.includes(dhowId) ? prev.filter(id => id !== dhowId) : [...prev, dhowId]
    );
  };

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

  const handleDeleteTemplate = async (reference: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteScheduleTemplate(reference, token);
      toast.success("Template deleted.");
      refetchTemplates();
    } catch (err) {
      toast.error("Failed to delete template.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Ship className="w-8 h-8 text-amber-600" /> Vessels & Assets
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure your Tamarind Dhow fleet capacity, scheduling blueprints, dining menus, and onboard items.</p>
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
          <button
            onClick={() => setActiveTab("addons")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
              activeTab === "addons" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" /> Add-ons
          </button>
        </div>
      </div>

      {/* Dhows Tab Content */}
      {activeTab === "dhows" && (
        <div className="space-y-8 animate-fadeIn">
          {/* New Dhow Registration Card */}
          <CreateDhowForm token={token} onSuccess={refetchDhows} />

          {/* Dhows Grid */}
          <div className="grid grid-cols-1 gap-6">
            {dhows.map((d) => {
              const dhowTemplates = templates.filter(t => t.dhow === d.id);
              const isExpanded = expandedDhows.includes(d.id);

              return (
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(d)}
                          className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                          title="Edit Vessel Info"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleDhowExpand(d.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                        >
                          {dhowTemplates.length} Blueprints
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Section for Scheduling Templates / Blueprints */}
                  {isExpanded && (
                    <div className="bg-slate-50/50 border-t border-slate-100 p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" /> Sailing Template Blueprints
                        </h4>
                        {activeTemplateFormDhowId !== d.id && (
                          <button
                            onClick={() => {
                              setActiveTemplateFormDhowId(d.id);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Template
                          </button>
                        )}
                      </div>

                      {/* Add Blueprint Inline Form */}
                      {activeTemplateFormDhowId === d.id && (
                        <CreateScheduleTemplateForm 
                          dhowId={d.id} 
                          onClose={() => setActiveTemplateFormDhowId(null)}
                          onSuccess={() => {
                            setActiveTemplateFormDhowId(null);
                            refetchTemplates();
                          }}
                          token={token}
                        />
                      )}

                      {/* Templates List */}
                      {dhowTemplates.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs font-medium">
                          No sailing templates defined for this vessel. Adding template blueprints allows you to bulk generate sailings.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {dhowTemplates.map(t => (
                            <div key={t.id} className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm space-y-3 relative group">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-600 rounded">
                                    {t.meal_type_display || t.meal_type}
                                  </span>
                                  <div className="flex items-center gap-1 text-slate-800 font-bold text-sm">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{t.departure_time.substring(0,5)} - {t.return_time.substring(0,5)}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteTemplate(t.reference)}
                                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                                  title="Delete Template Blueprint"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {t.days_of_week.map(day => (
                                  <span key={day} className="px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 bg-amber-50 rounded">
                                    {day}
                                  </span>
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Per Person</span>
                                  <span className="font-extrabold text-slate-700">KES {parseFloat(t.price_per_person.toString()).toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Exclusive Charter</span>
                                  <span className="font-extrabold text-slate-700">KES {parseFloat(t.exclusive_flat_fee.toString()).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
        </div>
      )}

      {/* Addons Tab Content */}
      {activeTab === "addons" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" /> Onboard Add-ons & Drinks
            </h2>
            <button
              onClick={() => setShowAddonForm(!showAddonForm)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
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
