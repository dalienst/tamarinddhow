# Tamarind Dhow: Staff Navigation Guide (Internal Module)

This guide covers the **internal module** of the Tamarind Dhow booking management system: the **Dhow Manager** and **Supervisor** portals, and sailing-day check-in. It explains where everything is and how to work through a normal operating day. Check-in by the public crew link and guest boarding passes is covered in the *Public Check-in Guide*.

---

## 1. Getting started

### 1.1 Getting your account
Staff accounts are created by a Dhow Manager (see section 4). When yours is created, you receive an **activation email**. Open the link, choose a password and confirm it. The password must contain an uppercase letter, a number and a special character. Then sign in.

### 1.2 Signing in
1. Go to the site and click **Sign In**, or open `/login`.
2. Enter your email address and password, then click **Sign In**.
3. You are taken straight to the home page for your role:

| Role | Home page |
|---|---|
| Dhow Manager | `/dhow-manager/dashboard` |
| Supervisor | `/supervisor/dashboard` |

### 1.3 Forgotten password
1. On the login page, click **Forgot password?**
2. Enter your email and click **Send Reset Code**.
3. You are taken to **Reset Password**. Enter your email, the code from the email, and your new password twice, then click **Reset Password**.

### 1.4 Changing your details
Managers and Supervisors open **Profile Settings** from the sidebar. There you can update your personal information, such as your name and phone number, and change your password under **Security & Password**.

### 1.5 Finding your way around
- Manager and Supervisor screens have a **sidebar on the left**. On a phone, tap the menu icon in the top bar to open it.
- Each portal has a **Help Guide** page with step-by-step cards (`/dhow-manager/help`, `/supervisor/help`).

---

## 2. Dhow Manager

The Dhow Manager has the full portal. The sidebar contains:

| Sidebar item | Page | What it's for |
|---|---|---|
| Dashboard | `/dhow-manager/dashboard` | At-a-glance view of sailings, vessels, recent bookings and users |
| Sailing Calendar | `/dhow-manager/schedules` | Month view of all sailings; plan voyages |
| Sailing List | `/dhow-manager/schedules/list` | List of sailings with all actions (open, close, confirm, cancel, share) |
| Walk-In Booking | `/dhow-manager/walk-in` | Register and manage desk or phone bookings |
| Finance & Escrow | `/dhow-manager/finance` | Escrow holdings and refund processing |
| Reports | `/dhow-manager/reports` | Revenue, attendance and occupancy analytics; CSV export |
| Vessels | `/dhow-manager/vessels` | Dhows and dining packages |
| Dining Schedules | `/dhow-manager/dining-schedules` | Sailing blueprints (templates) for each vessel |
| Add-Ons | `/dhow-manager/addons` | Extras such as cakes, drinks and flowers |
| Scanner | `/dhow-manager/scanner` | Scan or type ticket codes at the dock |
| Help Guide | `/dhow-manager/help` | In-app walkthrough |
| Profile Settings | `/dhow-manager/profile` | Your details and password |

### 2.1 The Dashboard
- **Quick-action tiles** at the top go to Schedule Center, Walk-In & Phone Booking, Financials & Escrow, and Analytics & Reports.
- **Sailings card:** the next 5 upcoming sailings, showing pax count, whether bookings are Open or Closed, and status. **Manage all** opens the calendar.
- **Vessels card:** each dhow's max and min capacity, whether it is In Service, and whether it is Active. **Configure** opens Vessels.
- **Recent bookings:** the latest 5 active bookings. Use the pencil to **Edit Booking**, or the QR icon to **View Ticket QR**. From the ticket QR you can copy the guest's boarding-pass link.
- **Users:** the latest users. The **+** button lets you **Create Agent**, **Create Dhow Manager** or **Create Supervisor**.

### 2.2 First-time setup (do this once, in order)
1. **Register vessels.** Go to **Vessels**, then the **Dhow Vessels** tab. Fill in the registration form: name, total capacity (max passengers), and minimum quota (the passenger count needed for a sailing to be viable). Use the edit icon on a vessel card to change details, take it out of service, or deactivate it.
2. **Create dining packages.** Go to **Vessels**, then the **Dining Packages** tab, and click **Add Dining Package**. Give it a name, a price, the meal type it belongs to, and the menu inclusions.
3. **Create sailing blueprints.** Go to **Dining Schedules** and add a template under a vessel. Each template sets the meal type, departure and return times, operating days, price per person, and the exclusive charter flat fee. Templates are plans only; they do not add sailings to the calendar.
4. **Add extras.** Go to **Add-Ons** and click **Add Extra Add-on** for items like champagne, cakes or flowers. Each one has a price and a short serving note.

