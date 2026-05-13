"use client";

import React from "react";
import { useFormik } from "formik";
import { signupDhowManager, SignupGuest } from "@/services/accounts";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import toast from "react-hot-toast";

interface CreateDhowManagerProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateDhowManager({ onSuccess, onCancel }: CreateDhowManagerProps) {
  const headers = useAxiosAuth();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      password_confirmation: "",
    } as SignupGuest,
    onSubmit: async (values) => {
      try {
        await signupDhowManager(values, headers);
        toast.success("Dhow Manager created successfully");
        onSuccess();
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || "Failed to create dhow manager");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            First Name
          </label>
          <input
            name="first_name"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.first_name}
            className="w-full px-3 py-2 border border-gray-100 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Last Name
          </label>
          <input
            name="last_name"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.last_name}
            className="w-full px-3 py-2 border border-gray-100 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Username
        </label>
        <input
          name="username"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.username}
          className="w-full px-3 py-2 border border-gray-100 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          onChange={formik.handleChange}
          value={formik.values.email}
          className="w-full px-3 py-2 border border-gray-100 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.password}
            className="w-full px-3 py-2 border border-gray-100 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Confirm Password
          </label>
          <input
            name="password_confirmation"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.password_confirmation}
            className="w-full px-3 py-2 border border-gray-100 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="px-6 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-hover transition-all disabled:opacity-50"
        >
          {formik.isSubmitting ? "Creating..." : "Create Manager"}
        </button>
      </div>
    </form>
  );
}
