import React from "react";
import DhowManagerShell from "@/components/dhow-manager/DhowManagerShell";

export default function DhowManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DhowManagerShell>
      {children}
    </DhowManagerShell>
  );
}
