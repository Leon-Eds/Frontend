"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardPathFor } from "@/lib/auth-redirect";

/**
 * Start page for the installed app (see manifest.ts): skips the landing page and
 * sends signed-in users to their dashboard, everyone else to login.
 */
export default function LaunchPage() {
  const router = useRouter();

  useEffect(() => {
    let target = "/login";
    try {
      const token = localStorage.getItem("leoned_token");
      const expiry = localStorage.getItem("leoned_token_expiry");
      const refreshToken = localStorage.getItem("leoned_refresh_token");
      // An expired token without a refresh token can't be renewed, so the user must sign in again
      const expired = !!expiry && new Date(expiry).getTime() < Date.now() && !refreshToken;

      if (token && !expired) {
        const user = JSON.parse(localStorage.getItem("leoned_user") || "{}");
        const selectedRole = localStorage.getItem("leoned_demo_role") || "";
        target = dashboardPathFor(user.role || selectedRole, selectedRole);
      }
    } catch {}
    router.replace(target);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#053d26]" />
    </div>
  );
}
