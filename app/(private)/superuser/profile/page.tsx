import { redirect } from "next/navigation";

// Profile lives in the shared manager portal.
export default function SuperuserProfileRedirect() {
  redirect("/dhow-manager/profile");
}
