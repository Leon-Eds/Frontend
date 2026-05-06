"use client";

import { useEffect, useState } from "react";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const headerTabs = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Students", href: "/dashboard/students" },
  { name: "Faculty", href: "/dashboard/faculty" },
  { name: "Classes", href: "/dashboard/classes" },
];

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("leoned_user") || "{}");
        return user.name || "Admin";
      } catch {
        return "Admin";
      }
    }
    return "Admin";
  });

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between bg-white px-4 sm:px-8 border-b border-gray-200 shrink-0 gap-2">
      {/* Left: Hamburger (mobile) + Brand + Nav */}
      <div className="flex items-center gap-2 sm:gap-8 h-full min-w-0">
        {/* Hamburger for mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors p-1.5 -ml-1"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden xl:block shrink-0">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#053d26]">Academic</span>
          <br />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#053d26]">Architect</span>
        </div>

        {/* Nav tabs — scroll horizontally on medium, hide on very small */}
        <nav className="hidden sm:flex items-center gap-1 h-full overflow-x-auto no-scrollbar">
          {headerTabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`relative flex items-center h-full px-3 lg:px-4 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#053d26]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Icons, Profile */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        <div className="relative hidden lg:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-44 xl:w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
            placeholder="Search records..."
          />
        </div>

        {/* Search icon on mobile */}
        <button className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors p-1">
          <Search className="h-5 w-5" />
        </button>

        <Link href="/dashboard/settings" className="relative text-gray-500 hover:text-gray-900 transition-colors p-1">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[#b05e1c] border border-white"></span>
        </Link>

        <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-900 transition-colors p-1 hidden sm:block">
          <HelpCircle className="h-5 w-5" />
        </Link>

        <Link
          href="/dashboard/settings"
          className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm hover:border-[#053d26] transition-colors bg-[#053d26] flex items-center justify-center shrink-0"
        >
          <span className="text-white text-xs font-bold">{initials}</span>
        </Link>
      </div>
    </header>
  );
}
