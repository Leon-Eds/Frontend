"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile by default, toggled via hamburger */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
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
                <a href="#" className="hover:text-gray-600 transition-colors uppercase tracking-wider">Privacy Protocol</a>
                <a href="#" className="hover:text-gray-600 transition-colors uppercase tracking-wider">System Support</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
