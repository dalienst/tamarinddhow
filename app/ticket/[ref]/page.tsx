"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicTicketDetail } from "@/services/bookings";
import { Anchor, Calendar, Clock, MapPin, Printer, QrCode, Ship, User, Users, AlertTriangle } from "lucide-react";

export default function PublicTicketPage() {
  const { ref } = useParams() as { ref: string };
  const [ticket, setTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ref) return;
    getPublicTicketDetail(ref)
      .then((res) => {
        setTicket(res);
      })
      .catch(() => {
        setError("Boarding pass not found or invalid reference.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ref]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderRadius: "50%" }} />
          <p className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold animate-pulse">
            Retrieving Boarding Pass...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black tracking-tight text-white">Invalid Ticket</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            The booking reference code provided does not exist or has expired. Please verify your receipt.
          </p>
        </div>
      </div>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.reference)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center">
      {/* Decorative Background Dhow Icon */}
      <div className="absolute right-0 top-0 translate-x-24 -translate-y-24 opacity-5 pointer-events-none text-white">
        <Ship className="w-96 h-96" />
      </div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative print:shadow-none print:border-none">
        
        {/* Ticket Header (Premium Boarding Pass style) */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-950 text-white p-6 sm:p-8 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                Boarding Pass
              </span>
              <h1 className="text-xl font-black tracking-tight">{ticket.dhow_name || "Tamarind Dhow"}</h1>
              <p className="text-[10px] text-amber-200/80 font-bold uppercase tracking-wider">
                Voyage Reference
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-black text-amber-400 tracking-wider">
                {ticket.reference}
              </div>
              <span className={`inline-block text-[8px] font-extrabold uppercase px-2 py-0.5 rounded mt-1 border ${
                ticket.status === "confirmed" || ticket.status === "completed"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                {ticket.status_display}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center space-y-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="Ticket QR Code"
                className="w-40 h-40 object-contain"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Scan at dock to board
            </span>
          </div>

          {/* Voyage Details */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Sailing Date
              </span>
              <span className="font-extrabold text-slate-800 block text-sm">{ticket.schedule_date}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Cruise Time
              </span>
              <span className="font-extrabold text-slate-800 block text-sm">
                {ticket.departure_time} - {ticket.return_time} ({ticket.schedule_meal_type})
              </span>
            </div>
          </div>

          {/* Seating & Host Info */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-600" /> Guest Details
              </span>
              <span className="font-extrabold text-slate-800 block text-sm">
                {ticket.booked_by_name} ({ticket.party_size} Pax)
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> Table Assignment
              </span>
              <span className="font-black text-amber-700 block text-sm">
                {ticket.table_number ? `Table ${ticket.table_number}` : "Assigned at Dock"}
              </span>
            </div>
          </div>

          {/* Passenger Roster Checklist */}
          {ticket.booking_guests && ticket.booking_guests.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Manifest Passenger Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {ticket.booking_guests.map((g: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-800 truncate leading-tight">
                        {g.first_name} {g.last_name}
                      </div>
                      <span className="text-[8px] text-slate-400 uppercase font-semibold">
                        {g.is_primary ? "Primary Passenger" : "Guest"}
                      </span>
                    </div>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      g.status === "checked_in" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                    }`}>
                      {g.status === "checked_in" ? "Boarded" : "Absent"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Requirements */}
          {ticket.special_requests && (
            <div className="bg-amber-50/60 border border-amber-200 text-amber-950 p-3 rounded-2xl text-xs font-semibold">
              <div className="text-[8px] text-amber-700 uppercase tracking-widest font-bold mb-1">
                Dietary & Special Requests
              </div>
              <p className="leading-relaxed font-medium">{ticket.special_requests}</p>
            </div>
          )}

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 print:hidden cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Boarding Pass / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
