"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { ForgotPasswordSchema } from "@/validation";
import { forgotPassword } from "@/services/accounts";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await forgotPassword({ email: values.email });
        toast.success("Password reset code sent to your email!");
        router.push("/reset-password");
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || "Failed to send reset code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/smallLogo.jpg"
              alt="Tamarind Dhow"
              width={80}
              height={80}
              className="rounded-lg shadow-sm"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Enter your email to receive a reset code
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`appearance-none relative block w-full px-4 py-3 border ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary focus:border-transparent"
                } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                placeholder="you@tamarind.co.ke"
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="mt-1 text-sm text-red-600">{formik.errors.email as React.ReactNode}</div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Back to login
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-brand-500/20 transform hover:-translate-y-0.5 active:translate-y-0 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Tamarind Management Limited.
            <br />
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}