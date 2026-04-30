"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Banknote, 
  BarChart2, 
  Settings, 
  HelpCircle,
  Shield
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/dashboard/students", icon: GraduationCap },
  { name: "Faculty", href: "/dashboard/faculty", icon: Users },
  { name: "Classes", href: "/dashboard/classes", icon: BookOpen },
  { name: "Finance", href: "/dashboard/finance", icon: Banknote },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart2 },
];

const secondaryNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-[#053d26] text-white">
      {/* Logo Area */}
      <div className="flex h-20 items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#e8f5e9] text-[#053d26]">
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
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
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

      {/* Secondary Navigation */}
      <div className="border-t border-white/10 p-4 space-y-1">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[#095838] text-white" 
                  : "text-green-100 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 text-green-300" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
