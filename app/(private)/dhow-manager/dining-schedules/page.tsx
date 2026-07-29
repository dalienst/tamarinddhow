"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  useFetchDhows, 
  useFetchScheduleTemplates 
} from "@/hooks/vessels/actions";
import { deleteScheduleTemplate } from "@/services/vessels";
import CreateScheduleTemplateForm from "@/forms/vessels/CreateScheduleTemplateForm";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Calendar, Clock, Trash2, Plus, Loader2, Ship, ChevronDown, ChevronUp, X } from "lucide-react";
import toast from "react-hot-toast";

export default function DiningSchedulesPage() {
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: dhowsData, isLoading: loadingDhows } = useFetchDhows();
  const { data: templatesData, refetch: refetchTemplates, isLoading: loadingTemplates } = useFetchScheduleTemplates();

  const dhows = dhowsData?.results || [];
  const templates = templatesData?.results || [];

  const [activeTemplateFormDhowId, setActiveTemplateFormDhowId] = useState<string | null>(null);
  const [deleteTargetRef, setDeleteTargetRef] = useState<string | null>(null);
  const [isDeletingRef, setIsDeletingRef] = useState<string | null>(null);

  // Tracks which vessels are expanded to manage blueprints
  const [expandedDhows, setExpandedDhows] = useState<string[]>([]);

  const toggleDhowExpand = (dhowId: string) => {
    setExpandedDhows(prev =>
      prev.includes(dhowId) ? prev.filter(id => id !== dhowId) : [...prev, dhowId]
    );
  };

  const handleDeleteTemplate = async (reference: string) => {
    setIsDeletingRef(reference);
    try {
      await deleteScheduleTemplate(reference, token);
      toast.success("Schedule template blueprint deleted successfully.");
      refetchTemplates();
    } catch (err) {
      toast.error("Failed to delete template blueprint.");
    } finally {
      setIsDeletingRef(null);
      setDeleteTargetRef(null);
    }
  };

  const loading = loadingDhows || loadingTemplates;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-8 h-8 text-amber-600" /> Dining Schedule Blueprints
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure default sailing templates (e.g. Lunch/Dinner cruises) per vessel. Templates define default times, rates, and recurrence rules.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent animate-spin rounded-full" />
          Loading dining schedules and templates...
        </div>
      ) : dhows.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 text-sm font-medium">
          No vessels registered yet. Please configure a vessel on the Vessels page first.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {dhows.map((d) => {
            const dhowTemplates = templates.filter(t => t.dhow === d.id);
            const isExpanded = !expandedDhows.includes(d.id); // default to expanded

            return (
              <div key={d.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl shadow-inner flex-shrink-0">
                      <Ship className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">{d.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">Capacity: {d.total_capacity} Pax | Min Quota: {d.min_quota} Pax</p>
                      <span className="text-[10px] text-slate-400 font-mono block uppercase">Ref: {d.reference}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTemplateFormDhowId(activeTemplateFormDhowId === d.id ? null : d.id);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
                    >
                      {activeTemplateFormDhowId === d.id ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {activeTemplateFormDhowId === d.id ? "Cancel" : "Add Template Blueprint"}
                    </button>

                    <button
                      onClick={() => toggleDhowExpand(d.id)}
                      className="p-2.5 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Section for Scheduling Templates / Blueprints */}
                {isExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-100 p-6 space-y-6">
                    {/* Add Blueprint Inline Form */}
                    {activeTemplateFormDhowId === d.id && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                          <Plus className="w-4 h-4 text-amber-600" /> Define New Schedule Blueprint for {d.name}
                        </h4>
                        <CreateScheduleTemplateForm 
                          dhowId={d.id} 
                          onClose={() => setActiveTemplateFormDhowId(null)}
                          onSuccess={() => {
                            setActiveTemplateFormDhowId(null);
                            refetchTemplates();
                          }}
                          token={token}
                        />
                      </div>
                    )}

                    {/* Templates List */}
                    {dhowTemplates.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-medium italic">
                        No sailing template blueprints defined for {d.name}. Add blueprints to auto-populate scheduling templates.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dhowTemplates.map(t => (
                          <div key={t.id} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-3.5 relative group hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-600 rounded">
                                  {t.meal_type_display || t.meal_type}
                                </span>
                                <div className="flex items-center gap-1 text-slate-800 font-bold text-sm mt-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{t.departure_time.substring(0,5)} - {t.return_time.substring(0,5)}</span>
                                </div>
                              </div>
                              <button
                                disabled={isDeletingRef === t.reference}
                                onClick={() => setDeleteTargetRef(t.reference)}
                                className={`text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all absolute top-3 right-3 disabled:opacity-60 ${
                                  isDeletingRef === t.reference ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                                title="Delete Template Blueprint"
                              >
                                {isDeletingRef === t.reference ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {t.days_of_week.map(day => (
                                <span key={day} className="px-2 py-0.5 text-[9px] font-extrabold text-amber-800 bg-amber-50 border border-amber-100/50 rounded">
                                  {day}
                                </span>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
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
      )}

      <ConfirmationModal
        isOpen={deleteTargetRef !== null}
        title="Delete Template Blueprint"
        message="Are you sure you want to delete this scheduling template blueprint? Future schedules generated from this blueprint will not be auto-created, but existing sailings will not be modified."
        confirmText="Delete Blueprint"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeletingRef !== null && isDeletingRef === deleteTargetRef}
        onConfirm={() => {
          if (deleteTargetRef) handleDeleteTemplate(deleteTargetRef);
        }}
        onCancel={() => setDeleteTargetRef(null)}
      />
    </div>
  );
}
