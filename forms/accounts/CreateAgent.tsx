"use client";

import React from "react";
import { useFormik } from "formik";
import { signupAgent, SignupAgent } from "@/services/accounts";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import toast from "react-hot-toast";
import { User, Mail, Shield, UserPlus } from "lucide-react";

interface CreateAgentProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CreateAgent({ onSuccess, onCancel }: CreateAgentProps) {
    const headers = useAxiosAuth();

    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            first_name: "",
            last_name: "",
        } as SignupAgent,
        onSubmit: async (values) => {
            try {
                await signupAgent(values, headers);
                toast.success("Agent created successfully");
                onSuccess();
            } catch (error: any) {
                toast.error(error?.response?.data?.detail || "Failed to create agent");
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" /> First Name
                    </label>
                    <div className="relative">
                        <input
                            name="first_name"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.first_name}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder-gray-400"
                            placeholder="John"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" /> Last Name
                    </label>
                    <div className="relative">
                        <input
                            name="last_name"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.last_name}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder-gray-400"
                            placeholder="Doe"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-gray-400" /> Username
                </label>
                <div className="relative">
                    <input
                        name="username"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.username}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder-gray-400"
                        placeholder="johndoe123"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
                </label>
                <div className="relative">
                    <input
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder-gray-400"
                        placeholder="john@example.com"
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
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50 shadow-lg shadow-brand-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {formik.isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ borderRadius: "50%" }}></div>
                    ) : (
                        <UserPlus className="w-4 h-4" />
                    )}
                    {formik.isSubmitting ? "Creating..." : "Create Agent"}
                </button>
            </div>
        </form>
    );
}
