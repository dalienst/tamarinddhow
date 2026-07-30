import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import {
  Payment,
  EscrowRecord,
  Refund,
  MpesaSTKInitiateRequest,
  MpesaSTKInitiateResponse,
} from "@/types/payment";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* PAYMENTS */
export const getPayments = async (
  headers?: any,
  params?: Record<string, any>
): Promise<PaginatedResponse<Payment>> => {
  const response: AxiosResponse<PaginatedResponse<Payment>> = await apiActions.get(
    "/api/v1/payments/",
    {
      ...headers,
      params,
    }
  );
  return response.data;
};

export const getPaymentDetail = async (
  reference: string,
  headers?: any
): Promise<Payment> => {
  const response: AxiosResponse<Payment> = await apiActions.get(
    `/api/v1/payments/${reference}/`,
    headers
  );
  return response.data;
};

export const createPayment = async (
  data: Partial<Payment>,
  token: string
): Promise<Payment> => {
  const response: AxiosResponse<Payment> = await apiActions.post(
    "/api/v1/payments/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const initiateMpesaSTK = async (
  data: MpesaSTKInitiateRequest,
  token: string
): Promise<MpesaSTKInitiateResponse> => {
  const response: AxiosResponse<MpesaSTKInitiateResponse> = await apiActions.post(
    "/api/v1/payments/mpesa/initiate/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

/* ESCROW */
export const getEscrowRecords = async (
  headers?: any,
  params?: Record<string, any>
): Promise<PaginatedResponse<EscrowRecord>> => {
  const response: AxiosResponse<PaginatedResponse<EscrowRecord>> = await apiActions.get(
    "/api/v1/escrow/",
    {
      ...headers,
      params,
    }
  );
  return response.data;
};

/* REFUNDS */
export const getRefunds = async (
  headers?: any,
  params?: Record<string, any>
): Promise<PaginatedResponse<Refund>> => {
  const response: AxiosResponse<PaginatedResponse<Refund>> = await apiActions.get(
    "/api/v1/refunds/",
    {
      ...headers,
      params,
    }
  );
  return response.data;
};

export const processRefund = async (
  reference: string,
  statusChoice: "completed" | "rejected",
  mpesaRef: string,
  notes: string,
  token: string
): Promise<Refund> => {
  const response: AxiosResponse<Refund> = await apiActions.patch(
    `/api/v1/refunds/${reference}/process/`,
    {
      status: statusChoice,
      mpesa_ref: mpesaRef,
      notes,
    },
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const createRefund = async (
  data: { payment: string; booking: string; amount: number; reason: string; notes?: string },
  token: string
): Promise<Refund> => {
  const response: AxiosResponse<Refund> = await apiActions.post(
    "/api/v1/refunds/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

