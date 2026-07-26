# Tamarind Dhow Manager — Systems Operations Documentation

This guide provides deep technical and operational guidelines for the **Dhow Manager** role inside the Tamarind Dhow booking engine system.

---

## 1. Fleet & Packages Management
*   **Vessel Configuration:** Fleet managers register active sailing vessels (e.g. Tamarind Dhow I & II). Each vessel defines a `total_capacity` limit (e.g. 60 or 75 seats) and a `min_quota` threshold.
*   **Dining Packages:** Add-on pricing and primary packages (Lunch Cruises vs Sunset Cruises) can be customized with standard menu options and base rates.
*   **Decoupled Forms:** Form configurations are housed within `forms/vessels/` for modular imports.

---

## 2. Sailing Schedules & Quota Thresholds
*   **Generation:** Managers generate single dates or bulk calendar slots for cruises. Each sailing specifies meal types (Lunch or Sunset Cruise), departure/return times, individual price parameters (with separate rates for adults and children), and exclusive flat fees. Past dates are automatically blocked from selection in the UI.
*   **Voyage Status Lifecycle:**
    1.  `Scheduled`: Voyage created.
    2.  `Confirmed`: Confirmed to sail (normally once passenger count exceeds the vessel's `min_quota`).
    3.  `Cancelled`: Cancelled due to weather or low occupancy.
    4.  `Completed`: Dhow has departed and completed boarding (sailing checklist closed).
*   **Capacity Gates:** The scheduling engine automatically gates online guest selections based on available capacity (`vessel capacity - current passenger count`).

---

## 3. Walk-In Guest Registration
*   **Form Location:** Accessible via the **Register Walk-In** modal form on the full-width Walk-In Bookings page.
*   **Roster & Pricing Selection:** Supports inputting adult and child counts separately. It displays a dynamic total pricing breakdown based on the voyage's adult/child rates and automatically generates placeholder guest roster records for the entire group. Past dates are hidden from selection.
*   **Payment Collection Bypasses:** Walk-in payments bypass online digital escrows. Managers collect cash, card, or manual M-Pesa. Submitting writes immediate payment receipts into the database.
*   **Cancellation & Rescheduling:** Guests specify cancellation preferences (`Refund` or `Reschedule`). Managers can also reschedule bookings directly to upcoming open voyages via a quick-action modal in the log grid.

---

## 4. Digital Manifest & Check-In
*   **Manifest Checklist:** Located under `/schedules/[ref]/manifest`. This page groups all confirmed bookings for check-in.
*   **Table Allocations:** Seating charts can be assigned directly from the manifest row using a dropdown containing all available tables.
*   **Granular Plate Attendance:** Displays an expandable plate roster under each booking, allowing the crew to toggle check-in or no-show status for each guest individually. This ensures food plates are accounted for precisely when part of a group does not attend.
*   **Digital Toggles:** Crew can toggle check-ins at the booking level, which automatically updates the entire guest list roster, or modify specific guest statuses.
*   **Marking Sailed:** Clicking the **Mark Dhow as Sailed** button updates the voyage status to `"completed"`. This action permanently **locks the checklist and table seats charts** from further edits.

---

## 5. Seating & Table Charts
*   **Voyage Seating:** Confirmed passengers are dynamically mapped to seating charts at `/schedules/[ref]/tables`.
*   **Table Creation:** Crew can dynamically add, resize (pax capacity), or delete tables to match custom deck configurations.
*   **Seating Assignment:** Select a table card to display a dropdown of bookings matching that sailing. Assigning locks the seats and flags the guest name.

---

## 6. Financial Controls & Escrow Reversals
*   **Escrow Holds:** Payment for online digital bookings is held in secure escrow.
*   **Refund Processing:** If a sailing is cancelled, bookings flagged with a `refund` cancellation preference trigger a refund request in `/dhow-manager/finance`.
*   **Processing Portal:** Accounts teams approve/reject refunds, logging banking reference codes and audit notes.

---

## 7. Operational Reports & Exports
*   **Summary Cards:** Dynamic metrics aggregating gross revenues, average occupancy rates, minimum quota fulfillment, and cancellation percentages.
*   **CSV Exports:** Filter historical logs by date range, dhow, or booking status, and export the filtered list to a CSV spreadsheet.

---

## 8. QR Code Scanner Verification
*   **Scanner Page:** Accessible at `/dhow-manager/scanner`.
*   **Barcode Scanning:** Supports scanning guns (keyboard simulation) or camera scanner overrides to verify booking codes. Valid tickets immediately patch booking status to `"completed"` in the database.