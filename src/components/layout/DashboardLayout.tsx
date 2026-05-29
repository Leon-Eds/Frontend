"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<string>("Admin");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("leoned_demo_role") || "Admin";
      setActiveRole(role);
    }
  }, []);

  const handleRoleChange = (role: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("leoned_demo_role", role);
      
      // Update local storage user details to match role
      const userStr = localStorage.getItem("leoned_user") || "{}";
      try {
        const user = JSON.parse(userStr);
        user.role = role === "Admin" ? "SchoolAdmin" : role === "Faculty" ? "Teacher" : "Student";
        if (role === "Faculty") user.name = "Dr. Elena Rodriguez";
        if (role === "Student") user.name = "Tunde Oke";
        localStorage.setItem("leoned_user", JSON.stringify(user));
      } catch (e) {
        localStorage.setItem("leoned_user", JSON.stringify({
          role: role === "Admin" ? "SchoolAdmin" : role === "Teacher" ? "Teacher" : "Student",
          name: role === "Faculty" ? "Dr. Elena Rodriguez" : role === "Student" ? "Tunde Oke" : "Admin"
        }));
      }
      
      setActiveRole(role);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] overflow-hidden">
      {/* Demo Switcher Bar */}
      <div className="bg-[#053d26] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold border-b border-[#042c1b] shrink-0 z-50">
        <div className="flex items-center gap-2">
          <span className="bg-[#b05e1c] text-white px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider animate-pulse">Demo Switcher</span>
          <span className="text-green-100 hidden sm:inline">Change active dashboard preview role:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleRoleChange("Admin")}
            className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeRole === "Admin"
                ? "bg-[#b05e1c] text-white shadow"
                : "bg-white/10 text-green-100 hover:bg-white/20"
            }`}
          >
            Admin View
          </button>
          <button
            onClick={() => handleRoleChange("Faculty")}
            className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeRole === "Faculty"
                ? "bg-[#b05e1c] text-white shadow"
                : "bg-white/10 text-green-100 hover:bg-white/20"
            }`}
          >
            Teacher View (Dr. Elena)
          </button>
          <button
            onClick={() => handleRoleChange("Student")}
            className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeRole === "Student"
                ? "bg-[#b05e1c] text-white shadow"
                : "bg-white/10 text-green-100 hover:bg-white/20"
            }`}
          >
            Student View (Tunde Oke)
          </button>
        </div>
      </div>

      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile by default, toggled via hamburger */}
        <div
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white/60 backdrop-blur-sm px-4 sm:px-8 py-6 mt-4">
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
