"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  Ship, 
  Calendar, 
  PlusCircle, 
  Utensils, 
  Layers, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Info,
  DollarSign
} from "lucide-react";
import Link from "next/link";

export default function HelpGuidePage() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: "Vessel Setup",
      subtitle: "Register your fleet",
      icon: Ship,
      color: "amber",
      description: "Define the physical dhows that sail. You need to configure their capacity and minimum threshold for operations.",
      details: [
        "Go to the **Vessels** page on the sidebar.",
        "Under the **Dhow Vessels** tab, use the 'Register New Dhow Vessel' form.",
        "Enter a unique name (e.g. Tamarind Gold), total capacity (max passengers), and minimum operating quota (threshold to ensure financial viability).",
        "Set the short description and hit 'Save Vessel'."
      ],
      link: "/dhow-manager/vessels"
    },
    {
      id: 2,
      title: "Sailing Blueprints",
      subtitle: "Configure default schedules",
      icon: Calendar,
      color: "orange",
      description: "Define weekly blueprints for sailings (e.g., standard Friday Sunset Cruise). This avoids setting up timings manually every day.",
      details: [
        "Go to the **Vessels** page and find your registered dhow.",
        "Click the **Blueprints** button to expand details, and click 'Add Template'.",
        "Select the meal type (Lunch vs. Sunset Cruise), departure & return times, operating days (e.g., Fri, Sat, Sun), price per person, and the flat fee for exclusive charter bookings.",
        "Save the blueprint template. Note: templates are plans and do not immediately create calendar entries."
      ],
      link: "/dhow-manager/vessels"
    },
    {
      id: 3,
      title: "Plan Sailings",
      subtitle: "Bulk generate calendar events",
      icon: PlusCircle,
      color: "red",
      description: "Populate the active calendar grid with voyage instances so guests can book spaces.",
      details: [
        "Go to the **Schedules** page on the sidebar.",
        "Click 'Plan Voyage' or click a day on the monthly grid to open the creation modal.",
        "Select the Dhow Vessel and sailing date (timings and pricing will default from your templates but can be tweaked ad-hoc).",
        "Submit the form to schedule the voyage. The schedule will show as a colored pill on the calendar grid."
      ],
      link: "/dhow-manager/schedules"
    },
    {
      id: 4,
      title: "Dining Packages",
      subtitle: "Create cruise menu options",
      icon: Utensils,
      color: "emerald",
      description: "Build dining menus (e.g. Seafood Delight, Deluxe Swahili Lunch) that guests choose from during booking.",
      details: [
        "Navigate to **Vessels** and choose the **Dining Packages** tab.",
        "Click 'Add Dining Package' and provide a name, price, meal type matching your sailing templates, and inclusions.",
        "Describe the culinary details (e.g., 5-course menu with wine pairings) and save."
      ],
      link: "/dhow-manager/vessels"
    },
    {
      id: 5,
      title: "Onboard Add-ons",
      subtitle: "Define optional extras",
      icon: Layers,
      color: "blue",
      description: "Add items that guests can pre-order to enhance their cruise experience.",
      details: [
        "Navigate to **Vessels** and select the **Add-ons** tab.",
        "Click 'Add Extra Add-on' to create stock items like Champagne, Wine, Cakes, or flowers.",
        "Set the pricing and short serving note, then save."
      ],
      link: "/dhow-manager/vessels"
    },
    {
      id: 6,
      title: "Walk-In Bookings",
      subtitle: "Register direct managers sales",
      icon: UserCheck,
      color: "purple",
      description: "Accept phone or desk walk-in bookings without routing them to standard online escrow gateways.",
      details: [
        "Go to the **Walk-In Booking** page on the sidebar.",
        "Step 1: Select the scheduled sailing voyage from the active voyages list.",
        "Step 2: Enter guest details (name, email, phone). Select whether they request Reschedule or Refund if the dhow does not sail.",
        "Step 3: Specify dining packages and optional add-ons.",
        "Step 4: Confirm booking. Direct walk-in payments bypass escrow accounts and write completed payments directly."
      ],
      link: "/dhow-manager/walk-in"
    },
    {
      id: 7,
      title: "Boarding checklist",
      subtitle: "Manage boarding days",
      icon: FileText,
      color: "teal",
      description: "Check in passengers and assign seating arrangements during sailing operations.",
      details: [
        "Go to the **Schedules** page calendar and click the active date.",
        "The right-side Manifest Drawer lists all confirmed guests.",
        "Check off guests as they board using the check-in checklist toggles.",
        "Assign and update tables to confirm optimal seating assignments."
      ],
      link: "/dhow-manager/schedules"
    },
    {
      id: 8,
      title: "Financial Center",
      subtitle: "Manage holds & refunds",
      icon: DollarSign,
      color: "emerald",
      description: "Approve refunds and track funds held in escrow for upcoming sailing voyages.",
      details: [
        "Navigate to the **Finance** section on the sidebar.",
        "Under the **Escrow Holdings** tab, track secure deposits from online Stripe pre-payments.",
        "Under the **Refund Processing** tab, view cancellation claims. Click 'Process Refund' to approve or reject.",
        "Input the bank or M-Pesa B2C payout transaction code, add accounts notes, and complete verification."
      ],
      link: "/dhow-manager/finance"
    },
    {
      id: 9,
      title: "Scanner & Reports",
      subtitle: "QR tickets & operations logs",
      icon: FileText,
      color: "indigo",
      description: "Scan guest boarding ticket QR codes and audit operational performance metrics.",
      details: [
        "To scan guest ticket QR codes, open the **Scanner** page on a phone or tablet. Point the camera at the guest's ticket to check them in, or type their code manually.",
        "Open the **Reports** section to review total gross revenue, average occupancy ratios, and minimum quota fulfillments.",
        "Filter stats by date, vessel, or booking status, and export full reports in a CSV format."
      ],
      link: "/dhow-manager/reports"
    }
  ];

  const currentStepData = steps.find(s => s.id === activeStep) || steps[0];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-6">
        <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl shadow-inner">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manager Setup Guide & Help</h1>
          <p className="text-sm text-slate-500 mt-1">Step-by-step instructions on setting up your fleet, templates, schedules, menus, and booking operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Steps Selection */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Setup Milestones</h3>
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
                    isActive ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold tracking-widest text-amber-500 uppercase block">Step 0{step.id}</span>
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
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-700">
                  <currentStepData.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-600 tracking-wider">Milestone Step 0{currentStepData.id}</span>
                  <h2 className="text-xl font-extrabold text-slate-900">{currentStepData.title}</h2>
                </div>
              </div>
              
              <Link 
                href={currentStepData.link}
                className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-600/10"
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
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span 
                      className="text-xs font-medium text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: detail }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips Callout */}
            <div className="p-4.5 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex gap-3 text-amber-800">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold block uppercase tracking-wider text-[10px]">Setup Tip</span>
                <p className="leading-relaxed">
                  Make sure all meal types match perfectly between sailings and dining packages. If packages don't match the active meal type, they won't appear to guests booking those slots.
                </p>
              </div>
            </div>
          </div>

          {/* Quick FAQ / FAQ List */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" /> Operational Frequently Asked Questions
            </h3>
            
            <div className="space-y-4 divide-y divide-slate-800">
              <div className="pt-4 first:pt-0 space-y-1.5">
                <span className="text-xs font-bold text-amber-400">Why are my sailings showing as square buttons or loaders?</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The portal limits full borders project-wide to 0.25rem corner curves by default. Standard items use custom styling overrides for perfect circles.
                </p>
              </div>

              <div className="pt-4 space-y-1.5">
                <span className="text-xs font-bold text-amber-400">What is the difference between template blueprints and schedule sailings?</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Blueprints are template patterns (e.g. Saturday cruises) to define repeating hours and base prices. Plan sailings generates the actual dates on the calendar that people can confirm bookings for.
                </p>
              </div>

              <div className="pt-4 space-y-1.5">
                <span className="text-xs font-bold text-amber-400">Why does a walk-in booking bypass standard escrow rules?</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Walk-in bookings are logged directly by managers. Since these payments are processed in person, they are logged as immediate manual completions without using digital secure escrows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
