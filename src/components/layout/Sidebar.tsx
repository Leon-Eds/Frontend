"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { schoolApi, resultApi, authApi, bursarApi } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";
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
  Megaphone,
  UserCheck,
  Crown,
  Sparkles
} from "lucide-react";

const schoolNavigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Student Registry", href: "/dashboard/students", icon: GraduationCap },
  { name: "Academic Flow", href: "/dashboard/classes", icon: BookOpen },
  { name: "Financials", href: "/dashboard/finance", icon: Banknote },
  { name: "Staff Directory", href: "/dashboard/faculty", icon: Users },
  { name: "Session Rollover", href: "/dashboard/rollover", icon: CalendarClock },
  { name: "Reports Hub", href: "/dashboard/reports", icon: FileText },
];

const adminNavigation = [
  { name: "Academic overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/dashboard/students", icon: GraduationCap },
  { name: "Classes", href: "/dashboard/classes", icon: BookOpen },
  { name: "Teachers", href: "/dashboard/faculty", icon: Users },
  { name: "Support Staff", href: "/dashboard/staff", icon: UserPlus },
  { name: "Fee clearance", href: "/dashboard/finance", icon: DollarSign },
  { name: "Admin approval", href: "/dashboard/approvals", icon: FileCheck },
  { name: "Scheme of Work", href: "/dashboard/faculty/scheme-of-work", icon: FileText },
  { name: "Reports Hub", href: "/dashboard/reports", icon: FileText },
  { name: "Broadcast hub", href: "/dashboard/communications", icon: Megaphone },
];

const facultyNavigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Classes", href: "/dashboard/faculty/classes", icon: FolderKanban },
  { name: "Scheme of Work", href: "/dashboard/faculty/scheme-of-work", icon: FileText },
];

const studentNavigation = [
  { name: "Dashboard", href: "/dashboard/student-portal", icon: LayoutDashboard },
  { name: "My Results", href: "/dashboard/student-portal", icon: GraduationCap },
  { name: "Fee Clearance", href: "/dashboard/student-portal", icon: Banknote },
  { name: "Attendance", href: "/dashboard/student-portal", icon: UserCheck },
];

const bursarNavigation = [
  { name: "Fee Approvals", href: "/dashboard/bursar", icon: DollarSign },
];

