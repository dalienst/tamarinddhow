import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";

export interface Table {
  id: string;
  schedule: string;
  table_number: string;
  capacity: number;
  description?: string | null;
  is_available: boolean;
  assigned_to?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getTables = async (
  headers?: any,
  params?: Record<string, any>
): Promise<PaginatedResponse<Table>> => {
  const response: AxiosResponse<PaginatedResponse<Table>> = await apiActions.get(
    "/api/v1/tables/",
    {
      ...headers,
      params,
    }
  );
  return response.data;
};

export const createTable = async (
  data: Partial<Table>,
  token: string
): Promise<Table> => {
  const response: AxiosResponse<Table> = await apiActions.post(
    "/api/v1/tables/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const updateTable = async (
  id: string,
  data: Partial<Table>,
  token: string
): Promise<Table> => {
  const response: AxiosResponse<Table> = await apiActions.patch(
    `/api/v1/tables/${id}/`,
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const deleteTable = async (
  id: string,
  token: string
): Promise<void> => {
  await apiActions.delete(
    `/api/v1/tables/${id}/`,
    { headers: { Authorization: `Token ${token}` } }
  );
};

export const assignTableBooking = async (
  id: string,
  bookingId: string | null,
  token: string
): Promise<Table> => {
  const response: AxiosResponse<Table> = await apiActions.patch(
    `/api/v1/tables/${id}/assign/`,
    { booking_id: bookingId },
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};
