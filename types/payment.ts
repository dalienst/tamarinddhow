export type PaymentMethod = "mpesa" | "cash" | "agent_credit" | "waived";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed";

export interface Payment {
  id: string;
  reference: string;
  booking: string;
  booking_reference?: string;
  amount: string | number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  status_display?: string;
  paid_by?: string | null;
  paid_by_email?: string;
  paid_at?: string | null;
  transaction_ref?: string | null;
  receipt_number?: string | null;
  phone_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type EscrowStatus =
  | "holding"
  | "released_to_finance"
  | "reversed_to_guest"
  | "failed";

export type EscrowResolutionMethod =
  | "schedule_confirmed"
  | "schedule_cancelled"
  | "manual_override";

export interface EscrowRecord {
  id: string;
  reference: string;
  payment: string;
  payment_reference?: string;
  booking_reference?: string;
  schedule: string;
  schedule_date?: string;
  amount: string | number;
  status: EscrowStatus;
  status_display?: string;
  held_at: string;
  resolved_at?: string | null;
  resolution_method?: EscrowResolutionMethod | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type RefundReason = "sailing_cancelled" | "weather" | "other";

export type RefundStatus = "pending" | "processing" | "completed" | "rejected";

export interface Refund {
  id: string;
  reference: string;
  payment: string;
  payment_reference?: string;
  booking: string;
  booking_reference?: string;
  escrow?: string | null;
  amount: string | number;
  reason: RefundReason;
  reason_display?: string;
  status: RefundStatus;
  status_display?: string;
  requested_by?: string | null;
  requested_by_email?: string;
  processed_by?: string | null;
  processed_by_email?: string;
  requested_at: string;
  processed_at?: string | null;
  mpesa_ref?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MpesaSTKInitiateRequest {
  booking_id: string;
  phone_number: string;
}

export interface MpesaSTKInitiateResponse {
  message: string;
  payment_reference: string;
  checkout_request_id: string;
}
