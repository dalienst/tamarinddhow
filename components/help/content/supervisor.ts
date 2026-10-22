import {
  ClipboardCheck,
  LayoutDashboard,
  QrCode,
  Share2,
  UserPlus,
  UserX,
  CalendarDays,
} from "lucide-react";
import type { HelpFaq, HelpTerm, HelpTopic } from "../HelpCenter";
import { bookingTerms, sailingTerms } from "./shared";

export const supervisorTopics: HelpTopic[] = [
  {
    id: "dashboard",
    title: "See today's sailings",
    subtitle: "Boarding desk",
    icon: LayoutDashboard,
    when: "At the start of your shift, to see which sailings are going out and how many guests to expect.",
    steps: [
      "Click **Dashboard** in the menu on the left. On a phone, tap the menu button at the top first.",
      "Today's and upcoming sailings are listed with the number of guests booked, for example **18 / 30 Pax**.",
      "Check whether enough guests are booked for the dhow to sail (the minimum quota). If not, tell the manager.",
    ],
    link: { href: "/supervisor/dashboard", label: "Open Dashboard" },
  },
  {
    id: "check-in",
    title: "Check guests in",
    subtitle: "The passenger list",
    icon: ClipboardCheck,
    when: "Guests are arriving at the dock and you need to mark who has boarded.",
    steps: [
      "On the **Dashboard**, click **Open manifest checklist** next to the sailing.",
      "Type the guest's name, booking reference or table in the **search box**.",
      "Tick the booking to check in the **whole party**. Or open the guest list under it and tick people **one by one**.",
      "If a name is spelled wrong, or shows as \"Guest 2\", click the **pencil** and type the correct name.",
      "Check the **balance** on the booking. If money is still owed, collect it or tell the manager before the guest boards.",
    ],
    tip: "Ticking guests one by one tells the kitchen exactly how many meals to serve.",
    link: { href: "/supervisor/dashboard", label: "Open Dashboard" },
  },
  {
    id: "scanner",
    title: "Scan boarding passes",
    subtitle: "QR scanner",
    icon: QrCode,
    when: "Guests show the QR code on their boarding pass.",
    steps: [
      "Click **QR Scanner** in the menu. It works best on a phone or tablet.",
      "Choose **Camera Scanner** and allow the camera when asked. Point it at the QR code.",
      "If the code won't scan, choose **Manual Entry**, type the booking reference (for example BK-2026-0042) and click **Lookup Ticket**.",
      "**Green** means the party is checked in. Read out their table and any dietary notes.",
      "**Amber** means they were already checked in. **Red** means the ticket is cancelled, a no-show, or not found. Don't board them; call the manager on duty.",
    ],
    tip: "One scan checks in **everyone** on that booking.",
    link: { href: "/supervisor/scanner", label: "Open QR Scanner" },
  },
  {
    id: "walk-in",
    title: "Add a guest who just turned up",
    subtitle: "Walk-ins at the pier",
    icon: UserPlus,
    when: "Someone arrives at the dock without a booking and there is space on the dhow.",
    steps: [
      "Click **Walk-In Booking** in the menu, then click **Register Walk-In**.",
      "Choose **Single Guest Booking**, then choose today's **sailing**.",
      "Type the guest's **full name**. Phone and email are optional.",
      "Enter the number of **adults** and **children**. The total is worked out for you.",
      "Choose how they paid (for example **Cash** or **M-Pesa**) and type the M-Pesa or card code, then save.",
      "Go back to the passenger list. The new guests are there, ready to tick in.",
    ],
    tip: "Don't change prices unless a manager has approved it.",
    link: { href: "/supervisor/walk-in", label: "Open Walk-In Booking" },
  },
  {
    id: "no-show",
    title: "Guests who didn't come",
    subtitle: "No-shows",
    icon: UserX,
    when: "Boarding is closing and some booked guests haven't arrived.",
    steps: [
      "Open the sailing's passenger list.",
      "If **nobody** from a booking came, mark the whole booking as **No Show**.",
      "If only **some** of the party came, tick the ones who boarded and leave the rest unticked.",
      "Tell the manager. They will mark the dhow as sailed, which locks the list.",
    ],
    link: { href: "/supervisor/dashboard", label: "Open Dashboard" },
  },
  {
    id: "share",
    title: "Give the list to crew",
    subtitle: "Crew link",
    icon: Share2,
    when: "A crew member without an account needs to help with check-in on their phone.",
    steps: [
      "Open the sailing's passenger list and click **Share Public Manifest**.",
      "Type the crew member's email and click **Send**, or click **Copy** and send the link on WhatsApp.",
      "They can tick guests in on their phone. Everyone sees the same list, which updates every 10 seconds.",
    ],
    tip: "Only share this link with crew. Anyone who has it can change the list.",
    link: { href: "/supervisor/dashboard", label: "Open Dashboard" },
  },
  {
    id: "calendar",
    title: "Look up a sailing",
    subtitle: "Calendar and list",
    icon: CalendarDays,
    when: "You need to check the details of a sailing on another day.",
    steps: [
      "Click **Sailing Calendar** to see a month at a glance, or **Sailing List** to see every sailing in a list.",
      "Click a day on the calendar to see its sailings and open the passenger list.",
    ],
    tip: "Confirming or cancelling a sailing, arranging tables and marking the dhow as sailed are done by a **manager**.",
    link: { href: "/supervisor/schedules", label: "Open Sailing Calendar" },
  },
];

export const supervisorFaqs: HelpFaq[] = [
  {
    question: "A guest says they booked, but I can't find them.",
    answer:
      "Search by their booking reference, their surname, or the name of the person who made the booking. If they still aren't there, call the manager before adding them as a walk-in.",
  },
  {
    question: "The scanner won't open the camera.",
    answer:
      "Allow camera access when your browser asks. If it still doesn't work, use Manual Entry and type the reference from the guest's pass.",
  },
  {
    question: "I ticked the wrong guest.",
    answer: "Tap the same guest again to untick them.",
  },
  {
    question: "Some buttons give an error.",
    answer:
      "Some actions are for managers only, such as cancelling a sailing, arranging tables or marking the dhow as sailed. Ask the manager on duty.",
  },
  {
    question: "I forgot my password.",
    answer:
      "Sign out, click Forgot password? on the sign-in page, and follow the code that is emailed to you.",
  },
];

export const supervisorGlossary: HelpTerm[] = [...sailingTerms, ...bookingTerms];
