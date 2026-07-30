"use client";

import React from "react";
import { useFormik } from "formik";
import { signupSupervisor, SignupGuest } from "@/services/accounts";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import toast from "react-hot-toast";
import { User, Mail, Shield, UserPlus } from "lucide-react";

interface CreateSupervisorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateSupervisor({ onSuccess, onCancel }: CreateSupervisorProps) {
  const headers = useAxiosAuth();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
    } as SignupGuest,
    onSubmit: async (values) => {
      try {
        await signupSupervisor(values, headers);
        toast.success("Supervisor account created successfully! An activation email has been sent.");
        onSuccess();
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || "Failed to create supervisor");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <User className="w-3.5 h-3.5 text-gray-400" /> First Name
          </label>
          <div className="relative">
            <input
              name="first_name"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.first_name}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all placeholder-gray-400 font-semibold"
              placeholder="e.g. John"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <User className="w-3.5 h-3.5 text-gray-400" /> Last Name
          </label>
          <div className="relative">
            <input
              name="last_name"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.last_name}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all placeholder-gray-400 font-semibold"
              placeholder="e.g. Smith"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Shield className="w-3.5 h-3.5 text-gray-400" /> Username
        </label>
        <div className="relative">
          <input
            name="username"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.username}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all placeholder-gray-400 font-semibold"
            placeholder="e.g. johnsmith"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
        </label>
        <div className="relative">
          <input
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all placeholder-gray-400 font-semibold"
            placeholder="e.g. john@tamarind.co.ke"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-650/30 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {formik.isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ borderRadius: "50%" }}></div>
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {formik.isSubmitting ? "Creating..." : "Create Supervisor"}
        </button>
      </div>
    </form>
  );
}
