"use client";

import React from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface TicketQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingRef: string;
}

export const TicketQRModal: React.FC<TicketQRModalProps> = ({
  isOpen,
  onClose,
  bookingRef,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const ticketUrl = `${window.location.origin}/ticket/${bookingRef}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingRef)}&color=0f172a&bgcolor=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ticketUrl);
    setCopied(true);
    toast.success("Boarding pass link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 relative text-center animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-900 text-lg">
            Passenger Ticket Code
          </h3>
          <p className="text-xs font-mono font-bold text-slate-500">
            Reference: {bookingRef}
          </p>
        </div>

        {/* QR Code */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-center items-center max-w-[220px] mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt="Boarding Pass QR"
            className="w-48 h-48 object-contain rounded-lg border border-slate-200 bg-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Link
          </button>
          
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/10 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Pass
          </a>
        </div>
      </div>
    </div>
  );
};
