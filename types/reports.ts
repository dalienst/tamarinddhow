export interface RevenueReportItem {
  period: string;
  total_revenue: number;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  avg_revenue_per_booking: number;
}

export interface OccupancyReportItem {
  dhow_name: string;
  schedules_count: number;
  total_capacity_offered: number;
  total_guests_sailed: number;
  occupancy_rate_percentage: number;
  quota_fulfillment_rate_percentage: number;
}

export interface EscrowSummaryReport {
  total_in_escrow_holding: number;
  total_released_to_finance: number;
  total_reversed_to_guest: number;
  pending_refunds_count: number;
  pending_refunds_total_amount: number;
}
