"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Lock, Mail, Shield, ShieldCheck, User } from "lucide-react";
import { signupSuperuser } from "@/services/accounts";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Field, apiErrorMessage, inputClass } from "./fields";

interface CreateSuperuserProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Mirrors the API's password validators (accounts/validators.py).
const schema = Yup.object({
  first_name: Yup.string().required("Required"),
  last_name: Yup.string().required("Required"),
  username: Yup.string().required("Required"),
  email: Yup.string().email("Enter a valid email").required("Required"),
  password: Yup.string()
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "Add an uppercase letter")
    .matches(/[a-z]/, "Add a lowercase letter")
    .matches(/\d/, "Add a number")
    .matches(/[^A-Za-z0-9]/, "Add a symbol, such as ! or #")
    .required("Required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords don't match")
    .required("Required"),
});

export default function CreateSuperuser({ onSuccess, onCancel }: CreateSuperuserProps) {
  const headers = useAxiosAuth();

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const { first_name, last_name, username, email, password } = values;
      try {
        await signupSuperuser({ first_name, last_name, username, email, password }, headers);
        toast.success("Superuser created. Share the password with them securely.");
        onSuccess();
      } catch (error) {
        toast.error(apiErrorMessage(error, "Failed to create superuser"));
      }
    },
  });

  const err = (name: keyof typeof formik.values) => formik.touched[name] && formik.errors[name];

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
        A superuser can see and change every account and every part of the system. Only create one for
        someone who really needs full access.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="First Name" icon={User} error={err("first_name")}>
          <input {...formik.getFieldProps("first_name")} className={inputClass} placeholder="e.g. John" />
        </Field>
        <Field label="Last Name" icon={User} error={err("last_name")}>
          <input {...formik.getFieldProps("last_name")} className={inputClass} placeholder="e.g. Smith" />
        </Field>
      </div>
      <Field label="Username" icon={Shield} error={err("username")}>
        <input {...formik.getFieldProps("username")} className={inputClass} placeholder="e.g. johnsmith" />
      </Field>
      <Field label="Email Address" icon={Mail} error={err("email")}>
        <input
          {...formik.getFieldProps("email")}
          type="email"
          className={inputClass}
          placeholder="e.g. john@tamarind.co.ke"
        />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Password" icon={Lock} error={err("password")}>
          <input {...formik.getFieldProps("password")} type="password" className={inputClass} />
        </Field>
        <Field label="Confirm Password" icon={Lock} error={err("confirm_password")}>
          <input {...formik.getFieldProps("confirm_password")} type="password" className={inputClass} />
        </Field>
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        No email is sent for superusers. Give them the password in person and ask them to change it under My Profile.
      </p>

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
          <ShieldCheck className="w-4 h-4" />
          {formik.isSubmitting ? "Creating..." : "Create Superuser"}
        </button>
      </div>
    </form>
  );
}
