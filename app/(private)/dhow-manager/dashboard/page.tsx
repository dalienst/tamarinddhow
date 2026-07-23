"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Calendar,
  Users,
  DollarSign,
  UserPlus,
  QrCode,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { useFetchAccount, useFetchAllUsers } from "@/hooks/accounts/actions"
import { User } from "@/services/accounts"
import CreateAgent from "@/forms/accounts/CreateAgent"
import CreateDhowManager from "@/forms/accounts/CreateDhowManager"

export default function DhowManagerDashboard() {
  const { data: account, isLoading: accountLoading } = useFetchAccount()
  const { data: accountsData, isLoading: accountsLoading, error: accountsError, refetch } = useFetchAllUsers()
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<"agent" | "manager" | null>(null)

  if (accountLoading || accountsLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
      )
  }

  if (accountsError) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-medium">
              Error loading users. Please try again.
          </div>
      )
  }

  const users = accountsData?.results || []

  const closeModal = () => {
      setActiveModal(null)
  }

  const handleSuccess = () => {
      refetch()
      closeModal()
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
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

      {/* Operational Highlights Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Ship className="w-5 h-5 text-amber-600" /> Key Dhow Management Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dhow-manager/vessels"
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors block"
          >
            <span className="font-semibold text-slate-800 text-sm block">Vessels & Packages</span>
            <span className="text-xs text-slate-500">Configure Dhow capacities, minimum quotas, and dining packages.</span>
          </Link>

          <Link
            href="/dhow-manager/schedules"
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors block"
          >
            <span className="font-semibold text-slate-800 text-sm block">Digital Check-In & Manifests</span>
            <span className="text-xs text-slate-500">Open a schedule to generate daily sailing list & check in guests.</span>
          </Link>

          <Link
            href="/dhow-manager/schedules"
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors block"
          >
            <span className="font-semibold text-slate-800 text-sm block">Dynamic Table Layouts</span>
            <span className="text-xs text-slate-500">Configure 8 or 12 tables dynamically per sailing and assign seats.</span>
          </Link>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center relative overflow-visible">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> User Registry
              </h2>
              
              {/* Popover Wrapper */}
              <div className="relative">
                  <button 
                      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                      className="bg-primary text-white px-4 py-2 rounded text-xs font-semibold hover:bg-primary-hover transition-all flex items-center gap-2"
                  >
                      <UserPlus className="w-4 h-4" /> Add New User
                  </button>
                  
                  {isPopoverOpen && (
                      <>
                          <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setIsPopoverOpen(false)}
                          ></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
                              <button
                                  onClick={() => {
                                      setActiveModal("agent")
                                      setIsPopoverOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                  Create Agent
                              </button>
                              <button
                                  onClick={() => {
                                      setActiveModal("manager")
                                      setIsPopoverOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                  Create Dhow Manager
                              </button>
                          </div>
                      </>
                  )}
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-gray-50/50">
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">User Details</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Identifier</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Access Level</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Joined On</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {users.map((user: User) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-primary/5 rounded flex items-center justify-center text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-white transition-all">
                                          {user.first_name?.[0]}{user.last_name?.[0]}
                                      </div>
                                      <div>
                                          <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                                          <p className="text-xs text-gray-500">{user.email}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="font-mono text-[10px] font-semibold bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100">
                                      {user.usercode}
                                  </span>
                              </td>
                              <td className="px-6 py-4">
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
                              <td className="px-6 py-4">
                                  {user.is_active ? (
                                      <div className="flex items-center gap-1.5 text-green-600">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                                          <span className="text-[10px] font-semibold uppercase tracking-wider">Active</span>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-1.5 text-gray-400">
                                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                          <span className="text-[10px] font-semibold uppercase tracking-wider">Inactive</span>
                                      </div>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-500 font-semibold">
                                  {new Date(user.created_at).toLocaleDateString()}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          {users.length === 0 && (
              <div className="py-20 text-center">
                  <p className="text-sm text-gray-400 font-semibold">No users found.</p>
              </div>
          )}
      </div>

      {/* Plain Tailwind Modal Implementation */}
      {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                  className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
                  onClick={closeModal}
              ></div>
              
              {/* Modal Content */}
              <div className="relative bg-white rounded shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">
                          {activeModal === "agent" ? "Create New Agent" : "Create Dhow Manager"}
                      </h3>
                      <button 
                          onClick={closeModal}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
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