# Tamarind Dhow: Public Check-in Guide

This guide covers the check-in pages that work **without signing in**:

1. **The crew manifest link**, which dock crew use to check passengers in
2. **The guest boarding pass**, which guests show at the dock

Staff with an account should use the *Staff Navigation Guide*. The same help is in the app at `/help/check-in`, linked from the crew list (**How to check in**) and the boarding pass (**How boarding works**).

---

## Part A: Crew manifest link (for dock crew)

### A.1 Getting the link
A Dhow Manager or Supervisor shares the link for **one sailing**. They do this with **Share Public Link** on the Sailing List, or **Share Public Manifest** on the manifest page, which can also email it to you. The link looks like:

```
https://<platform>/manifest/<sailing-reference>?token=<access-token>
```

Open it on a phone or tablet. You don't need a login. It works for that sailing only.

> Treat the link like a key. Anyone who has it can check guests in and change bookings for that sailing. Don't forward it outside the crew.

### A.2 What's on the screen
- **Header**: the vessel, date, meal type, and departure and return times
- **Summary**: *Total Booked*, *Boarding Status* (checked in compared with expected), and *Vessel Status*
- **Auto-Sync, every 10s**: the list refreshes itself, so several crew members can check in at the same time
- **Buttons**: **How to check in** (opens the help page), **Sync List**, **Share Link**, **Download PDF**
- **Search bar**: search by passenger name, booking reference or table
- **Booking cards**: one for each booking, showing the table, special requests, add-ons, and the payment summary (total expected, total paid, outstanding balance, discount)

### A.3 Checking passengers in
1. When a party arrives, **search** for the name, reference or table.
2. Under **Passenger Boarding Checklist**, tap each guest who is present to mark them **boarded**. Tap again to undo.
3. Guests who don't come are left unticked, so the kitchen's plate count stays accurate.
4. Before boarding, check the **Outstanding Balance** on the booking card. Collect any balance or flag it to the supervisor.

### A.4 Fixing and updating bookings
- **Wrong name?** Tap the **pencil** next to a passenger, edit the first and last name, then tap **Save**. Unnamed extras such as "Guest 2" can be renamed here.
- **Whole party didn't show?** Tap **No Show** on the booking.
- **Booking should be cancelled?** Tap **Cancel** and confirm.

### A.5 Walk-ins at the pier
Guests who arrive without a booking can't be added from the crew link. Send them to the supervisor or manager, who adds them from **Walk-In Booking**. Once they're added, they appear on your list within 10 seconds (or tap **Sync List**).

### A.6 After boarding
- **Download PDF** for a printed copy of the final manifest.
- The manager then marks the dhow as **Sailed**, which closes the sailing.

---

## Part B: Guest boarding pass (for guests)

### B.1 Your boarding pass link
Tamarind reservations send you a link to your boarding pass, which looks like `https://<platform>/ticket/BK-2026-XXXX`. The pass shows:
- your **Voyage Reference** and a **QR code**
- **Sailing Date** and **Cruise Time**
- **Guest Details** and your **Table Assignment**
- your party's passenger list
- any **Dietary & Special Requests**

### B.2 At the dock
1. Open the link on your phone, or tap **Print Boarding Pass / PDF** to print it beforehand.
2. Show the QR code to the crew ("Scan at dock to board"). One scan checks in your **whole party**.
3. If the code won't scan, read out your booking reference. The crew can type it in or find you on the manifest.

If the page says **Invalid Ticket**, check that the link matches your receipt exactly, or contact reservations.

> Keep your link private. Anyone who has it can see your booking details.

---

## Quick troubleshooting (crew)

| Problem | What to do |
|---|---|
| "Manifest Error" / link won't load | The link or token is wrong. Ask the manager to re-share it. |
| Scanner says "already checked in" | The party has already boarded. Check the manifest. |
| Scanner says the ticket is cancelled or a no-show | Don't board. Refer the guest to the supervisor. |
| A guest isn't on the manifest | Search by reference or table. If they're still not there, send them to the supervisor. |
| Changes won't save | Check your internet connection and tap **Sync List**. If it still fails, ask the manager to re-share the link. |
