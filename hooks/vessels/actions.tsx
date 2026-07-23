"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDhows,
  getScheduleTemplates,
  getSchedules,
  getScheduleDetail,
  getTables,
  getPackages,
  getAddOns,
} from "@/services/vessels";
import useAxiosAuth from "../authentication/useAxiosAuth";

export function useFetchPackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: () => getPackages(),
  });
}

export function useFetchAddOns() {
  return useQuery({
    queryKey: ["addons"],
    queryFn: () => getAddOns(),
  });
}

export function useFetchDhows() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["dhows"],
    queryFn: () => getDhows(header),
  });
}

export function useFetchScheduleTemplates() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["scheduleTemplates"],
    queryFn: () => getScheduleTemplates(header),
  });
}

export function useFetchSchedules(params?: Record<string, any>) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["schedules", params],
    queryFn: () => getSchedules(params, header),
  });
}

export function useFetchScheduleDetail(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["schedule", reference],
    queryFn: () => getScheduleDetail(reference, header),
    enabled: !!reference,
  });
}

export function useFetchTables(scheduleId?: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["tables", scheduleId],
    queryFn: () => getTables(scheduleId, header),
  });
}
