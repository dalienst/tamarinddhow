import type { HelpTerm } from "../HelpCenter";

export const sailingTerms: HelpTerm[] = [
  {
    term: "Sailing (voyage)",
    meaning: "One trip of one dhow on one date, for example Saturday's Sunset Cruise on Tamarind Dhow I.",
  },
  {
    term: "Scheduled",
    meaning: "The sailing is on the calendar and can take bookings, but it has not been confirmed yet.",
  },
  {
    term: "Confirmed",
    meaning: "The sailing will definitely go ahead. This is usually done once enough guests have booked.",
  },
  {
    term: "Cancelled",
    meaning: "The sailing will not go ahead, for example because of bad weather. Guests are refunded or moved to another sailing.",
  },
  {
    term: "Completed",
    meaning: "The dhow has sailed. The passenger list and seating are locked.",
  },
  {
    term: "Open / Closed bookings",
    meaning: "Open means new bookings are allowed for that sailing. Closed means no new bookings, even if there are seats left.",
  },
  {
    term: "Minimum quota",
    meaning: "The smallest number of guests needed for a dhow to sail. Each dhow has its own number.",
  },
  {
    term: "Pax",
    meaning: "Short for passengers. \"18 / 30 Pax\" means 18 guests are booked out of 30 seats.",
  },
];

export const bookingTerms: HelpTerm[] = [
  {
    term: "Booking reference",
    meaning: "The code that identifies a booking, for example BK-2026-0042. It is printed on the guest's boarding pass.",
  },
  {
    term: "Checked in / Boarded",
    meaning: "The guest has arrived and boarded the dhow.",
  },
  {
    term: "No Show",
    meaning: "The guest did not turn up. Their meal is not prepared.",
  },
  {
    term: "Cancellation preference",
    meaning: "What the guest wants if the sailing is cancelled: their money back (Refund) or a seat on another day (Reschedule).",
  },
  {
    term: "Walk-in",
    meaning: "A booking made in person or over the phone by staff, rather than online.",
  },
  {
    term: "Outstanding balance",
    meaning: "Money the guest still owes on the booking.",
  },
];
