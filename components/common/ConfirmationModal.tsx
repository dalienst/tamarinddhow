"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Info, CheckCircle2, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  placeholder?: string; // If provided, behaves as a prompt (input dialog)
  defaultValue?: string; // Default value for prompt input
  isLoading?: boolean; // Controls loading spinner on action button
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  placeholder,
  defaultValue = "",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(placeholder !== undefined ? inputValue : undefined);
  };

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
          iconBg: "bg-rose-50",
          btn: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          iconBg: "bg-emerald-50",
          btn: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
        };
      case "info":
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          iconBg: "bg-blue-50",
          btn: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
        };
      case "warning":
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: "bg-amber-50",
          btn: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 scale-95 border border-slate-100 z-10 animate-scaleUp">
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${colors.iconBg}`}>
              {colors.icon}
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Optional Prompt Input */}
          {placeholder !== undefined && (
            <div className="mt-3">
              <input
                type="text"
                required
                disabled={isLoading}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium transition-all disabled:opacity-60"
                autoFocus
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all disabled:opacity-40"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${colors.btn}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
