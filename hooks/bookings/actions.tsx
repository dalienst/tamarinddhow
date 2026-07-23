"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getBookings,
  getBookingDetail,
  getBookingGuests,
  getBookingAddOns,
  getBookingReschedules,
} from "@/services/bookings";
import useAxiosAuth from "../authentication/useAxiosAuth";

export function useFetchBookings(params?: Record<string, any>) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => getBookings(header, params),
  });
}

export function useFetchBookingDetail(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["booking", reference],
    queryFn: () => getBookingDetail(reference, header),
    enabled: !!reference,
  });
}

export function useFetchBookingGuests(bookingId?: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["bookingGuests", bookingId],
    queryFn: () => getBookingGuests(header, bookingId),
    enabled: !!bookingId,
  });
}

export function useFetchBookingAddOns(bookingId?: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["bookingAddOns", bookingId],
    queryFn: () => getBookingAddOns(header, bookingId),
    enabled: !!bookingId,
  });
}

export function useFetchBookingReschedules() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["bookingReschedules"],
    queryFn: () => getBookingReschedules(header),
  });
}
