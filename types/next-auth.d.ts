import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      is_guest?: boolean;
      is_dhow_manager?: boolean;
      is_agent?: boolean;
      is_staff?: boolean;
      is_superuser?: boolean;
      access?: string;
      refresh?: string;
      // Add other custom properties if necessary
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
    is_guest?: boolean;
    is_dhow_manager?: boolean;
    is_agent?: boolean;
    access?: string;
    refresh?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    is_guest?: boolean;
    is_dhow_manager?: boolean;
    is_agent?: boolean;
    access?: string;
    refresh?: string;
  }
}
