"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DhowManagerShell from "@/components/dhow-manager/DhowManagerShell";
import LoadingSpinner from "@/components/dhow-manager/LoadingSpinner";

export default function SuperuserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = !!(session?.user?.is_superuser || session?.user?.is_staff);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  if (status !== "authenticated" || !isAdmin) {
    return <LoadingSpinner />;
  }

  // Admins share the manager shell; its sidebar adds an Admin section for them.
  return <DhowManagerShell>{children}</DhowManagerShell>;
}
