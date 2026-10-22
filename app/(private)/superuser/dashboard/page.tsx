"use client"

import { useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { Pencil, Search, UserCheck, UserX } from "lucide-react"
import { useFetchAccount, useFetchAllUsers } from "@/hooks/accounts/actions"
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth"
import { adminUpdateUser, User } from "@/services/accounts"
import CreateAgent from "@/forms/accounts/CreateAgent"
import CreateDhowManager from "@/forms/accounts/CreateDhowManager"
import CreateSupervisor from "@/forms/accounts/CreateSupervisor"
import CreateSuperuser from "@/forms/accounts/CreateSuperuser"
import EditUser from "@/forms/accounts/EditUser"
import { apiErrorMessage } from "@/forms/accounts/fields"
import LoadingSpinner from "@/components/dhow-manager/LoadingSpinner"
import { ConfirmationModal } from "@/components/common/ConfirmationModal"

type CreateModal = "agent" | "manager" | "supervisor" | "superuser"
type RoleFilter = "all" | "admin" | "manager" | "supervisor" | "agent" | "guest" | "inactive"

const MODAL_TITLES: Record<CreateModal, string> = {
    agent: "Create New Agent",
    manager: "Create Dhow Manager",
    supervisor: "Create Supervisor",
    superuser: "Create Superuser",
}

const FILTERS: { value: RoleFilter; label: string }[] = [
    { value: "all", label: "All users" },
    { value: "admin", label: "Admins" },
    { value: "manager", label: "Managers" },
    { value: "supervisor", label: "Supervisors" },
    { value: "agent", label: "Agents" },
    { value: "guest", label: "Guests" },
    { value: "inactive", label: "Deactivated" },
]

const matchesFilter = (user: User, filter: RoleFilter) => {
    switch (filter) {
        case "admin": return user.is_superuser || user.is_staff
        case "manager": return user.is_dhow_manager
        case "supervisor": return user.is_supervisor
        case "agent": return user.is_agent
        case "guest": return user.is_guest
        case "inactive": return !user.is_active
        default: return true
    }
}

export default function SuperuserDashboard() {
    const { data: session } = useSession()
    const headers = useAxiosAuth()
    const { data: account, isLoading: accountLoading } = useFetchAccount()
    const { data: accountsData, isLoading: accountsLoading, error: accountsError, refetch } = useFetchAllUsers()

    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [activeModal, setActiveModal] = useState<CreateModal | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [statusTarget, setStatusTarget] = useState<User | null>(null)
    const [statusSaving, setStatusSaving] = useState(false)
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState<RoleFilter>("all")

    const users = useMemo(() => accountsData?.results || [], [accountsData])

    const stats = useMemo(() => {
        const now = new Date()
        return {
            total: users.length,
            newThisMonth: users.filter((u) => {
                const joined = new Date(u.created_at)
                return joined.getFullYear() === now.getFullYear() && joined.getMonth() === now.getMonth()
            }).length,
            staff: users.filter((u) => u.is_dhow_manager || u.is_supervisor).length,
            inactive: users.filter((u) => !u.is_active).length,
        }
    }, [users])

    const visibleUsers = useMemo(() => {
        const q = query.toLowerCase().trim()
        return users.filter((u) =>
            matchesFilter(u, filter) &&
            (!q || [u.first_name, u.last_name, u.email, u.username, u.usercode, u.phone_number]
                .some((field) => field?.toLowerCase().includes(q)))
        )
    }, [users, query, filter])

    if (accountLoading || accountsLoading) {
        return <LoadingSpinner />
    }

    if (accountsError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-medium">
                Error loading users. Please try again.
            </div>
        )
    }

    const closeModal = () => {
        setActiveModal(null)
        setEditingUser(null)
    }

    const handleSuccess = () => {
        refetch()
        closeModal()
    }

    const toggleActive = async () => {
        if (!statusTarget) return
        setStatusSaving(true)
        try {
            await adminUpdateUser(statusTarget.usercode, { is_active: !statusTarget.is_active }, headers)
            toast.success(statusTarget.is_active ? "Account deactivated" : "Account reactivated")
            setStatusTarget(null)
            refetch()
        } catch (error) {
            toast.error(apiErrorMessage(error, "Failed to update account status"))
        } finally {
            setStatusSaving(false)
        }
    }

    const createOptions: { key: CreateModal; label: string }[] = [
        { key: "manager", label: "Create Dhow Manager" },
        { key: "supervisor", label: "Create Supervisor" },
        { key: "agent", label: "Create Agent" },
        // Only superusers may create other superusers (enforced by the API too).
        ...(session?.user?.is_superuser ? [{ key: "superuser" as const, label: "Create Superuser" }] : []),
    ]

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Superuser Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and monitor platform users</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded shadow flex items-center gap-4 border border-gray-100">
                        <div className="text-right border-r border-gray-100 pr-4">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Active Superuser</p>
                            <p className="text-sm font-semibold text-primary">{account?.first_name} {account?.last_name}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                            {account?.first_name?.[0]}{account?.last_name?.[0]}
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Users", value: stats.total, tone: "text-gray-900" },
                        { label: "New This Month", value: stats.newThisMonth, tone: "text-gray-900" },
                        { label: "Managers & Supervisors", value: stats.staff, tone: "text-primary" },
                        { label: "Deactivated", value: stats.inactive, tone: stats.inactive ? "text-red-600" : "text-gray-900" },
                    ].map((card) => (
                        <div key={card.label} className="bg-white p-4 rounded border border-gray-100 shadow">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                            <p className={`text-xl font-semibold mt-1 ${card.tone}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Users Table Section */}
                <div className="bg-white rounded shadow border border-gray-100 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex flex-col lg:flex-row gap-3 lg:items-center justify-between relative overflow-visible">
                        <h2 className="text-lg font-semibold text-gray-900">User Registry</h2>

                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search name, email, phone..."
                                    className="w-full sm:w-64 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as RoleFilter)}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {FILTERS.map((f) => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>

                            {/* Popover Wrapper */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                                    className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded text-xs font-semibold hover:bg-primary-hover transition-all"
                                >
                                    + Add New User
                                </button>

                                {isPopoverOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsPopoverOpen(false)}
                                        ></div>
                                        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-52 bg-white rounded shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
                                            {createOptions.map((option) => (
                                                <button
                                                    key={option.key}
                                                    onClick={() => {
                                                        setActiveModal(option.key)
                                                        setIsPopoverOpen(false)
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
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
                                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visibleUsers.map((user: User) => {
                                    const isSelf = user.usercode === account?.usercode
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/5 rounded flex items-center justify-center text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {user.first_name} {user.last_name}
                                                            {isSelf && <span className="ml-1.5 text-[10px] font-semibold text-gray-400">(You)</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                        {user.phone_number && <p className="text-xs text-gray-400">{user.phone_number}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-[10px] font-semibold bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100">
                                                    {user.usercode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
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
                                                    {user.is_supervisor && (
                                                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            Supervisor
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
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider">Deactivated</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-semibold">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isSelf ? (
                                                    <p className="text-right text-[10px] text-gray-400 font-semibold">Edit under My Profile</p>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50"
                                                        >
                                                            <Pencil className="w-3 h-3" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setStatusTarget(user)}
                                                            className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded border whitespace-nowrap ${
                                                                user.is_active
                                                                    ? "text-red-600 bg-red-50/50 border-red-100 hover:bg-red-50"
                                                                    : "text-green-700 bg-green-50/50 border-green-100 hover:bg-green-50"
                                                            }`}
                                                        >
                                                            {user.is_active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                                            {user.is_active ? "Deactivate" : "Reactivate"}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    {visibleUsers.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-sm text-gray-400 font-semibold">
                                {users.length === 0 ? "No users found." : "No users match your search."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Plain Tailwind Modal Implementation */}
            {(activeModal || editingUser) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">
                                {editingUser
                                    ? `Edit ${editingUser.first_name} ${editingUser.last_name}`
                                    : MODAL_TITLES[activeModal!]}
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
                            {editingUser ? (
                                <EditUser user={editingUser} onSuccess={handleSuccess} onCancel={closeModal} />
                            ) : activeModal === "agent" ? (
                                <CreateAgent onSuccess={handleSuccess} onCancel={closeModal} />
                            ) : activeModal === "supervisor" ? (
                                <CreateSupervisor onSuccess={handleSuccess} onCancel={closeModal} />
                            ) : activeModal === "superuser" ? (
                                <CreateSuperuser onSuccess={handleSuccess} onCancel={closeModal} />
                            ) : (
                                <CreateDhowManager onSuccess={handleSuccess} onCancel={closeModal} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!statusTarget}
                title={statusTarget?.is_active ? "Deactivate account?" : "Reactivate account?"}
                message={
                    statusTarget?.is_active
                        ? `${statusTarget?.first_name} ${statusTarget?.last_name} will no longer be able to sign in. Their bookings and history are kept, and you can reactivate them at any time.`
                        : `${statusTarget?.first_name} ${statusTarget?.last_name} will be able to sign in again.`
                }
                confirmText={statusTarget?.is_active ? "Deactivate" : "Reactivate"}
                type={statusTarget?.is_active ? "danger" : "success"}
                isLoading={statusSaving}
                onConfirm={toggleActive}
                onCancel={() => setStatusTarget(null)}
            />
        </div>
    )
}
