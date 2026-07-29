export type BookingType = "individual" | "group_agent" | "exclusive" | "walk_in";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "completed"
  | "no_show";

export type CancellationPreference = "reschedule" | "refund";

export type CheckInStatus = "pending" | "checked_in" | "no_show";

export interface Booking {
  id: string;
  reference: string;
  schedule: string;
  schedule_date?: string;
  schedule_meal_type?: string;
  booked_by: string;
  booked_by_email?: string;
  booked_by_name?: string;
  booking_type: BookingType;
  package?: string | null;
  package_name?: string | null;
  party_size: number;
  adult_count?: number;
  child_count?: number;
  status: BookingStatus;
  status_display?: string;
  cancellation_preference: CancellationPreference;
  is_exclusive: boolean;
  exclusive_note?: string | null;
  table_request?: string | null;
  special_requests?: string | null;
  internal_notes?: string | null;
  table?: string | null;
  table_number?: string | null;
  total_amount: string | number;
  discount_amount?: string | number;
  discount_reason?: string | null;
  total_paid?: string | number;
  outstanding_balance?: string | number;
  check_in_status?: CheckInStatus;
  booking_guests?: BookingGuest[];
  primary_guest_name?: string;
  primary_guest_email?: string;
  primary_guest_phone?: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingGuest {
  id: string;
  booking: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  dietary_needs?: string | null;
  is_primary: boolean;
  status: CheckInStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingAddOn {
  id: string;
  booking: string;
  addon: string;
  addon_name?: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  created_at: string;
  updated_at: string;
}

export type RescheduleStatus = "pending" | "confirmed" | "rejected";

export interface BookingReschedule {
  id: string;
  reference: string;
  booking: string;
  booking_reference?: string;
  original_schedule: string;
  original_schedule_date?: string;
  new_schedule?: string | null;
  new_schedule_date?: string | null;
  reason?: string | null;
  rescheduled_by?: string | null;
  status: RescheduleStatus;
  status_display?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingStatusLog {
  id: string;
  booking: string;
  old_status: string;
  new_status: string;
  changed_by?: string | null;
  changed_by_email?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
