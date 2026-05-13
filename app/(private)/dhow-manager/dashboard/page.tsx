"use client"

import { useFetchAccount, useFetchAllUsers } from "@/hooks/accounts/actions"
import { User } from "@/services/accounts"

export default function DhowManagerDashboard() {
    const { data: account, isLoading: accountLoading } = useFetchAccount()
    const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useFetchAllUsers()

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

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Dhow Manager Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and monitor platform users and voyages</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded shadow flex items-center gap-4 border border-gray-100">
                        <div className="text-right border-r border-gray-100 pr-4">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Active Manager</p>
                            <p className="text-sm font-semibold text-primary">{account?.first_name} {account?.last_name}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                            {account?.first_name?.[0]}{account?.last_name?.[0]}
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded border border-gray-100 shadow">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</p>
                        <p className="text-xl font-semibold text-gray-900 mt-1">{accountsData?.count || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-100 shadow">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New This Month</p>
                        <p className="text-xl font-semibold text-gray-900 mt-1">12</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-100 shadow">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Sessions</p>
                        <p className="text-xl font-semibold text-green-600 mt-1">8</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-100 shadow">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Health</p>
                        <p className="text-xl font-semibold text-primary mt-1">Optimal</p>
                    </div>
                </div>

                {/* Users Table Section */}
                <div className="bg-white rounded shadow border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">User Registry</h2>
                        <button className="bg-primary text-white px-4 py-2 rounded text-xs font-semibold hover:bg-primary-hover transition-all">
                            + Add New User
                        </button>
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
            </div>
        </div>
    )
}