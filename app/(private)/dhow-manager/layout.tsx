"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DhowManagerShell from "@/components/dhow-manager/DhowManagerShell";
import LoadingSpinner from "@/components/dhow-manager/LoadingSpinner";

export default function DhowManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  // Same rule as the API's IsDhowManager permission.
  const canManage = !!(
    session?.user?.is_dhow_manager ||
    session?.user?.is_staff ||
    session?.user?.is_superuser
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !canManage) {
      router.replace("/");
    }
  }, [status, canManage, router]);

  if (status !== "authenticated" || !canManage) {
    return <LoadingSpinner />;
  }

  return (
    <DhowManagerShell>
      {children}
    </DhowManagerShell>
  );
}
