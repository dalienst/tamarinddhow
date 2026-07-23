import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import {
  Dhow,
  Package,
  AddOn,
  ScheduleTemplate,
  Schedule,
  Table,
} from "@/types/dhow";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* DHOWS */
export const getDhows = async (headers?: any): Promise<PaginatedResponse<Dhow>> => {
  const response: AxiosResponse<PaginatedResponse<Dhow>> = await apiActions.get(
    "/api/v1/dhows/",
    headers
  );
  return response.data;
};

export const createDhow = async (data: Partial<Dhow>, token: string): Promise<Dhow> => {
  const response: AxiosResponse<Dhow> = await apiActions.post(
    "/api/v1/dhows/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const updateDhow = async (reference: string, data: Partial<Dhow>, token: string): Promise<Dhow> => {
  const response: AxiosResponse<Dhow> = await apiActions.patch(
    `/api/v1/dhows/${reference}/`,
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

/* PACKAGES */
export const getPackages = async (): Promise<PaginatedResponse<Package>> => {
  const response: AxiosResponse<PaginatedResponse<Package>> = await apiActions.get(
    "/api/v1/packages/"
  );
  return response.data;
};

export const createPackage = async (data: Partial<Package>, token: string): Promise<Package> => {
  const response: AxiosResponse<Package> = await apiActions.post(
    "/api/v1/packages/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

/* ADDONS */
export const getAddOns = async (): Promise<PaginatedResponse<AddOn>> => {
  const response: AxiosResponse<PaginatedResponse<AddOn>> = await apiActions.get(
    "/api/v1/addons/"
  );
  return response.data;
};

export const createAddOn = async (data: Partial<AddOn>, token: string): Promise<AddOn> => {
  const response: AxiosResponse<AddOn> = await apiActions.post(
    "/api/v1/addons/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

/* SCHEDULE TEMPLATES */
export const getScheduleTemplates = async (headers?: any): Promise<PaginatedResponse<ScheduleTemplate>> => {
  const response: AxiosResponse<PaginatedResponse<ScheduleTemplate>> = await apiActions.get(
    "/api/v1/schedule-templates/",
    headers
  );
  return response.data;
};

export const createScheduleTemplate = async (
  data: Partial<ScheduleTemplate>,
  token: string
): Promise<ScheduleTemplate> => {
  const response: AxiosResponse<ScheduleTemplate> = await apiActions.post(
    "/api/v1/schedule-templates/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

/* SCHEDULES */
export const getSchedules = async (params?: Record<string, any>, headers?: any): Promise<PaginatedResponse<Schedule>> => {
  const response: AxiosResponse<PaginatedResponse<Schedule>> = await apiActions.get(
    "/api/v1/schedules/",
    { params, ...headers }
  );
  return response.data;
};

export const getScheduleDetail = async (reference: string, headers?: any): Promise<Schedule> => {
  const response: AxiosResponse<Schedule> = await apiActions.get(
    `/api/v1/schedules/${reference}/`,
    headers
  );
  return response.data;
};

export const createSchedule = async (data: Partial<Schedule>, token: string): Promise<Schedule> => {
  const response: AxiosResponse<Schedule> = await apiActions.post(
    "/api/v1/schedules/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const openSchedule = async (reference: string, token: string): Promise<Schedule> => {
  const response: AxiosResponse<Schedule> = await apiActions.patch(
    `/api/v1/schedules/${reference}/open/`,
    {},
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const closeSchedule = async (reference: string, token: string): Promise<Schedule> => {
  const response: AxiosResponse<Schedule> = await apiActions.patch(
    `/api/v1/schedules/${reference}/close/`,
    {},
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const confirmSchedule = async (reference: string, token: string): Promise<Schedule> => {
  const response: AxiosResponse<Schedule> = await apiActions.patch(
    `/api/v1/schedules/${reference}/confirm/`,
    {},
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const cancelSchedule = async (
  reference: string,
  reason: string,
  token: string
): Promise<Schedule> => {
  const response: AxiosResponse<Schedule> = await apiActions.patch(
    `/api/v1/schedules/${reference}/cancel/`,
    { reason },
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

/* TABLES */
export const getTables = async (scheduleId?: string, headers?: any): Promise<PaginatedResponse<Table>> => {
  const params = scheduleId ? { schedule: scheduleId } : {};
  const response: AxiosResponse<PaginatedResponse<Table>> = await apiActions.get(
    "/api/v1/tables/",
    { params, ...headers }
  );
  return response.data;
};

export const createTable = async (data: Partial<Table>, token: string): Promise<Table> => {
  const response: AxiosResponse<Table> = await apiActions.post(
    "/api/v1/tables/",
    data,
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};

export const assignTable = async (
  tableId: string,
  bookingId: string | null,
  token: string
): Promise<Table> => {
  const response: AxiosResponse<Table> = await apiActions.patch(
    `/api/v1/tables/${tableId}/assign/`,
    { booking_id: bookingId },
    { headers: { Authorization: `Token ${token}` } }
  );
  return response.data;
};