### 2.3 Planning sailings
**From the calendar** (`Sailing Calendar`):
- Use the arrows to move between months. Each day shows up to 3 sailing chips with time and dhow, and "+ N more" if there are others. Chip colours: blue is Scheduled, green is Confirmed, red is Cancelled, and grey means bookings are closed.
- Click **Create Sailing** at the top, or click a day and then **Plan Voyage** in the side panel.
- Fill in: Dhow Vessel, Sailing Date, Meal Type (Lunch, Sunset Cruise, Dinner Cruise, Booze Cruise or Special Cruise), Departure and Return Time, Price per Adult, Price per Child, Exclusive Flat Fee (KES), and Voyage Notes for the crew.
- Clicking a day opens the **Sailing Manifest** side panel. For each sailing there you can open the **Manifest** or **Seating** layout, **Edit details**, and **Close**, **Open**, **Confirm** or **Cancel** the sailing.

**From the list** (`Sailing List`): every sailing appears as a row with these actions:
- **Manifest Checklist**: boarding check-in for that sailing
- **Seating Layout**: table plan
- **Edit Voyage Details**
- **Book Walk-In**: opens the walk-in form with this sailing already chosen
- **Share Public Link**: crew manifest link (see 2.6)
- **Close Bookings** / **Open Bookings**: stop or allow new bookings
- **Confirm Sailing**: the sailing will go ahead
- **Cancel Sailing**: asks for a cancellation reason

**Sailing status lifecycle**

| Status | Meaning |
|---|---|
| Scheduled | Created and taking bookings |
| Confirmed | Confirmed to sail, normally once the vessel's minimum quota is met |
| Cancelled | Cancelled, for example because of weather or low numbers. Refunds or reschedules follow each guest's cancellation preference. |
| Completed | The dhow has sailed. The manifest and seating chart are locked. |

Whether bookings are **Open** or **Closed** is a separate switch from the status.

### 2.4 Walk-in and phone bookings
Go to **Walk-In Booking**. It shows the **Walk-In Guest Log**, a list of active walk-ins with reference, guest, guest count, total price and status.

**To register a booking**, click **Register Walk-In**. You can choose:
- **Single Guest Booking**, with these sections:
  1. *Select Sailing Schedule*
  2. *Guest Contact Details*: full name (required), plus email and phone (optional)
  3. *Reservation & Pricing*: number of adults and children (child pricing applies), and optional custom adult or child price overrides. The **Pricing Math Summary** updates as you type.
  4. *Cancellation Preference*: Confirmed (sailing guaranteed), Refund Money, or Reschedule Date
  5. *Seating Request* and *Allocated Table* (both optional)
  6. *Custom Add-Ons*: set quantities, and override prices if needed
  7. *Discounts & Partial Payments*: a flat KES amount or a percentage. A discount reason is required whenever you give a discount. A deposit is also possible.
  8. *Special Dietary / Voyage Requests*
  9. *Explicit Payment State*: Paid by Cash, M-Pesa, Visa or Mastercard; Staff Card; Agent Credit (voucher or invoice); Waived (complimentary); or Unpaid (pay on arrival). Add the transaction reference where there is one.
- **Bulk Group Entry**: add several booking rows at once, each with the same fields. A running total shows gross, discounts, paid and receivable amounts.

Walk-in payments do **not** go through escrow; the payment is recorded straight away.

**Actions on each log row:**
- **Edit**: opens *Modify Booking Details* (`/dhow-manager/walk-in/[ref]/edit`)
- **Reschedule**: choose another upcoming open sailing, then click **Confirm Reschedule**
- **Refund**: opens *Manual Refund Request*. Choose the payment, enter the amount, pick a reason (Sailing Cancelled, Bad Weather, Other Reason) and add internal notes. The request then appears under Finance.
- **Cancel** / **Delete**: cancel the booking, or delete it permanently. Both ask you to confirm.

### 2.5 Sailing day: manifest and check-in
Open the manifest from **Sailing List**, then **Manifest Checklist** (or from the calendar side panel). The URL is `/dhow-manager/schedules/[ref]/manifest`.
- **Search** by guest name or reference.
- Every booking shows its party, payments and balance. Expand **Granular Food Plate Attendance** to mark **each guest** as checked in or **No Show**, so the kitchen knows exactly how many plates are needed.
- Checking in a whole booking checks in everyone in its roster.
- **+ Allocate Table**: assign a table straight from the booking row.
- **Download PDF**: a printable manifest.
- **Share Public Manifest**: send a crew link to a supervisor's email, or **Copy Access Link** (see 2.6).
- **Sail Dhow** ("Mark Dhow as Sailed") sets the sailing to **Completed** and **locks** check-ins and seating. If you need to correct something afterwards, use **Reopen Checklist**.

**Seating layout** (`/dhow-manager/schedules/[ref]/tables`):
- Click **Add New Table to Sailing**. Choose **Single Table** (name, seats, location note) or **Bulk Generate** (several rows, then **Generate Tables**).
- Click a table card, choose the guest booking under **Select Guest Booking**, and click **Save Assignment**. To free a table, choose "No Booking (Mark Available)".

