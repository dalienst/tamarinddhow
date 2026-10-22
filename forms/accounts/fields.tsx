"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

// Shared input styling for the admin user forms.
export const inputClass =
  "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder-gray-400 font-semibold";

export function Field({
  label,
  icon: Icon,
  error,
  hint,
  children,
}: {
  label: string;
  icon: LucideIcon;
  error?: string | false;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 font-mono">
        <Icon className="w-3.5 h-3.5 text-gray-400" /> {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

/** Pulls the first readable message out of a DRF error response. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    for (const value of Object.values(data as Record<string, unknown>)) {
      if (typeof value === "string") return value;
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    }
  }
  return fallback;
}
