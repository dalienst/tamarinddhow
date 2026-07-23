"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPayments,
  getPaymentDetail,
  getEscrowRecords,
  getRefunds,
} from "@/services/payments";
import useAxiosAuth from "../authentication/useAxiosAuth";

export function useFetchPayments(params?: Record<string, any>) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => getPayments(header, params),
  });
}

export function useFetchPaymentDetail(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["payment", reference],
    queryFn: () => getPaymentDetail(reference, header),
    enabled: !!reference,
  });
}

export function useFetchEscrowRecords(params?: Record<string, any>) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["escrowRecords", params],
    queryFn: () => getEscrowRecords(header, params),
  });
}

export function useFetchRefunds(params?: Record<string, any>) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["refunds", params],
    queryFn: () => getRefunds(header, params),
  });
}