const superAdminNavigation = [
  { name: "Platform Overview", href: "/super-admin", icon: ShieldCheck },
  { name: "Manage Schools", href: "/super-admin/schools", icon: School },
  { name: "Global Users", href: "/super-admin/users", icon: Users },
  { name: "Billing & Plans", href: "/super-admin/plans", icon: CreditCard },
  { name: "Payment Logs", href: "/super-admin/payments", icon: Banknote },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  const [demoRole, setDemoRole] = useState<string>("Admin");
  const [schoolName, setSchoolName] = useState<string>("LeonEd");
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [plan, setPlan] = useState<string | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [pendingFeesCount, setPendingFeesCount] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const fetchPendingCount = async () => {
      try {
        const stored = localStorage.getItem("leoned_user");
        if (!stored) return;
        const user = JSON.parse(stored);
        if (user.role?.toLowerCase() === "admin") {
          const res = await resultApi.getPendingApprovalsCount();
          const pCount = (res as any)?.count ?? (res as any)?.data?.count;
          if (typeof pCount === "number") {
            setPendingApprovalsCount(pCount);
          }
          
          const feesRes = await bursarApi.getPendingCount().catch(() => null);
          const fCount = (feesRes as any)?.count ?? (feesRes as any)?.data?.count;
          if (typeof fCount === "number") {
            setPendingFeesCount(fCount);
          }
        }
      } catch (err) {
        // Silently fail if endpoint fails or returns error
      }
    };

    fetchPendingCount();
    interval = setInterval(fetchPendingCount, 15000); // Poll every 15s
    
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const handleLogoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.logoUrl) {
        setLogoUrl(customEvent.detail.logoUrl);
      }
    };
    window.addEventListener('leoned_logo_updated', handleLogoUpdate);
    return () => window.removeEventListener('leoned_logo_updated', handleLogoUpdate);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("leoned_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const normalizedRole = user.role?.toLowerCase() || "";
          setRole(normalizedRole);
          if (normalizedRole !== "superadmin" && user.schoolName) {
            setSchoolName(user.schoolName);
          } else if (normalizedRole === "superadmin") {
            setSchoolName("Platform Admin");
          }
          
          const sId = user.schoolId || user.school?.id || user.school?._id;
          let bestLogo = user.logoUrl;
          if (sId) {
            const cachedSchoolLogo = localStorage.getItem(`leoned_logo_${sId}`);
            if (cachedSchoolLogo) bestLogo = cachedSchoolLogo;
          }
          if (bestLogo) {
            setLogoUrl(bestLogo);
          }
          
          if (sId && normalizedRole !== "superadmin") {
            schoolApi.getById(sId).then((school: any) => {
              let updated = false;
              if (school && school.subscriptionPlan) {
                setPlan(school.subscriptionPlan);
              }
              if (school && school.logoUrl) {
                setLogoUrl(school.logoUrl);
                user.logoUrl = school.logoUrl;
                updated = true;
              }
              if (updated) {
                localStorage.setItem("leoned_user", JSON.stringify(user));
                localStorage.setItem(`leoned_logo_${sId}`, school.logoUrl);
              }
            }).catch(e => console.warn("Failed to fetch school details:", e));
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
          const normalizedRole = user.role?.toLowerCase();
          if (normalizedRole === "teacher" || normalizedRole === "faculty") {
            setDemoRole("Faculty");
          } else if (normalizedRole === "student" || normalizedRole === "parent" || normalizedRole === "guardian") {
            setDemoRole("Student");
          } else if (normalizedRole === "bursar") {
            setDemoRole("Bursar");
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
  if (role === "superadmin") {
    navigation = superAdminNavigation;
  } else {
    if (demoRole === "Admin" || demoRole === "School Admin") navigation = adminNavigation;
    else if (demoRole === "Faculty" || demoRole === "Teacher") navigation = facultyNavigation;
    else if (demoRole === "Student") navigation = studentNavigation;
    else if (demoRole === "Bursar") navigation = bursarNavigation;
  }

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (err) {}
    localStorage.removeItem("leoned_token");
    localStorage.removeItem("leoned_refresh_token");
    localStorage.removeItem("leoned_user");
    
    // Clear theme from DOM so login page defaults to platform colors
    try {
      document.documentElement.classList.remove('theme-forest', 'theme-ocean', 'theme-sunset', 'theme-royal', 'font-sans', 'font-serif', 'font-mono');
      document.documentElement.style.removeProperty('--theme-primary');
      document.documentElement.style.removeProperty('--theme-secondary');
      document.documentElement.style.removeProperty('--theme-accent');
    } catch(e) {}
    
    router.push("/login");
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-[#053d26] text-white shrink-0">
      {/* Logo Area */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
        <Link href={role === "superadmin" ? "/super-admin" : "/dashboard"} className="flex items-center gap-3" onClick={handleNavClick}>
          <div className="relative w-10 h-10 bg-white rounded-full overflow-hidden shrink-0 flex items-center justify-center border-2 border-white/10 shadow-sm">
            <Image
              src={logoUrl || "/logo.png"}
              alt="LeonEd"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-tight tracking-tight max-w-[150px] truncate" title={schoolName}>{schoolName}</h1>
            {role === "superadmin" ? (
              <p className="text-[10px] uppercase tracking-wider text-green-200 mt-0.5">
                {t("sidebar.super_admin")}
              </p>
            ) : role !== "student" && role !== "parent" && role !== "teacher" && role !== "faculty" && plan ? (
              <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                plan.toLowerCase() === 'gold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                plan.toLowerCase() === 'silver' ? 'bg-gray-300/20 text-gray-300 border border-gray-400/30 shadow-[0_0_8px_rgba(209,213,219,0.15)]' :
                plan.toLowerCase() === 'platinum' || plan.toLowerCase() === 'pro' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]' :
                'bg-white/10 text-green-200 border border-white/10'
              }`}>
                {plan.toLowerCase() === 'gold' || plan.toLowerCase() === 'platinum' || plan.toLowerCase() === 'pro' ? (
                  <Crown className="w-2.5 h-2.5" />
                ) : (
                  <Sparkles className="w-2.5 h-2.5" />
                )}
                <span>{plan} Plan</span>
              </div>
            ) : null}
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
      <nav className="flex-1 space-y-1 pl-4 pr-2 py-6 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
        {navigation.map((item) => {
          const isActive = 
            pathname === item.href || 
            (item.href !== "/dashboard" && 
             item.href !== "/super-admin" && 
             pathname.startsWith(item.href + "/") && 
             !navigation.some(other => other.href.length > item.href.length && pathname.startsWith(other.href)));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                isActive 
                  ? "bg-[#095838] text-white font-bold" 
                  : "text-green-100 font-medium hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-green-300"}`} />
              <span className="flex-1 text-left">{t("sidebar." + item.name.toLowerCase().replace(/['\s&]+/g, "_"))}</span>
              {item.href === "/dashboard/approvals" && pendingApprovalsCount > 0 && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)] ${isActive ? "bg-white text-[#095838] shadow-white/60" : "bg-red-500 text-white"}`}>
                  {pendingApprovalsCount}
                </span>
              )}
              {item.href === "/dashboard/finance" && pendingFeesCount > 0 && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)] ${isActive ? "bg-white text-[#095838] shadow-white/60" : "bg-red-500 text-white"}`}>
                  {pendingFeesCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>


      {/* Super Admin CTA - Quick Invite */}
      {role === "superadmin" && (
        <div className="px-4 pb-4">
          <Link
            href="/super-admin/schools"
            onClick={handleNavClick}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#b05e1c] text-white font-bold text-sm hover:bg-[#965017] transition-colors shadow-sm"
          >
            <School className="h-5 w-5" />
            {t("sidebar.register_new_school")}
          </Link>
        </div>
      )}

      {/* Upgrade CTA card for Free tier schools */}
      {role !== "superadmin" && role !== "teacher" && role !== "faculty" && role !== "student" && role !== "parent" && role !== "guardian" && plan === "Free" && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center">
          <p className="text-xs text-amber-200 font-bold mb-2">{t("sidebar.free_plan_msg")}</p>
          <Link
            href="/dashboard/settings"
            onClick={handleNavClick}
            className="block w-full py-2 bg-[#b05e1c] hover:bg-[#965017] text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            {t("sidebar.upgrade_plan")}
          </Link>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t border-white/10 p-4 space-y-1">
        {role !== "student" && role !== "parent" && role !== "guardian" && demoRole !== "Student" && (
          <Link
            href={role === "superadmin" ? "/super-admin/settings" : "/dashboard/settings"}
            onClick={handleNavClick}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings className="h-5 w-5 text-green-300" />
            {t("nav.settings")}
          </Link>
        )}
        <Link
          href="/support"
          onClick={handleNavClick}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/5 hover:text-white transition-colors"
        >
          <HelpCircle className="h-5 w-5 text-green-300" />
          {t("footer.support.item1")}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
        >
          <LogOut className="h-5 w-5 text-green-300" />
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}

