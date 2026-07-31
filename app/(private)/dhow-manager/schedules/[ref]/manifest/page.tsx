"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFetchScheduleDetail, useFetchTables } from "@/hooks/vessels/actions";
import { useFetchBookings } from "@/hooks/bookings/actions";
import { updateBooking } from "@/services/bookings";
import { updateSchedule } from "@/services/vessels";
import { useSession } from "next-auth/react";
import { Booking } from "@/types/booking";
import { DigitalCheckInList } from "@/components/dhow-manager/DigitalCheckInList";
import { ArrowLeft, Lock, Check, Anchor, Share2, Mail, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton, SkeletonRow } from "@/components/common/Skeleton";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

export default function ManifestPage() {
  const params = useParams();
  const scheduleRef = params.ref as string;

  const { data: session } = useSession();
  const token = session?.user?.token || "";

  // Query Hooks
  const { data: schedule, isLoading: loadingSchedule, refetch: refetchSchedule } = useFetchScheduleDetail(scheduleRef);
  const { data: bookingsData, isLoading: loadingBookings, refetch: refetchBookings } = useFetchBookings(
    schedule?.id ? { schedule: schedule.id } : undefined
  );
  const { data: tablesData, refetch: refetchTables } = useFetchTables(schedule?.id);

  const [isClosingChecklist, setIsClosingChecklist] = useState(false);
  const [isReopeningChecklist, setIsReopeningChecklist] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReopenConfirmOpen, setIsReopenConfirmOpen] = useState(false);

  // Sharing states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [signedLink, setSignedLink] = useState("");

  const handleCombinedRefetch = () => {
    refetchBookings();
    refetchTables();
  };

  const fetchShareUrl = async (): Promise<string> => {
    try {
      // Use Next.js proxy route — Django host never exposed to browser
      const res = await fetch(`/api/manifest/${scheduleRef}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to generate link");
      const data = await res.json();
      setSignedLink(data.share_url);
      return data.share_url;
    } catch (err) {
      toast.error("Failed to generate secure manifest share link.");
      return "";
    }
  };

  const handleOpenShareModal = async () => {
    setIsShareModalOpen(true);
    if (!signedLink) {
      await fetchShareUrl();
    }
  };

  const handleCopySignedLink = async () => {
    let link = signedLink;
    if (!link) {
      link = await fetchShareUrl();
    }
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success("Secure sharing link copied to clipboard!");
    }
  };

  const handleSendEmail = async () => {
    if (!emailInput) {
      toast.error("Please enter a valid supervisor email.");
      return;
    }
    setIsSendingEmail(true);
    try {
      // Use Next.js proxy route — Django host never exposed to browser
      const res = await fetch(`/api/manifest/${scheduleRef}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      if (!res.ok) throw new Error("Failed to send email");
      toast.success(`Manifest link successfully emailed to ${emailInput}`);
      setIsShareModalOpen(false);
      setEmailInput("");
    } catch (err) {
      toast.error("Failed to email manifest link to supervisor.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loadingSchedule || loadingBookings) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  const isClosed = schedule?.status === "completed" || schedule?.status === "cancelled";

  const handleStatusChange = async (ref: string, newCheckInStatus: "pending" | "checked_in" | "no_show") => {
    if (schedule?.status === "completed") {
      toast.error("This voyage has already sailed. Checklist is locked.");
      return;
    }

    let backendStatus: "confirmed" | "completed" | "no_show" = "confirmed";
    if (newCheckInStatus === "checked_in") {
      backendStatus = "completed";
    } else if (newCheckInStatus === "no_show") {
      backendStatus = "no_show";
    }

    try {
      await updateBooking(ref, { status: backendStatus }, token);
      toast.success("Guest check-in status updated.");
      refetchBookings();
    } catch (err) {
      toast.error("Failed to update check-in status.");
    }
  };

  const handleCloseChecklist = async () => {
    if (!schedule) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = async () => {
    setIsConfirmOpen(false);
    setIsClosingChecklist(true);
    try {
      await updateSchedule(scheduleRef, { status: "completed" }, token);
      toast.success("Voyage checklist successfully closed.");
      refetchSchedule();
    } catch (err) {
      toast.error("Failed to close sailing checklist.");
    } finally {
      setIsClosingChecklist(false);
    }
  };

  const handleConfirmReopen = async () => {
    setIsReopenConfirmOpen(false);
    setIsReopeningChecklist(true);
    try {
      await updateSchedule(scheduleRef, { status: "confirmed", is_open: true }, token);
      toast.success("Sailing checklist reopened successfully.");
      refetchSchedule();
      refetchBookings();
    } catch (err) {
      toast.error("Failed to reopen sailing checklist.");
    } finally {
      setIsReopeningChecklist(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Closed Banner Warning */}
      {isClosed && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 px-5 py-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <Lock className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div className="text-xs font-semibold">
            Sailing Checklist Locked: The dhow has completed boarding and has sailed. Passengers check-in status cannot be modified.
          </div>
        </div>
      )}

      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dhow-manager/schedules"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily Sailing Manifest & Check-In</h1>
            {schedule && (
              <p className="text-sm text-slate-500 font-medium">
                {schedule.dhow_name} | {schedule.date} ({schedule.meal_type_display}) | {schedule.departure_time.substring(0,5)} - {schedule.return_time.substring(0,5)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {schedule && (
            <button
              onClick={handleOpenShareModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              Share Public Manifest
            </button>
          )}

          {schedule && !isClosed && (
            <button
              onClick={handleCloseChecklist}
              disabled={isClosingChecklist}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-800/80 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:cursor-not-allowed"
            >
              {isClosingChecklist ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                  Closing Checklist...
                </>
              ) : (
                <>
                  <Anchor className="w-4 h-4" />
                  Mark Dhow as Sailed (Close Checklist)
                </>
              )}
            </button>
          )}

          {schedule && isClosed && schedule.status !== "cancelled" && (
            <button
              onClick={() => setIsReopenConfirmOpen(true)}
              disabled={isReopeningChecklist}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/80 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:cursor-not-allowed"
            >
              {isReopeningChecklist ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                  Reopening...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Reopen Sailing Checklist
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Manifest List Component */}
      <DigitalCheckInList
        bookings={bookingsData?.results || []}
        tables={tablesData?.results || []}
        token={token}
        onRefetch={handleCombinedRefetch}
        scheduleRef={scheduleRef}
        onStatusChange={handleStatusChange}
        disabled={isClosed}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Mark Dhow as Sailed"
        message="Are you sure you want to mark this sailing as sailed? This will lock the check-in list and passenger seating configuration."
        confirmText="Confirm & Close"
        cancelText="Cancel"
        type="warning"
        isLoading={isClosingChecklist}
        onConfirm={handleConfirmClose}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <ConfirmationModal
        isOpen={isReopenConfirmOpen}
        title="Reopen Sailing Checklist"
        message="Are you sure you want to reopen this checklist? The sailing will return to Confirmed status and be editable again."
        confirmText="Yes, Reopen"
        cancelText="Cancel"
        type="warning"
        isLoading={isReopeningChecklist}
        onConfirm={handleConfirmReopen}
        onCancel={() => setIsReopenConfirmOpen(false)}
      />

      {/* Share Modal Dialog */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-600" /> Share Crew Manifest
              </h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Generate a secure, single-day manifest access link or email it directly to docking supervisors.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Supervisor Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="supervisor@tamarind.co.ke"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-700/80 px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 disabled:cursor-not-allowed"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Send
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Copy Access Link
                </label>
                <div className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                  <input
                    type="text"
                    readOnly
                    value={signedLink || "Generating secure link..."}
                    className="w-full bg-transparent border-none text-[10px] font-mono text-slate-500 truncate focus:outline-none px-2"
                  />
                  <button
                    onClick={handleCopySignedLink}
                    disabled={!signedLink}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
