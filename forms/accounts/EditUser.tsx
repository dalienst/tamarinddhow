"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Mail, Phone, Save, Shield, User as UserIcon, UserCog } from "lucide-react";
import { adminUpdateUser, AdminUserUpdate, User } from "@/services/accounts";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Field, apiErrorMessage, inputClass } from "./fields";

export type UserRole = "dhow_manager" | "supervisor" | "agent" | "guest";

export const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "dhow_manager", label: "Dhow Manager", description: "Runs the fleet, sailings, bookings, finance and reports." },
  { value: "supervisor", label: "Supervisor", description: "Runs boarding at the dock: check-ins, walk-ins and scanning." },
  { value: "agent", label: "Agent", description: "Tour operator who books groups." },
  { value: "guest", label: "Guest", description: "A customer account." },
];

export const roleOf = (user: User): UserRole | "" =>
  user.is_dhow_manager
    ? "dhow_manager"
    : user.is_supervisor
      ? "supervisor"
      : user.is_agent
        ? "agent"
        : user.is_guest
          ? "guest"
          : "";

interface EditUserProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const schema = Yup.object({
  first_name: Yup.string().required("Required"),
  last_name: Yup.string().required("Required"),
  username: Yup.string().required("Required"),
  email: Yup.string().email("Enter a valid email").required("Required"),
  phone_number: Yup.string(),
});

export default function EditUser({ user, onSuccess, onCancel }: EditUserProps) {
  const headers = useAxiosAuth();
  // Admin accounts keep their access level; it isn't changed from this form.
  const isAdminAccount = user.is_superuser || user.is_staff;

  const formik = useFormik({
    initialValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      role: roleOf(user),
    },
    validationSchema: schema,
    onSubmit: async ({ role, ...values }) => {
      const data: AdminUserUpdate = { ...values, phone_number: values.phone_number || null };
      if (!isAdminAccount && role) {
        data.is_dhow_manager = role === "dhow_manager";
        data.is_supervisor = role === "supervisor";
        data.is_agent = role === "agent";
        data.is_guest = role === "guest";
      }
      try {
        await adminUpdateUser(user.usercode, data, headers);
        toast.success("Account updated");
        onSuccess();
      } catch (error) {
        toast.error(apiErrorMessage(error, "Failed to update account"));
      }
    },
  });

  const err = (name: keyof typeof formik.values) => formik.touched[name] && formik.errors[name];

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="First Name" icon={UserIcon} error={err("first_name")}>
          <input {...formik.getFieldProps("first_name")} className={inputClass} />
        </Field>
        <Field label="Last Name" icon={UserIcon} error={err("last_name")}>
          <input {...formik.getFieldProps("last_name")} className={inputClass} />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Username" icon={Shield} error={err("username")}>
          <input {...formik.getFieldProps("username")} className={inputClass} />
        </Field>
        <Field label="Phone Number" icon={Phone} error={err("phone_number")}>
          <input {...formik.getFieldProps("phone_number")} className={inputClass} placeholder="e.g. +254 712 345 678" />
        </Field>
      </div>
      <Field label="Email Address" icon={Mail} error={err("email")}>
        <input {...formik.getFieldProps("email")} type="email" className={inputClass} />
      </Field>

      {isAdminAccount ? (
        <p className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-900">
          This is an admin account. Its access level can&apos;t be changed here.
        </p>
      ) : (
        <Field
          label="Role"
          icon={UserCog}
          hint={ROLE_OPTIONS.find((r) => r.value === formik.values.role)?.description}
        >
          <select {...formik.getFieldProps("role")} className={inputClass}>
            {!formik.values.role && <option value="">No role</option>}
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
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
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {formik.isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
