"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { LoginSchema } from "@/validation";
import { useFormik } from "formik";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Eye, EyeOff, Loader2, Zap } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();


  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const response = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      const session = await getSession();
      setLoading(false);

      if (response?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        if (session?.user?.is_dhow_manager === true) {
          router.push("/dhow-manager/dashboard");
        } else if (session?.user?.is_staff === true) {
          router.push("/dhow-manager/dashboard");
        } else if (session?.user?.is_guest === true) {
          router.push("/guest/dashboard");
        } else if (session?.user?.is_agent === true) {
          router.push("/agent/dashboard");
        } else {
          router.push("/");
        }
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
            Tamarind Dhow
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Booking Management System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                placeholder="you@tamarind.co.ke"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-[#1D1D1F]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#0071E3] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`w-full px-4 py-3 pr-11 bg-white border rounded-xl text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all ${formik.touched.password && formik.errors.password
                      ? "border-red-400"
                      : "border-[#D2D2D7]"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-gray-700 cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-brand-500/20 transform hover:-translate-y-0.5 active:translate-y-0 ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
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