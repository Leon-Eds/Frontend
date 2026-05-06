"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Banknote, 
  Settings, 
  HelpCircle,
  LogOut,
  UserPlus,
  X,
  CalendarClock
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Student Registry", href: "/dashboard/students", icon: GraduationCap },
  { name: "Academic Flow", href: "/dashboard/classes", icon: BookOpen },
  { name: "Financials", href: "/dashboard/finance", icon: Banknote },
  { name: "Staff Directory", href: "/dashboard/faculty", icon: Users },
  { name: "Session Rollover", href: "/dashboard/rollover", icon: CalendarClock },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("leoned_token");
    localStorage.removeItem("leoned_refresh_token");
    localStorage.removeItem("leoned_user");
    router.push("/");
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigating
    onClose?.();
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-[#053d26] text-white shrink-0">
      {/* Logo Area */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={handleNavClick}>
          <Image
            src="/logo.png"
            alt="LeonEd Africa"
            width={40}
            height={40}
            className="object-contain rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">LeonEd Africa</h1>
            <p className="text-[10px] uppercase tracking-wider text-green-200 mt-1">Academic Architect</p>
          </div>
        </Link>
        {/* Close button visible only on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden text-green-200 hover:text-white transition-colors p-1"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[#095838] text-white" 
                  : "text-green-100 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-green-300"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Enroll CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/dashboard/students/new"
          onClick={handleNavClick}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#b05e1c] text-white font-bold text-sm hover:bg-[#965017] transition-colors shadow-sm"
        >
          <UserPlus className="h-5 w-5" />
          Enroll New Student
        </Link>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-white/10 p-4 space-y-1">
        <Link
          href="/dashboard/settings"
          onClick={handleNavClick}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/5 hover:text-white transition-colors"
        >
          <HelpCircle className="h-5 w-5 text-green-300" />
          Help Center
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
        >
          <LogOut className="h-5 w-5 text-green-300" />
          Logout
        </button>
      </div>
    </div>
  );
}
