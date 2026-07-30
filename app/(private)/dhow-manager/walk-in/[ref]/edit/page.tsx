"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getBookingDetail } from "@/services/bookings";
import { Edit3, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import WalkInBookingForm from "@/forms/walk-in/WalkInBookingForm";
import { Booking } from "@/types/booking";

export default function EditBookingPage() {
  const router = useRouter();
  const { ref } = useParams() as { ref: string };
  const { data: session } = useSession();
  const token = session?.user?.token || "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ref || !token) return;

    setLoading(true);
    getBookingDetail(ref, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        setBooking(res);
      })
      .catch(() => {
        setError("Failed to load booking details or reference is invalid.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ref, token]);

  const handleSuccess = () => {
    toast.success("Booking modifications saved successfully!");
    router.push("/dhow-manager/walk-in");
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6 text-slate-500">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Fetching Booking Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm animate-fadeIn">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Booking Not Found</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {error || "Could not retrieve this reservation details. Please check the reference code."}
        </p>
        <button
          onClick={() => router.push("/dhow-manager/walk-in")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back navigation & Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

        <div className="border-b border-gray-150 pb-5 space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Edit3 className="w-7 h-7 text-amber-600" />
            Modify Booking Details
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Edit passenger size, pricing overrides, discount codes, table assignments, or dietary requests for reference <span className="font-mono font-bold text-slate-700">{booking.reference}</span>.
          </p>
        </div>
      </div>

      {/* Form Card wrapper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <WalkInBookingForm
          token={token}
          bookingToEdit={booking}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
