import { ClipboardCheck, Link2, Pencil, QrCode, Ticket, UserX } from "lucide-react";
import type { HelpFaq, HelpTerm, HelpTopic } from "../HelpCenter";
import { bookingTerms } from "./shared";

export const publicTopics: HelpTopic[] = [
  {
    id: "crew-link",
    title: "Open the passenger list",
    subtitle: "For dock crew",
    icon: Link2,
    when: "A manager or supervisor has sent you a link to today's passenger list.",
    steps: [
      "Open the link on your phone. You don't need a password.",
      "At the top you'll see the dhow, the date and the sailing time, and how many guests are booked and checked in.",
      "The list updates by itself every 10 seconds, so several crew members can work at once. Tap **Sync List** to update it straight away.",
    ],
    tip: "The link only works for **that one sailing**. Don't forward it to anyone outside the crew.",
  },
  {
    id: "tick-in",
    title: "Check guests in",
    subtitle: "For dock crew",
    icon: ClipboardCheck,
    when: "Guests are arriving and boarding the dhow.",
    steps: [
      "Type the guest's name, booking reference or table in the **search box**.",
      "Under **Passenger Boarding Checklist**, tap each guest who is boarding. Their name turns green.",
      "Tapped the wrong person? Tap them again to undo.",
      "Look at the **Outstanding Balance** on the booking. If money is owed, tell the supervisor before the guest boards.",
    ],
  },
  {
    id: "fix-name",
    title: "Fix a guest's name",
    subtitle: "For dock crew",
    icon: Pencil,
    when: "A name is spelled wrong or shows as \"Guest 2\", \"Guest 3\" and so on.",
    steps: [
      "Find the guest in the list.",
      "Tap the **pencil** next to their name.",
      "Type the first and last name, then tap **Save**.",
    ],
  },
  {
    id: "no-show",
    title: "Guests who didn't come",
    subtitle: "For dock crew",
    icon: UserX,
    when: "Boarding is closing and a booking hasn't arrived.",
    steps: [
      "If **nobody** from the booking came, tap **No Show** on the booking.",
      "If only **some** came, tick the ones who boarded and leave the others unticked.",
      "Only use **Cancel** if the supervisor or manager asks you to.",
    ],
    tip: "Walk-in guests (people without a booking) are added by the supervisor or manager, not from this link.",
  },
  {
    id: "boarding-pass",
    title: "Your boarding pass",
    subtitle: "For guests",
    icon: Ticket,
    when: "You have booked a Tamarind Dhow cruise and received a boarding pass link.",
    steps: [
      "Open the link you were sent. It shows your **date**, **sailing time**, **table**, the **names in your party** and any **dietary requests**.",
      "Check that everything is correct. If anything is wrong, contact Tamarind reservations.",
      "To keep a paper copy, tap **Print Boarding Pass / PDF**.",
    ],
    tip: "Keep the link private. Anyone who has it can see your booking.",
  },
  {
    id: "at-the-dock",
    title: "Boarding at the dock",
    subtitle: "For guests",
    icon: QrCode,
    when: "You have arrived at the dock for your cruise.",
    steps: [
      "Open your boarding pass on your phone, or bring the printed copy.",
      "Show the **QR code** to the crew. One scan checks in your **whole party**.",
      "If the code won't scan, give the crew your **booking reference** (for example BK-2026-0042), printed under the QR code.",
    ],
  },
];

export const publicFaqs: HelpFaq[] = [
  {
    question: "The passenger list says \"Manifest Error\".",
    answer: "The link is incomplete or out of date. Ask the manager or supervisor to send it again.",
  },
  {
    question: "A guest says they booked, but they aren't on the list.",
    answer:
      "Search by their surname, the name of the person who booked, or their booking reference. If they still aren't there, send them to the supervisor.",
  },
  {
    question: "My boarding pass says \"Invalid Ticket\".",
    answer:
      "Make sure you opened the full link you were sent. If it still doesn't work, contact Tamarind reservations with your name and sailing date.",
  },
  {
    question: "What happens if my cruise is cancelled?",
    answer:
      "When you booked, you chose either a refund or a new date. Tamarind will contact you to arrange it.",
  },
];

export const publicGlossary: HelpTerm[] = bookingTerms;
