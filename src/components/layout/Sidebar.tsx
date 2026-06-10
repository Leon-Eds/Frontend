"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { schoolApi } from "@/lib/api";
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
  CalendarClock,
  School,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  FileCheck,
  FileText,
  DollarSign,
  FolderKanban,
  CheckSquare,
  Calendar,
  Megaphone
} from "lucide-react";

const schoolNavigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Student Registry", href: "/dashboard/students", icon: GraduationCap },
  { name: "Academic Flow", href: "/dashboard/classes", icon: BookOpen },
  { name: "Financials", href: "/dashboard/finance", icon: Banknote },
  { name: "Staff Directory", href: "/dashboard/faculty", icon: Users },
  { name: "Session Rollover", href: "/dashboard/rollover", icon: CalendarClock },
];

const adminNavigation = [
  { name: "Academic overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/dashboard/students", icon: GraduationCap },
  { name: "Teachers' overview", href: "/dashboard/faculty", icon: Users },
  { name: "Students' report", href: "/dashboard/student-reports", icon: FileText },
  { name: "Fee clearance", href: "/dashboard/finance", icon: DollarSign },
  { name: "Admin approval", href: "/dashboard/approvals", icon: FileCheck },
  { name: "Broadcast hub", href: "/dashboard/communications", icon: Megaphone },
];

const facultyNavigation = [
  { name: "My Classes", href: "/dashboard/faculty/classes", icon: FolderKanban },
  { name: "Result Entry", href: "/dashboard/faculty/result-entry", icon: CheckSquare },
  { name: "Schedule", href: "/dashboard/faculty", icon: Calendar },
  { name: "My Profile", href: "/dashboard/faculty", icon: Users },
];

const studentNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/dashboard/student-portal", icon: GraduationCap },
  { name: "Teachers", href: "/dashboard", icon: Users },
  { name: "Classes", href: "/dashboard", icon: BookOpen },
  { name: "Finance", href: "/dashboard", icon: Banknote },
  { name: "Reports", href: "/dashboard/student-portal", icon: FileText },
];

const superAdminNavigation = [
  { name: "Platform Overview", href: "/super-admin", icon: ShieldCheck },
  { name: "Manage Schools", href: "/super-admin/schools", icon: School },
  { name: "Global Users", href: "/super-admin/users", icon: Users },
  { name: "Billing & Plans", href: "/super-admin/plans", icon: CreditCard },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [demoRole, setDemoRole] = useState<string>("Admin");
  const [schoolName, setSchoolName] = useState<string>("LeonEd Africa");
  const [plan, setPlan] = useState<string>("Free");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("leoned_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setRole(user.role);
          if (user.role !== "SuperAdmin" && user.schoolName) {
            setSchoolName(user.schoolName);
          } else if (user.role === "SuperAdmin") {
            setSchoolName("Platform Admin");
          }
          if (user.schoolId && user.role !== "SuperAdmin") {
            schoolApi.getById(user.schoolId).then((school: any) => {
              if (school && school.subscriptionPlan) {
                setPlan(school.subscriptionPlan);
              }
            }).catch(e => console.warn("Failed to fetch school plan:", e));
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
      
      // Auto resolve demo role from actual role to avoid demo artifacts
      const storedUser = localStorage.getItem("leoned_user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.role === "Teacher" || user.role === "Faculty") {
            setDemoRole("Faculty");
          } else if (user.role === "Student") {
            setDemoRole("Student");
          } else {
            setDemoRole(localStorage.getItem("leoned_demo_role") || "Admin");
          }
        } catch {}
      } else {
        setDemoRole(localStorage.getItem("leoned_demo_role") || "Admin");
      }
    }
  }, []);

  let navigation = schoolNavigation;
  if (role === "SuperAdmin") {
    navigation = superAdminNavigation;
  } else {
    if (demoRole === "Admin") navigation = adminNavigation;
    else if (demoRole === "Faculty") navigation = facultyNavigation;
    else if (demoRole === "Student") navigation = studentNavigation;
  }

  const handleLogout = () => {
    localStorage.removeItem("leoned_token");
    localStorage.removeItem("leoned_refresh_token");
    localStorage.removeItem("leoned_user");
    router.push("/login");
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-[#053d26] text-white shrink-0">
      {/* Logo Area */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
        <Link href={role === "SuperAdmin" ? "/super-admin" : "/dashboard"} className="flex items-center gap-3" onClick={handleNavClick}>
          <Image
            src="/logo.png"
            alt="LeonEd Africa"
            width={40}
            height={40}
            className="object-contain rounded-lg"
          />
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight max-w-[150px] truncate" title={schoolName}>{schoolName}</h1>
            <p className="text-[10px] uppercase tracking-wider text-green-200 mt-0.5">
              {role === "SuperAdmin" ? "Super Admin" : "Academic Architect"}
            </p>
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
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/super-admin" && pathname.startsWith(item.href));
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

      {/* Enroll CTA - Only for Schools */}
      {role !== "SuperAdmin" && role !== "Teacher" && role !== "Faculty" && role !== "Student" && demoRole === "Admin" && (
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
      )}

      {/* Super Admin CTA - Quick Invite */}
      {role === "SuperAdmin" && (
        <div className="px-4 pb-4">
          <Link
            href="/super-admin/schools"
            onClick={handleNavClick}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#b05e1c] text-white font-bold text-sm hover:bg-[#965017] transition-colors shadow-sm"
          >
            <School className="h-5 w-5" />
            Register New School
          </Link>
        </div>
      )}

      {/* Upgrade CTA card for Free tier schools */}
      {role !== "SuperAdmin" && role !== "Teacher" && role !== "Faculty" && role !== "Student" && plan === "Free" && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center">
          <p className="text-xs text-amber-200 font-bold mb-2">You are on the Free Plan</p>
          <Link
            href="/dashboard/settings"
            onClick={handleNavClick}
            className="block w-full py-2 bg-[#b05e1c] hover:bg-[#965017] text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t border-white/10 p-4 space-y-1">
        <Link
          href={role === "SuperAdmin" ? "/super-admin/settings" : "/dashboard/settings"}
          onClick={handleNavClick}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5 text-green-300" />
          Settings
        </Link>
        <Link
          href="/support"
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

