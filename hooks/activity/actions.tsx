"use client";

import { useQuery } from "@tanstack/react-query";

import { getBookingReschedules, getBookingStatusLogs, getRefundStatusLogs } from "@/services/activity";
import useAxiosAuth from "../authentication/useAxiosAuth";

export function useFetchBookingStatusLogs() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["booking-status-logs"],
        queryFn: () => getBookingStatusLogs(header),
    });
}

export function useFetchRefundStatusLogs() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["refund-status-logs"],
        queryFn: () => getRefundStatusLogs(header),
    });
}

export function useFetchBookingReschedules() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["booking-reschedules"],
        queryFn: () => getBookingReschedules(header),
    });
}
