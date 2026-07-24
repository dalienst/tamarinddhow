"use client";

import { useQuery } from "@tanstack/react-query";
import { getTables } from "@/services/tables";
import useAxiosAuth from "../authentication/useAxiosAuth";

export function useFetchTables(params?: Record<string, any>) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["tables", params],
    queryFn: () => getTables(header, params),
  });
}
