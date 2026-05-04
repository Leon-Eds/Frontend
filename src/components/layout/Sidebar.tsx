"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Banknote, 
  Settings, 
  HelpCircle,
  LogOut,
  Shield,
  UserPlus
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Student Registry", href: "/dashboard/students", icon: GraduationCap },
  { name: "Academic Flow", href: "/dashboard/classes", icon: BookOpen },
  { name: "Financials", href: "/dashboard/finance", icon: Banknote },
  { name: "Staff Directory", href: "/dashboard/faculty", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-[#053d26] text-white shrink-0">
      {/* Logo Area */}
      <div className="flex h-20 items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#053d26]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">LeonEd Africa</h1>
            <p className="text-[10px] uppercase tracking-wider text-green-200 mt-1">Academic Architect</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
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
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#b05e1c] text-white font-bold text-sm hover:bg-[#965017] transition-colors shadow-sm"
        >
          <UserPlus className="h-5 w-5" />
          Enroll New Student
        </Link>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-white/10 p-4 space-y-1">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/5 hover:text-white transition-colors"
        >
          <HelpCircle className="h-5 w-5 text-green-300" />
          Help Center
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 text-green-300" />
          Logout
        </Link>
      </div>
    </div>
  );
}