**Scanner** (`/dhow-manager/scanner`), best on a phone or tablet:
- **Camera Scanner**: allow camera access, then point at the guest's boarding-pass QR code.
- **Manual Entry**: type the reference (for example `BK-2026-XXXX`) and click **Lookup Ticket**. A handheld barcode gun also works here.
- A valid ticket checks in the **whole booking** (status becomes *Completed*). The **Boarding Result** card shows the guest name, party size, table and dietary requests. Recent scans appear under **Boarding logs**.
- The result card warns you instead if the booking was **already checked in**, is **cancelled**, is a **no-show**, or if the code isn't found ("Invalid Ticket").

### 2.6 Sharing the manifest with crew
**Share Public Link** (Sailing List) or **Share Public Manifest** (manifest page) creates a link of the form `/manifest/[ref]?token=…`. Anyone with the link can open the manifest **without signing in** and can check guests in, rename passengers, mark no-shows or cancellations, and download the PDF. Walk-ins can't be registered from the link; staff add them from **Walk-In Booking**. Share it only with crew. The link stays valid for that sailing; it does not expire at the end of the day.

### 2.7 Finance & Escrow
On `/dhow-manager/finance` there are two tabs:
- **Escrow Holdings**: online payments held until the sailing goes ahead. Each row shows the escrow reference, payment or booking reference, amount, status, resolution method and when it was held.
- **Refund Processing**: pending and processed refunds. Click **Process Refund**, enter the M-Pesa B2C or bank reference and processing notes, then click **Approve & Complete** or **Reject Refund**.

### 2.8 Reports
On `/dhow-manager/reports`:
- **Filter Criteria**: start date, end date, vessel, and booking status.
- **Summary cards**: gross revenue, actual cash collected, outstanding receivable, discounts allowed, average occupancy, quota fulfilment, and cancellation rate.
- There are three tabs:
  - **Detailed Bookings**: the full booking log. Use **Export Operations Log (CSV)** to download it.
  - **Sailing Attendance & Food Cost**: booked compared with onboarded passengers, and no-shows per sailing. Use **Export Sailing Attendance (CSV)** to download it.
  - **Sailing List Analytics**: pick a voyage to see guest mix, payments, packages and add-ons.

---

## 3. Supervisor (dock / pier)

Supervisors have the day-of-sailing tools. **Finance** and **Reports** are not available to them.

| Sidebar item | Page |
|---|---|
| Dashboard | `/supervisor/dashboard` |
| Sailing Calendar | `/supervisor/schedules` |
| Sailing List | `/supervisor/schedules/list` |
| Walk-In Booking | `/supervisor/walk-in` |
| Vessels, Dining Schedules, Add-Ons | view the fleet set-up |
| QR Scanner | `/supervisor/scanner` |
| Profile Settings, Help Guide | |

**A typical sailing day:**
1. Open the **Dashboard** (*Supervisor Boarding Desk*). Today's and upcoming sailings are listed with pax compared with capacity, and whether bookings are open.
2. Click **Open manifest checklist** next to the sailing.
3. As guests arrive, search for them and tick them in. You can tick a whole booking, or individual guests under plate attendance. Use the pencil to fix a name that is spelled wrong.
4. For last-minute arrivals, go to **Walk-In Booking**, click **Register Walk-In**, and choose **Single Guest Booking**. Pick today's sailing, then fill in the guest's name, the number of adults and children, and the payment method and code, and save. The party then appears on the manifest. (**Bulk Group Entry** and table allocation are for managers only.)
5. Or use the **QR Scanner** to scan the guests' boarding passes.

Supervisors work through the same screens as the manager (section 2.3 to 2.6). Actions that need manager rights, such as confirming or cancelling a sailing, are refused by the system.

---

## 4. Creating staff accounts
On the Dhow Manager **Dashboard**, go to the **Users** card and click **+**. Choose **Create Dhow Manager** or **Create Supervisor**. The new user receives an activation email (section 1.1).

---

## 5. Quick reference

### Booking statuses
| Status | Meaning |
|---|---|
| Pending | Created, awaiting payment or confirmation |
| Confirmed | Booked and confirmed |
| Checked in | The guest has boarded (set per guest on the manifest) |
| Completed | The whole booking has boarded (set when the ticket is scanned or the booking is checked in) |
| No show | The guest did not turn up |
| Cancelled | The booking was cancelled |

### Cancellation preference
This is what happens to a booking if its sailing is cancelled. **Refund** creates a refund request in Finance. **Reschedule** moves the guest to another sailing. **Confirmed** is used for walk-ins where the sailing is guaranteed.

### Who can see what
| Area | Manager | Supervisor | Crew link (no login) |
|---|:-:|:-:|:-:|
| Sailing calendar and list | ✓ | ✓ | |
| Plan, confirm or cancel sailings | ✓ | view only | |
| Walk-in bookings | ✓ | ✓ | |
| Manifest and check-in | ✓ | ✓ | ✓ (one sailing) |
| Scanner | ✓ | ✓ | |
| Seating layout | ✓ | | |
| Finance & Escrow | ✓ | | |
| Reports | ✓ | | |
| Vessels, blueprints, add-ons | ✓ | view only | |
| Create staff accounts | ✓ | | |
