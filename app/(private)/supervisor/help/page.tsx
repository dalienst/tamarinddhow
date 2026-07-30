"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  Ship, 
  QrCode,
  UserCheck, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Info
} from "lucide-react";
import Link from "next/link";

export default function HelpGuidePage() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: "View Schedules",
      subtitle: "Monitor active cruises",
      icon: Ship,
      color: "emerald",
      description: "Review today's and upcoming sailing dates. Check guest attendance totals and minimum capacity quotas before departure.",
      details: [
        "Go to the **Dashboard** on the supervisor portal sidebar.",
        "Today's active cruises will show at the top of the list.",
        "Check passenger counts (e.g. 18 / 30 Pax) and ensure the minimum operating quota has been met."
      ],
      link: "/supervisor/dashboard"
    },
    {
      id: 2,
      title: "Boarding Manifests",
      subtitle: "Dock guest checklist",
      icon: FileText,
      color: "teal",
      description: "Check off passengers as they arrive at the pier and verify their table seating layouts.",
      details: [
        "From the Dashboard, click **Open manifest checklist** next to the active schedule.",
        "Scroll or search for the guest's name or reservation reference.",
        "Click the checkmark checkbox to mark passengers as Boarded / Checked In.",
        "If a guest's spelling is incorrect, click the Pencil icon to rename them directly."
      ],
      link: "/supervisor/dashboard"
    },
    {
      id: 3,
      title: "Register Walk-Ins",
      subtitle: "Add last-minute arrivals",
      icon: UserCheck,
      color: "purple",
      description: "Book walk-in passengers directly at the boarding gate during embarkation.",
      details: [
        "Inside the active manifest checklist, click the green **Register Walk-In** button in the top right corner.",
        "Fill out primary guest details (name, email, phone) and seat headcount requirements.",
        "Add additional passengers' names, dining package allocations, and extras.",
        "Set the payment state (e.g. Paid in cash/card) and save. They will instantly appear on your manifest list."
      ],
      link: "/supervisor/dashboard"
    },
    {
      id: 4,
      title: "Digital QR Scanner",
      subtitle: "Ticketing check-ins",
      icon: QrCode,
      color: "indigo",
      description: "Scan QR barcodes on guest tickets to automatically complete boarding processes.",
      details: [
        "Open the **QR Scanner** on a phone, tablet, or handheld scanner.",
        "Toggle the 'Camera Scanner' tab and grant permission to use the webcam.",
        "Point the camera at the guest's ticket. When scanned, it will check the reservation validity and mark them checked-in.",
        "You can also search/lookup reference codes manually (e.g. BK-2026-XXXX) under the 'Manual Entry' tab."
      ],
      link: "/supervisor/scanner"
    }
  ];

  const currentStepData = steps.find(s => s.id === activeStep) || steps[0];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-6">
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shadow-inner">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supervisor Setup Guide & Help</h1>
          <p className="text-sm text-slate-500 mt-1">Operational instructions for check-ins, manifest checklists, walk-in additions, and QR ticket scanning.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Steps Selection */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Operations Milestones</h3>
          <div className="space-y-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                    isActive 
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10 -translate-y-0.5" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${
                    isActive ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold tracking-widest text-emerald-500 uppercase block font-mono">Step 0{step.id}</span>
                    <span className="font-bold text-sm block">{step.title}</span>
                    <span className={`text-[11px] block ${isActive ? "text-slate-300" : "text-slate-400"}`}>{step.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step details pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700">
                  <currentStepData.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider">Milestone Step 0{currentStepData.id}</span>
                  <h2 className="text-xl font-extrabold text-slate-900">{currentStepData.title}</h2>
                </div>
              </div>
              
              <Link 
                href={currentStepData.link}
                className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/10"
              >
                Go to Section <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {currentStepData.description}
            </p>

            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Configuration Checklist</h4>
              <div className="space-y-3">
                {currentStepData.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span 
                      className="text-xs font-medium text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: detail }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips Callout */}
            <div className="p-4.5 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl flex gap-3 text-emerald-800">
              <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold block uppercase tracking-wider text-[10px]">Supervisor Tip</span>
                <p className="leading-relaxed">
                  Always verify guest counts against the physical manifest before signaling the captain to cast off. Only checked-in guests are marked as completed on reports.
                </p>
              </div>
            </div>
          </div>

          {/* Quick FAQ */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> Operational FAQs
            </h3>
            
            <div className="space-y-4 divide-y divide-slate-800">
              <div className="pt-4 first:pt-0 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400">Can I check in guests without cellular network connection?</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The portal requires an active connection to write boarding check-in statuses to the central bookings database. Ensure your device has reliable signal at the docking pier.
                </p>
              </div>

              <div className="pt-4 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400">What if a passenger code returns a 'cancelled' status code?</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ask the passenger to present their payment receipt or verify their booking status with the central dhow managers. Cancelled reservations are blocked from boarding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
