export interface Dhow {
  id: string;
  reference: string;
  name: string;
  description?: string;
  total_capacity: number;
  min_quota: number;
  image?: string | null;
  is_active: boolean;
  is_available: boolean;
  created_by?: string | null;
  created_by_email?: string;
  created_at: string;
  updated_at: string;
}

export type MealType = "lunch" | "sunset_cruise" | "booze_cruise" | "special_cruise" | "dinner_cruise";

export interface Package {
  id: string;
  reference: string;
  name: string;
  meal_type: MealType;
  meal_type_display?: string;
  description?: string;
  includes?: string;
  base_price: string | number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddOn {
  id: string;
  reference: string;
  name: string;
  description?: string;
  price: string | number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleTemplate {
  id: string;
  reference: string;
  dhow: string;
  dhow_name?: string;
  meal_type: MealType;
  meal_type_display?: string;
  departure_time: string;
  return_time: string;
  days_of_week: string[];
  price_per_person: string | number;
  exclusive_flat_fee: string | number;
  is_active: boolean;
  notes?: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type ScheduleStatus = "scheduled" | "confirmed" | "cancelled" | "completed";

export interface Schedule {
  id: string;
  reference: string;
  dhow: string;
  dhow_name?: string;
  template?: string | null;
  date: string;
  meal_type: MealType;
  meal_type_display?: string;
  departure_time: string;
  return_time: string;
  price_per_person: string | number;
  exclusive_flat_fee: string | number;
  status: ScheduleStatus;
  status_display?: string;
  is_exclusive: boolean;
  exclusive_booked_by?: string | null;
  is_open: boolean;
  cancelled_reason?: string | null;
  notes?: string | null;
  current_pax_count: number;
  is_quota_met: boolean;
  available_capacity: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  schedule: string;
  table_number: string;
  capacity: number;
  description?: string | null;
  is_available: boolean;
  assigned_to?: string | null;
  booking_reference?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
