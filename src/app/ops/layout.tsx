"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Rocket,
  CheckSquare,
  Activity,
  LifeBuoy,
  ShieldAlert,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  Plus
} from "lucide-react";

import { authApi } from "@/lib/api";

const sidebarNav = [
  { name: "Deployment", href: "/ops/deployment", icon: Rocket },
  { name: "QA Testing", href: "/ops/qa", icon: CheckSquare },
  { name: "System Health", href: "/ops/health", icon: Activity },
  { name: "User Support", href: "/ops/support", icon: LifeBuoy },
  { name: "Security", href: "/ops/security", icon: ShieldAlert },
];

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("A. Okoro");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("leoned_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.name) setUserName(user.name);
        } catch {}
      }
    }
  }, []);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      try { await authApi.logout(); } catch (err) {}
      localStorage.removeItem("leoned_token");
      localStorage.removeItem("leoned_user");
      
      // Clear theme from DOM so login page defaults to platform colors
      try {
        document.documentElement.classList.remove('theme-forest', 'theme-ocean', 'theme-sunset', 'theme-royal', 'font-sans', 'font-serif', 'font-mono');
        document.documentElement.style.removeProperty('--theme-primary');
        document.documentElement.style.removeProperty('--theme-secondary');
        document.documentElement.style.removeProperty('--theme-accent');
      } catch(e) {}
      
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f4f6f8] text-gray-950 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between bg-[#032d1d] px-6 text-white shrink-0 shadow-md z-40">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-wider text-base uppercase">
            LeonEd Ops
          </span>
        </div>

        {/* Center: Main Nav Links */}
        <nav className="flex items-center gap-6 h-full text-xs font-semibold tracking-wider uppercase">
          <Link
            href="/ops/qa"
            className={`relative flex items-center h-full px-2 transition-colors duration-150 ${
              pathname === "/ops/qa" || pathname === "/ops/health"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#b05e1c]"
                : "text-green-200/70 hover:text-white"
            }`}
          >
            System Status
          </Link>
          <Link
            href="/ops/security"
            className={`relative flex items-center h-full px-2 transition-colors duration-150 ${
              pathname === "/ops/security"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#b05e1c]"
                : "text-green-200/70 hover:text-white"
            }`}
          >
            Security Logs
          </Link>
          <Link
            href="/ops/support"
            className={`relative flex items-center h-full px-2 transition-colors duration-150 ${
              pathname === "/ops/support"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#b05e1c]"
                : "text-green-200/70 hover:text-white"
            }`}
          >
            Documentation
          </Link>
        </nav>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="text-green-200/70 hover:text-white transition-colors p-1 relative">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-[#b05e1c]"></span>
          </button>
          <button className="text-green-200/70 hover:text-white transition-colors p-1">
            <SettingsIcon className="h-[18px] w-[18px]" />
          </button>
          
          {/* Divider */}
          <div className="h-5 w-px bg-white/10 mx-1"></div>

          {/* User profile dropdown proxy */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20 shadow-sm group-hover:border-white transition-colors bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white uppercase">
                {userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main portal body */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-sm z-30">
          <div className="flex flex-col p-4 space-y-6">
            {/* Sidebar Title */}
            <div className="px-3 py-1.5">
              <h2 className="text-xs font-extrabold tracking-wider text-gray-950 uppercase">
                Admin Console
              </h2>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase mt-0.5">
                Technical Operations
              </p>
            </div>

            {/* Sidebar Items */}
            <nav className="flex flex-col space-y-1.5">
              {sidebarNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between rounded-l-2xl pl-4 pr-1 py-3 text-xs font-bold tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-white text-gray-900 shadow-sm border-r-[4px] border-[#b05e1c]"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-[#b05e1c]" : "text-gray-400"}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Action button inside Sidebar */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("trigger-new-deployment"));
                  }
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#053d26] text-white font-bold text-xs hover:bg-[#042d1c] transition-colors shadow-sm tracking-wider uppercase"
              >
                <Plus className="h-4 w-4" />
                New Deployment
              </button>
            </div>
          </div>

          {/* Logout at bottom */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold tracking-wide text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <LogOut className="h-[18px] w-[18px] text-gray-400" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto bg-[#f4f6f8] relative">
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
