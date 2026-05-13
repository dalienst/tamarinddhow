/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { apiActions } from "@/tools/axios";
import { extractProps } from "@radix-ui/themes/dist/cjs/helpers/extract-props.js";
import { AxiosResponse } from "axios";

export interface User {
  id: string;
  usercode: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  country: string;
  city: string | null;
  address: string | null;
  is_guest: boolean;
  is_dhow_manager: boolean;
  is_agent: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  reference: string
}

export interface updateUser {
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  phone_number: string | null;
  city: string | null;
  address: string | null;
}

export interface forgotPassword {
  email: string;
}

export interface resetPassword {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export interface SignupAgent {
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

export interface SignupGuest {
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

export const getAccount = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<User> => {
  const response: AxiosResponse<User> = await apiActions.get(
    `/api/v1/auth/${reference}/`,
    headers
  );
  return response.data;
};

export const forgotPassword = async (data: forgotPassword): Promise<any> => {
  const response: AxiosResponse<any> = await apiActions.post(
    `/api/v1/auth/password/forgot/`,
    data
  );
  return response.data;
};

export const resetPassword = async (data: resetPassword): Promise<any> => {
  const response: AxiosResponse<any> = await apiActions.post(
    `/api/v1/auth/password/reset/`,
    data
  );
  return response.data;
};

export const signupDhowManager = async (data: SignupGuest, headers: { headers: { Authorization: string } }): Promise<any> => {
  // Done by the Dhow Manager or Super Admin
  const response: AxiosResponse<any> = await apiActions.post(
    `/api/v1/auth/dhow-managers/signup/`,
    data,
    headers
  );
  return response.data;
};

export const signupAgent = async (data: SignupAgent, headers: { headers: { Authorization: string } }): Promise<any> => {
  const response: AxiosResponse<any> = await apiActions.post(
    `/api/v1/auth/agents/signup/`,
    data,
    headers
  );
  return response.data;
};

export const signupGuest = async (data: SignupGuest): Promise<any> => {
  const response: AxiosResponse<any> = await apiActions.post(
    `/api/v1/auth/guests/signup/`,
    data
  );
  return response.data;
};

export const getAllUsers = async (headers: { headers: { Authorization: string } }): Promise<User[]> => {
  const response: AxiosResponse<User[]> = await apiActions.get(
    `/api/v1/auth/`,
    headers
  );
  return response.data;
};

export const updateAccount = async (
  usercode: string,
  data: updateUser,
  headers: { headers: { Authorization: string } }
): Promise<User> => {
  const response: AxiosResponse<User> = await apiActions.patch(
    `/api/v1/auth/${usercode}/`,
    data,
    headers
  );
  return response.data;
};

export const deleteAccount = async (
  usercode: string,
  headers: { headers: { Authorization: string } }
): Promise<User> => {
  const response: AxiosResponse<User> = await apiActions.delete(
    `/api/v1/auth/${usercode}/`,
    headers
  );
  return response.data;
};