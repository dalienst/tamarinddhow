"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useParams, useRouter } from "next/navigation"
import { activateAccount } from "@/services/accounts"
import toast from "react-hot-toast"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

const ActivateSchema = Yup.object().shape({
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required")
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            "Password must contain one uppercase, one number and one special character"
        ),
    confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
})

export default function ActivatePage() {
    const params = useParams()
    const router = useRouter()
    const uidb64 = params.uidb64 as string
    const token = params.token as string

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validationSchema: ActivateSchema,
        onSubmit: async (values) => {
            try {
                await activateAccount(uidb64, token, values.password)
                toast.success("Account activated successfully! You can now log in.")
                router.push("/login")
            } catch (error: any) {
                toast.error(error?.response?.data?.error || "Activation failed. The link may be expired.")
            }
        },
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Image
                        src="/smallLogo.jpg"
                        alt="Tamarind Dhow"
                        width={64}
                        height={64}
                        className="rounded shadow"
                    />
                </div>
                <h2 className="mt-6 text-center text-xl font-semibold text-gray-900 tracking-tight">
                    Activate Your Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500 font-medium">
                    Set a secure password to complete your account setup.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow rounded sm:px-10 border border-gray-100">
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-semibold text-black uppercase tracking-widest mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.password}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary pr-10 ${
                                        formik.touched.password && formik.errors.password
                                            ? "border-red-500"
                                            : "border-gray-500"
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <p className="mt-1 text-[10px] text-red-500 font-semibold">
                                    {formik.errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-black uppercase tracking-widest mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.confirmPassword}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary pr-10 ${
                                        formik.touched.confirmPassword && formik.errors.confirmPassword
                                            ? "border-red-500"
                                            : "border-gray-500"
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="mt-1 text-[10px] text-red-500 font-semibold">
                                    {formik.errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded shadow text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
                            >
                                {formik.isSubmitting ? "Activating..." : "Activate Account"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}