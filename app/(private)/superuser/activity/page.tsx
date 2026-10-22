"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Search } from "lucide-react"
import {
    useFetchBookingReschedules,
    useFetchBookingStatusLogs,
    useFetchRefundStatusLogs,
} from "@/hooks/activity/actions"
import LoadingSpinner from "@/components/dhow-manager/LoadingSpinner"

type Tab = "bookings" | "refunds" | "reschedules"

interface Row {
    id: string
    when: string
    reference: string
    from: string
    to: string
    by: string
    notes: string
}

const TABS: { key: Tab; label: string; description: string }[] = [
    { key: "bookings", label: "Booking changes", description: "Every time a booking was cancelled or marked as a no-show, and who did it." },
    { key: "refunds", label: "Refund decisions", description: "Every refund that was approved or rejected, and who did it." },
    { key: "reschedules", label: "Reschedules", description: "Bookings moved from one sailing to another." },
]

const pretty = (status?: string | null) =>
    status ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—"

const formatWhen = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })

export default function ActivityLogPage() {
    const [tab, setTab] = useState<Tab>("bookings")
    const [query, setQuery] = useState("")

    const bookingLogs = useFetchBookingStatusLogs()
    const refundLogs = useFetchRefundStatusLogs()
    const reschedules = useFetchBookingReschedules()

    const rows: Row[] = useMemo(() => {
        if (tab === "bookings") {
            return (bookingLogs.data?.results || []).map((log) => ({
                id: log.id,
                when: log.created_at,
                reference: log.booking_reference,
                from: pretty(log.old_status),
                to: pretty(log.new_status),
                by: log.changed_by_email || "System",
                notes: log.notes || "",
            }))
        }
        if (tab === "refunds") {
            return (refundLogs.data?.results || []).map((log) => ({
                id: log.id,
                when: log.created_at,
                reference: log.refund_reference,
                from: pretty(log.old_status),
                to: pretty(log.new_status),
                by: log.changed_by_email || "System",
                notes: log.notes || "",
            }))
        }
        return (reschedules.data?.results || []).map((r) => ({
            id: r.id,
            when: r.created_at,
            reference: r.booking_reference || r.reference,
            from: r.original_schedule_date || "—",
            to: r.new_schedule_date || "Not chosen yet",
            by: r.status_display || pretty(r.status),
            notes: [r.reason, r.notes].filter(Boolean).join(" · "),
        }))
    }, [tab, bookingLogs.data, refundLogs.data, reschedules.data])

    const visibleRows = useMemo(() => {
        const q = query.toLowerCase().trim()
        if (!q) return rows
        return rows.filter((r) =>
            [r.reference, r.from, r.to, r.by, r.notes].some((f) => f.toLowerCase().includes(q))
        )
    }, [rows, query])

    const active = { bookings: bookingLogs, refunds: refundLogs, reschedules }[tab]
    const current = TABS.find((t) => t.key === tab)!

    if (bookingLogs.isLoading && refundLogs.isLoading && reschedules.isLoading) {
        return <LoadingSpinner text="Loading activity..." />
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Activity Log</h1>
                <p className="text-sm text-gray-500 mt-1">See who changed what, and when.</p>
            </div>

            <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                            tab === t.key
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded shadow border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                    <p className="text-xs text-gray-500">{current.description}</p>
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search reference, person, status..."
                            className="w-full sm:w-64 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                {active.error ? (
                    <div className="py-16 text-center text-sm text-red-500 font-medium">
                        Couldn&apos;t load this log. Please try again.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">When</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                        {tab === "refunds" ? "Refund" : "Booking"}
                                    </th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                        {tab === "reschedules" ? "Sailing date" : "Change"}
                                    </th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                        {tab === "reschedules" ? "Status" : "Done by"}
                                    </th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visibleRows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50 align-top">
                                        <td className="px-6 py-4 text-xs text-gray-500 font-semibold whitespace-nowrap">{formatWhen(row.when)}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[10px] font-semibold bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100">
                                                {row.reference}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                                <span className="text-gray-400">{row.from}</span>
                                                <ArrowRight className="w-3 h-3 text-gray-300" />
                                                <span>{row.to}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-700">{row.by}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">{row.notes || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visibleRows.length === 0 && (
                            <div className="py-16 text-center">
                                <p className="text-sm text-gray-400 font-semibold">
                                    {active.isLoading ? "Loading..." : rows.length ? "Nothing matches your search." : "Nothing recorded yet."}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
