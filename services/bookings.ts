import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import {
  Booking,
  BookingGuest,
  BookingAddOn,
  BookingReschedule,
} from "@/types/booking";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* BOOKINGS */
export const getBookings = async (
  headers?: any,
  params?: Record<string, any>
): Promise<PaginatedResponse<Booking>> => {
  const response: AxiosResponse<PaginatedResponse<Booking>> = await apiActions.get(
    "/api/v1/bookings/",
    {
      ...headers,
      params,
    }
  );
  return response.data;
};

export const getBookingDetail = async (
  reference: string,
  headers?: any
): Promise<Booking> => {
  const response: AxiosResponse<Booking> = await apiActions.get(
    `/api/v1/bookings/${reference}/`,
    headers
  );
  return response.data;
};

export const createBooking = async (
  data: Partial<Booking>,
  token: string
): Promise<Booking> => {
  const response: AxiosResponse<Booking> = await apiActions.post(
    "/api/v1/bookings/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const updateBooking = async (
  reference: string,
  data: Partial<Booking>,
  token: string
): Promise<Booking> => {
  const response: AxiosResponse<Booking> = await apiActions.patch(
    `/api/v1/bookings/${reference}/`,
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const cancelBooking = async (
  reference: string,
  token: string
): Promise<Booking> => {
  const response: AxiosResponse<Booking> = await apiActions.patch(
    `/api/v1/bookings/${reference}/cancel/`,
    {},
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const assignBookingTable = async (
  reference: string,
  tableId: string | null,
  token: string
): Promise<Booking> => {
  const response: AxiosResponse<Booking> = await apiActions.patch(
    `/api/v1/bookings/${reference}/assign-table/`,
    { table_id: tableId },
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

/* BOOKING GUESTS */
export const getBookingGuests = async (
  headers?: any,
  bookingId?: string
): Promise<PaginatedResponse<BookingGuest>> => {
  const params = bookingId ? { booking: bookingId } : {};
  const response: AxiosResponse<PaginatedResponse<BookingGuest>> = await apiActions.get(
    "/api/v1/booking-guests/",
    {
      ...headers,
      params,
    }
  );
  return response.data;
};

export const createBookingGuest = async (
  data: Partial<BookingGuest>,
  token: string
): Promise<BookingGuest> => {
  const response: AxiosResponse<BookingGuest> = await apiActions.post(
    "/api/v1/booking-guests/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const updateBookingGuest = async (
  id: string,
  data: Partial<BookingGuest>,
  token: string,
  isManifestToken?: boolean
): Promise<BookingGuest> => {
  const headers = isManifestToken
    ? { "X-Manifest-Token": token }
    : { Authorization: `Token ${token}` };
  const response: AxiosResponse<BookingGuest> = await apiActions.patch(
    `/api/v1/booking-guests/${id}/`,
    data,
    { headers }
  );
  return response.data;
};

/* BOOKING ADDONS */
export const getBookingAddOns = async (
  headers?: any,
  bookingId?: string
): Promise<PaginatedResponse<BookingAddOn>> => {
  const params = bookingId ? { booking: bookingId } : {};
  const response: AxiosResponse<PaginatedResponse<BookingAddOn>> = await apiActions.get(
    "/api/v1/booking-addons/",
    {
      ...headers,
      params,
    }
  );
  return response.data;
};

export const createBookingAddOn = async (
  data: Partial<BookingAddOn>,
  token: string
): Promise<BookingAddOn> => {
  const response: AxiosResponse<BookingAddOn> = await apiActions.post(
    "/api/v1/booking-addons/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

/* BOOKING RESCHEDULES */
export const getBookingReschedules = async (
  headers?: any
): Promise<PaginatedResponse<BookingReschedule>> => {
  const response: AxiosResponse<PaginatedResponse<BookingReschedule>> = await apiActions.get(
    "/api/v1/booking-reschedules/",
    headers
  );
  return response.data;
};

export const confirmReschedule = async (
  reference: string,
  newScheduleId: string,
  token: string
): Promise<BookingReschedule> => {
  const response: AxiosResponse<BookingReschedule> = await apiActions.patch(
    `/api/v1/booking-reschedules/${reference}/confirm/`,
    { new_schedule_id: newScheduleId },
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const createBookingBulk = async (
  bookings: any[],
  token: string
): Promise<Booking[]> => {
  const response: AxiosResponse<Booking[]> = await apiActions.post(
    "/api/v1/bookings/bulk/",
    { bookings },
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};
