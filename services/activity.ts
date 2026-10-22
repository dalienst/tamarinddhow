import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { getBookingReschedules } from "@/services/bookings";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface StatusLog {
  id: string;
  old_status: string;
  new_status: string;
  changed_by: string | null;
  changed_by_email: string | null;
  notes: string | null;
  created_at: string;
}

export interface BookingStatusLog extends StatusLog {
  booking: string;
  booking_reference: string;
}

export interface RefundStatusLog extends StatusLog {
  refund: string;
  refund_reference: string;
}

type AuthHeaders = { headers: { Authorization: string } };

export const getBookingStatusLogs = async (
  headers: AuthHeaders
): Promise<PaginatedResponse<BookingStatusLog>> => {
  const response: AxiosResponse<PaginatedResponse<BookingStatusLog>> = await apiActions.get(
    "/api/v1/booking-status-logs/",
    headers
  );
  return response.data;
};

export const getRefundStatusLogs = async (
  headers: AuthHeaders
): Promise<PaginatedResponse<RefundStatusLog>> => {
  const response: AxiosResponse<PaginatedResponse<RefundStatusLog>> = await apiActions.get(
    "/api/v1/refund-logs/",
    headers
  );
  return response.data;
};

export { getBookingReschedules };
