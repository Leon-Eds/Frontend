"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("leoned_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const role = user.role?.toLowerCase() || "";
          if (role === "student" || role === "parent" || role === "guardian") {
            setIsStudent(true);
          } else {
            const demoRole = localStorage.getItem("leoned_demo_role");
            if (demoRole === "Student") setIsStudent(true);
          }
        } catch {}
      } else {
        const demoRole = localStorage.getItem("leoned_demo_role");
        if (demoRole === "Student") setIsStudent(true);
      }
    }
  }, []);

  const isOverview = pathname === "/dashboard" || pathname === "/super-admin";

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] overflow-hidden">
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && !isStudent && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile by default, toggled via hamburger. Hidden for students. */}
        {!isStudent && (
          <div
            className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <div className={isOverview || isStudent ? "" : "lg:hidden"}>
            <Header onMenuToggle={() => setSidebarOpen(true)} isStudent={isStudent} />
          </div>
          <main className="flex-1 overflow-y-auto blueprint-bg flex flex-col">
            <div className="p-4 sm:p-6 lg:p-8 flex-1">
              {children}
            </div>
            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white/60 backdrop-blur-sm px-4 sm:px-8 py-6 mt-auto shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  © 2026 LeonEd Africa. Academic Architect System.
                </p>
                <div className="flex gap-6 text-xs text-gray-400 font-medium">
                  <Link href="/privacy" className="hover:text-gray-600 transition-colors uppercase tracking-wider">Privacy Protocol</Link>
                  <Link href="/support" className="hover:text-gray-600 transition-colors uppercase tracking-wider">System Support</Link>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

