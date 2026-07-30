"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Calendar,
  Users,
  DollarSign,
  UserPlus,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
  Anchor,
  Clock,
  Plus,
  X
} from "lucide-react";

import { useFetchAccount, useFetchAllUsers } from "@/hooks/accounts/actions"
import { useFetchBookings } from "@/hooks/bookings/actions"
import { useFetchSchedules, useFetchDhows } from "@/hooks/vessels/actions"
import { User } from "@/services/accounts"
import CreateAgent from "@/forms/accounts/CreateAgent"
import CreateDhowManager from "@/forms/accounts/CreateDhowManager"
import LoadingSpinner from "@/components/dhow-manager/LoadingSpinner"

export default function DhowManagerDashboard() {
  const { data: account, isLoading: accountLoading } = useFetchAccount()
  const { data: accountsData, isLoading: accountsLoading, error: accountsError, refetch } = useFetchAllUsers()
  const { data: schedulesData, isLoading: schedulesLoading } = useFetchSchedules()
  const { data: dhowsData, isLoading: dhowsLoading } = useFetchDhows()
  const { data: bookingsData, isLoading: bookingsLoading } = useFetchBookings()
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<"agent" | "manager" | null>(null)

  if (accountLoading || accountsLoading || schedulesLoading || dhowsLoading || bookingsLoading) {
      return <LoadingSpinner />
  }

  if (accountsError) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-medium">
              Error loading dashboard data. Please try again.
          </div>
      )
  }

  const users = (accountsData?.results || []).slice(0, 5)
  const schedules = (schedulesData?.results || []).slice(0, 5)
  const dhows = (dhowsData?.results || []).slice(0, 5)
  const bookings = (bookingsData?.results || []).slice(0, 5)

  const closeModal = () => {
      setActiveModal(null)
  }

  const handleSuccess = () => {
      refetch()
      closeModal()
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Ship className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Tamarind Dhow Control Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Manager Operations Dashboard
          </h1>
          <p className="text-amber-200/90 text-sm max-w-2xl">
            Real-time sailing capacity, minimum quota meters, digital passenger manifests, table seating assignments, escrow holdings, and financial reporting.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dhow-manager/schedules"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Schedule Center</h3>
          <p className="text-xs text-slate-500 mt-1">Manage sailings, templates, open/close, and sailing confirmations.</p>
        </Link>

        <Link
          href="/dhow-manager/walk-in"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserPlus className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Walk-In & Phone Booking</h3>
          <p className="text-xs text-slate-500 mt-1">Register walk-in guests with explicit payment states (Cash/Card/M-Pesa).</p>
        </Link>

        <Link
          href="/dhow-manager/finance"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <DollarSign className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Financials & Escrow</h3>
          <p className="text-xs text-slate-500 mt-1">Monitor escrow holdings & process guest refund reversals.</p>
        </Link>

        <Link
          href="/dhow-manager/reports"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Analytics & Reports</h3>
          <p className="text-xs text-slate-500 mt-1">Revenue, occupancy rates, quota fulfillment, and escrow audits.</p>
        </Link>
      </div>

      {/* Row 1: Sailing List (5) & Vessel List (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sailing List Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" /> Upcoming Sailings
            </h2>
            <Link
              href="/dhow-manager/schedules"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
            >
              Manage all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/20 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">Capacity</th>
                  <th className="px-6 py-3">Gating</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="font-bold text-slate-900">{s.dhow_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.date} • {s.meal_type_display}</div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="font-semibold text-slate-800">{s.current_pax_count} Pax</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        s.is_open 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {s.is_open ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.status}</span>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                      No active sailings scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vessel List Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Anchor className="w-5 h-5 text-amber-600" /> Vessels Registry
            </h2>
            <Link
              href="/dhow-manager/vessels"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
            >
              Configure <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/20 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Vessel</th>
                  <th className="px-6 py-3">Capacity (Max / Min)</th>
                  <th className="px-6 py-3">Operations</th>
                  <th className="px-6 py-3">Gating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {dhows.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5 font-bold text-slate-900">{d.name}</td>
                    <td className="px-6 py-4.5">
                      <span className="font-mono text-slate-600">{d.total_capacity} Max / {d.min_quota} Min</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        d.is_available 
                          ? "bg-blue-50 text-blue-700 border border-blue-100" 
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {d.is_available ? "In Service" : "Out of Service"}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      {d.is_active ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Inactive</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {dhows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                      No vessels configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: Recent Bookings (5) & Users (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Guest Bookings Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" /> Recent Guest Bookings
            </h2>
            <Link
              href="/dhow-manager/walk-in"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
            >
              Bookings Log <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/20 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Reference & Guest</th>
                  <th className="px-6 py-3">Pax Count</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="font-mono font-bold text-slate-900">{b.reference}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{b.booked_by_name || "Walk-In Guest"}</div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="font-semibold text-slate-800">{b.party_size} Pax</span>
                    </td>
                    <td className="px-6 py-4.5 font-bold text-amber-700">
                      KES {parseFloat((b.total_amount || 0).toString()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === "confirmed" || b.status === "completed"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                          : b.status === "cancelled"
                          ? "bg-rose-50 text-rose-800 border border-rose-100"
                          : "bg-amber-50 text-amber-800 border border-amber-100"
                      }`}>
                        {b.status_display || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                      No bookings recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 relative overflow-visible">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" /> User Registry
            </h2>
            
            {/* Popover Wrapper */}
            <div className="relative">
              <button 
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-700 transition-all flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add User
              </button>
              
              {isPopoverOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsPopoverOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        setActiveModal("agent")
                        setIsPopoverOpen(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Create Agent
                    </button>
                    <button
                      onClick={() => {
                        setActiveModal("manager")
                        setIsPopoverOpen(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Create Dhow Manager
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/20 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">Identifier</th>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {users.map((user: User) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.first_name} {user.last_name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="font-mono text-[9px] font-semibold bg-slate-50 px-1.5 py-0.5 rounded text-slate-600 border border-slate-100">
                        {user.usercode}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex gap-1.5">
                        {user.is_superuser && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                            Admin
                          </span>
                        )}
                        {user.is_dhow_manager && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                            Manager
                          </span>
                        )}
                        {user.is_agent && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                            Agent
                          </span>
                        )}
                        {user.is_guest && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-100">
                            Guest
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      {user.is_active ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Inactive</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Plain Tailwind Modal Implementation */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {activeModal === "agent" ? "Create New Agent" : "Create Dhow Manager"}
              </h3>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {activeModal === "agent" ? (
                <CreateAgent onSuccess={handleSuccess} onCancel={closeModal} />
              ) : (
                <CreateDhowManager onSuccess={handleSuccess} onCancel={closeModal} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}