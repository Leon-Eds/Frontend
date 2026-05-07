"use client";

import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't wrap onboarding in the dashboard layout
  if (pathname === "/super-admin/onboard") {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
