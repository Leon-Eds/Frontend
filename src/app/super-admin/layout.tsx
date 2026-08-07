"use client";

import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't wrap onboarding or login in the dashboard layout
  if (pathname === "/super-admin/onboard" || pathname === "/super-admin/login") {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
