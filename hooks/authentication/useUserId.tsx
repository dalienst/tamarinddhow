"use client";

import { useSession } from "next-auth/react";
import { Session, User } from "next-auth";

interface CustomUser extends User {
  id: string;
}

interface CustomSession extends Session {
  user: CustomUser;
}

function useUserId(): string | null {
  const { data: session, status } = useSession();
  // Return null if session is not authenticated or data is null
  if (status !== "authenticated" || !session) {
    return null;
  }
  // Cast session to CustomSession since we know it's authenticated
  const customSession = session as CustomSession;
  const userId = customSession.user.id;
  return userId;
}

export default useUserId;
