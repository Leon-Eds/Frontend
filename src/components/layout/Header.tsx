"use client";

import { Search, Bell, HelpCircle } from "lucide-react";
import { mockUser } from "@/lib/mocks/user";
import Link from "next/link";
import { usePathname } from "next/navigation";

const headerTabs = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Students", href: "/dashboard/students" },
  { name: "Faculty", href: "/dashboard/faculty" },
  { name: "Reports", href: "/dashboard/reports" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center justify-between bg-white px-8 border-b border-gray-200 shrink-0">
      {/* Left: Brand Label + Navigation Tabs */}
      <div className="flex items-center gap-8 h-full">
        <div className="hidden lg:block">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#053d26]">Academic</span>
          <br />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#053d26]">Architect</span>
        </div>

        <nav className="flex items-center gap-1 h-full">
          {headerTabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`relative flex items-center h-full px-4 text-sm font-semibold transition-colors ${
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
      <div className="flex items-center gap-5">
        <div className="relative hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
            placeholder="Search academic records..."
          />
        </div>

        <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#b05e1c] border border-white"></span>
        </button>

        <button className="text-gray-500 hover:text-gray-900 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm cursor-pointer hover:border-[#053d26] transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={mockUser.avatar} 
            alt={mockUser.name} 
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
