"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFetchAccount } from "@/hooks/accounts/actions";
import { updateAccount } from "@/services/accounts";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, Globe, Lock, Save, ShieldAlert, Key } from "lucide-react";
import LoadingSpinner from "@/components/dhow-manager/LoadingSpinner";

export default function ProfilePage() {
  const { data: account, isLoading, refetch } = useFetchAccount();
  const headers = useAxiosAuth();
  const [activeTab, setActiveTab] = useState<"details" | "security">("details");

  const [savingDetails, setSavingDetails] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  // Details form Formik
  const detailsFormik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      country: "",
      city: "",
      address: "",
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required("First name is required"),
      last_name: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      phone_number: Yup.string().nullable(),
      country: Yup.string().required("Country is required"),
      city: Yup.string().nullable(),
      address: Yup.string().nullable(),
    }),
    onSubmit: async (values) => {
      if (!account?.usercode) return;
      setSavingDetails(true);
      try {
        await updateAccount(account.usercode, {
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          country: values.country,
          phone_number: values.phone_number || null,
          city: values.city || null,
          address: values.address || null,
        }, headers);
        toast.success("Profile details updated successfully");
        refetch();
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || "Failed to update profile details");
      } finally {
        setSavingDetails(false);
      }
    },
  });

  // Security / Password form Formik
  const securityFormik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(5, "Password must be at least 5 characters")
        .matches(/[a-z]/, "Must contain at least one lowercase character")
        .matches(/[A-Z]/, "Must contain at least one uppercase character")
        .matches(/\d/, "Must contain at least one digit")
        .matches(/[()[\]{}|\\`~!@#$%^&*_\-+=;:'",<>./?]/, "Must contain at least one special character")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your new password"),
    }),
    onSubmit: async (values) => {
      if (!account) return;
      setSavingSecurity(true);
      try {
        await updateAccount(account.usercode, {
          email: account.email,
          first_name: account.first_name,
          last_name: account.last_name,
          country: account.country,
          phone_number: account.phone_number,
          city: account.city,
          address: account.address,
          password: values.password,
        }, headers);
        toast.success("Password changed successfully");
        securityFormik.resetForm();
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || "Failed to update password");
      } finally {
        setSavingSecurity(false);
      }
    },
  });

  useEffect(() => {
    if (account) {
      detailsFormik.setValues({
        first_name: account.first_name || "",
        last_name: account.last_name || "",
        email: account.email || "",
        phone_number: account.phone_number || "",
        country: account.country || "",
        city: account.city || "",
        address: account.address || "",
      });
    }
  }, [account]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-700 rounded-full flex items-center justify-center font-bold text-xl" style={{ borderRadius: "50%" }}>
              {account?.first_name ? account.first_name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{account?.first_name} {account?.last_name}</h1>
              <p className="text-xs text-slate-500 font-medium">Usercode: {account?.usercode} • Role: {account?.is_superuser ? "Super Admin" : "Dhow Manager"}</p>
            </div>
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-150 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "details" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-850"
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "security" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-850"
              }`}
            >
              Security Settings
            </button>
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {activeTab === "details" ? (
            <form onSubmit={detailsFormik.handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-bold text-slate-800 text-sm">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-1">Manage your general personal details and profile credentials.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> First Name
                  </label>
                  <input
                    name="first_name"
                    type="text"
                    onChange={detailsFormik.handleChange}
                    value={detailsFormik.values.first_name}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                  />
                  {detailsFormik.touched.first_name && detailsFormik.errors.first_name && (
                    <p className="text-xs text-red-500 font-semibold">{detailsFormik.errors.first_name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Last Name
                  </label>
                  <input
                    name="last_name"
                    type="text"
                    onChange={detailsFormik.handleChange}
                    value={detailsFormik.values.last_name}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                  />
                  {detailsFormik.touched.last_name && detailsFormik.errors.last_name && (
                    <p className="text-xs text-red-500 font-semibold">{detailsFormik.errors.last_name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    onChange={detailsFormik.handleChange}
                    value={detailsFormik.values.email}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                  />
                  {detailsFormik.touched.email && detailsFormik.errors.email && (
                    <p className="text-xs text-red-500 font-semibold">{detailsFormik.errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                  </label>
                  <input
                    name="phone_number"
                    type="text"
                    onChange={detailsFormik.handleChange}
                    value={detailsFormik.values.phone_number || ""}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                    placeholder="e.g. +254 712 345 678"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" /> Country
                  </label>
                  <input
                    name="country"
                    type="text"
                    onChange={detailsFormik.handleChange}
                    value={detailsFormik.values.country}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                  />
                  {detailsFormik.touched.country && detailsFormik.errors.country && (
                    <p className="text-xs text-red-500 font-semibold">{detailsFormik.errors.country}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> City
                  </label>
                  <input
                    name="city"
                    type="text"
                    onChange={detailsFormik.handleChange}
                    value={detailsFormik.values.city || ""}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Physical Address
                  </label>
                  <input
                    name="address"
                    type="text"
                    onChange={detailsFormik.handleChange}
                    value={detailsFormik.values.address || ""}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingDetails}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-800/80 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  {savingDetails ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                      Saving Details...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={securityFormik.handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-bold text-slate-800 text-sm">Security & Password</h2>
                <p className="text-xs text-slate-500 mt-1">Change your password. Must satisfy safety complexity regulations.</p>
              </div>

              <div className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" /> New Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    onChange={securityFormik.handleChange}
                    value={securityFormik.values.password}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                    placeholder="Enter new password"
                  />
                  {securityFormik.touched.password && securityFormik.errors.password && (
                    <p className="text-xs text-red-500 font-semibold">{securityFormik.errors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Confirm New Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    onChange={securityFormik.handleChange}
                    value={securityFormik.values.confirmPassword}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
                    placeholder="Re-enter new password"
                  />
                  {securityFormik.touched.confirmPassword && securityFormik.errors.confirmPassword && (
                    <p className="text-xs text-red-500 font-semibold">{securityFormik.errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Password complexity tip */}
              <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 flex gap-3 text-xs text-amber-900 max-w-lg">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 font-semibold leading-relaxed">
                  <div className="font-bold">Password Requirements:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                    <li>At least 5 characters long</li>
                    <li>One lowercase character</li>
                    <li>One uppercase character</li>
                    <li>One number/digit</li>
                    <li>One special character symbol (e.g. !, @, #, $, %)</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSecurity}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-700/80 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  {savingSecurity ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: "50%" }} />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
