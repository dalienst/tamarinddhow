"use client";

import React from "react";
import { Badge } from "@radix-ui/themes";

interface StatusBadgeProps {
  status?: string;
  type?: "schedule" | "booking" | "payment" | "escrow" | "refund";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = "booking" }) => {
  if (!status) return null;

  const s = status.toLowerCase();

  let color: "gray" | "gold" | "bronze" | "brown" | "yellow" | "amber" | "orange" | "tomato" | "red" | "ruby" | "crimson" | "pink" | "plum" | "purple" | "violet" | "iris" | "indigo" | "blue" | "cyan" | "teal" | "jade" | "green" | "grass" | "lime" | "mint" | "sky" = "gray";

  if (["confirmed", "completed", "released_to_finance", "checked_in"].includes(s)) {
    color = "green";
  } else if (["pending", "holding", "scheduled", "processing"].includes(s)) {
    color = "amber";
  } else if (["cancelled", "failed", "rejected", "reversed_to_guest", "no_show"].includes(s)) {
    color = "red";
  } else if (["rescheduled"].includes(s)) {
    color = "purple";
  }

  return (
    <Badge color={color} variant="soft" size="2" className="capitalize font-medium">
      {status.replace(/_/g, " ")}
    </Badge>
  );
};
