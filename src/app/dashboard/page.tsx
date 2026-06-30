"use client";

import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dashboardApi, DashboardStats, sessionApi, schoolApi } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import DataTable from "@/components/dashboard/DataTable";
import SetupGuide from "@/components/dashboard/SetupGuide";
import { GraduationCap, Users, FileText, UserPlus, FileOutput, Plus, Loader2, BookOpen, Calendar, Settings, CreditCard, X, Zap } from "lucide-react";

const AVAILABLE_SHORTCUTS = [
  { id: 'new-student', title: 'Add New Student', desc: 'Onboard a fresh learner profile', href: '/dashboard/students/new', color: 'bg-[#053d26]', iconBg: 'bg-white/10', iconColor: 'text-white', icon: UserPlus, titleColor: 'text-white', descColor: 'text-green-200' },
  { id: 'report-cards', title: 'Generate Report Cards', desc: 'Bulk process academic summaries', href: '/dashboard/classes', color: 'bg-[#b05e1c]', iconBg: 'bg-white/20', iconColor: 'text-white', icon: FileOutput, titleColor: 'text-white', descColor: 'text-orange-100' },
  { id: 'fee-clearance', title: 'Fee Clearance', desc: 'Process tuition and payments', href: '/dashboard/finance', color: 'bg-blue-600', iconBg: 'bg-white/20', iconColor: 'text-white', icon: CreditCard, titleColor: 'text-white', descColor: 'text-blue-100' },
  { id: 'teachers', title: 'Manage Teachers', desc: 'View and assign faculty', href: '/dashboard/faculty', color: 'bg-purple-600', iconBg: 'bg-white/20', iconColor: 'text-white', icon: Users, titleColor: 'text-white', descColor: 'text-purple-100' },
  { id: 'settings', title: 'System Settings', desc: 'Configure school preferences', href: '/dashboard/settings', color: 'bg-gray-800', iconBg: 'bg-white/20', iconColor: 'text-white', icon: Settings, titleColor: 'text-white', descColor: 'text-gray-300' }
];

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [hasSessions, setHasSessions] = useState<boolean>(true);
  const [hasTerms, setHasTerms] = useState<boolean>(true);

  const [shortcutIds, setShortcutIds] = useState<string[]>(['new-student', 'report-cards']);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [tempShortcuts, setTempShortcuts] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("leoned_shortcuts");
      if (saved) setShortcutIds(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleSaveShortcuts = () => {
    setShortcutIds(tempShortcuts);
    localStorage.setItem("leoned_shortcuts", JSON.stringify(tempShortcuts));
    setIsShortcutModalOpen(false);
    toast.success("Shortcuts updated successfully!");
  };

  const toggleShortcut = (id: string) => {
    if (tempShortcuts.includes(id)) {
      setTempShortcuts(tempShortcuts.filter(s => s !== id));
    } else {
      if (tempShortcuts.length >= 4) {
        toast.error("You can pin a maximum of 4 shortcuts.");
        return;
      }
      setTempShortcuts([...tempShortcuts, id]);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("leoned_user");
    const token = localStorage.getItem("leoned_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser || "{}");
      setUser(parsedUser);

      // Upgrade Prompt Logic — check both localStorage and fresh backend data
      const checkPlan = async () => {
        let currentPlan = parsedUser.subscriptionPlan || "Free";
        
        // Try to refresh plan from backend if school admin
        if (parsedUser.role !== "SuperAdmin" && parsedUser.schoolId) {
          try {
            const school = await schoolApi.getById(parsedUser.schoolId) as any;
            if (school && school.subscriptionPlan) {
              currentPlan = school.subscriptionPlan;
              // Update localStorage so it stays fresh
              if (currentPlan !== parsedUser.subscriptionPlan) {
                const updatedUser = { ...parsedUser, subscriptionPlan: currentPlan };
                localStorage.setItem("leoned_user", JSON.stringify(updatedUser));
              }
            }
          } catch (_) {
            // Silently fall back to localStorage value
          }
        }
        
        if (parsedUser.role !== "SuperAdmin" && (!currentPlan || currentPlan === "Free")) {
          const dismissed = localStorage.getItem("leoned_upgrade_dismissed");
          if (!dismissed) {
            setShowUpgradePrompt(true);
          }
        }
      };
      
      checkPlan();

      const userRole = parsedUser.role?.toLowerCase();
      if (userRole === "teacher" || userRole === "faculty") {
        router.push("/dashboard/faculty");
        return;
      }
      if (userRole === "student" || userRole === "parent" || userRole === "guardian") {
        router.push("/dashboard/student-portal");
        return;
      }

      // 1. Fallback redirect if legacy demo role is set
      const demoRole = localStorage.getItem("leoned_demo_role");
      if (demoRole === "Faculty") {
        router.push("/dashboard/faculty");
        return;
      }
      if (demoRole === "Student") {
        router.push("/dashboard/student-portal");
        return;
      }

      const fetchDashboard = async () => {
        try {
          // Choose appropriate endpoint based on role
          const data = userRole === "superadmin" 
            ? await dashboardApi.getSuperAdminDashboard()
            : await dashboardApi.getSchoolDashboard();
          
          const schoolId = parsedUser.schoolId || 'default';

          // Check if academic session and term are set
          if (userRole !== "superadmin") {
            try {
              const sessions = await sessionApi.getAll().catch(() => []);
              const currentSession = sessions.find((s: any) => s.isCurrent);
              setHasSessions(sessions.length > 0 && !!currentSession);
              const currentTerm = currentSession?.terms?.find((t: any) => t.isCurrent);
              setHasTerms(!!currentTerm);
            } catch (sessionErr) {
              console.warn("Failed to fetch sessions/terms:", sessionErr);
            }
          }
          
          const localActivities = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(`leoned_local_activities_${schoolId}`) || '[]') : [];
          const apiActivities = data?.recentActivities || [];
          const combined = [...localActivities, ...apiActivities].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setStats({
            ...data,
            recentActivities: combined
          });
        } catch (err: unknown) {
          console.error("[Dashboard] Failed to fetch dashboard data.", err);
          const schoolId = parsedUser.schoolId || 'default';
          const localActivities = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(`leoned_local_activities_${schoolId}`) || '[]') : [];
          setStats({ recentActivities: localActivities });
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboard();
    } catch (err) {
      router.push("/login");
    }
  }, [router]);

  const userName = user?.name || "Admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load dashboard</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Support nested data property and fallback field names
  const s = (stats as any)?.data || stats;
  const totalStudents = s?.totalStudents ?? s?.totalCount ?? 0;
  const totalTeachers = s?.totalTeachers ?? s?.facultyCount ?? 0;
  const totalClasses = s?.totalClasses ?? 0;
  
  const studentsDisplay = totalStudents.toLocaleString();
  const teachersDisplay = totalTeachers.toLocaleString();
  const currentTerm = s?.currentTerm ?? "N/A";
  const currentSession = s?.currentSession ?? "";
  const termProgress = s?.termProgress ?? 0;
  const termLabel = currentTerm + (currentSession ? ` ${currentSession}` : "");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">School Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {userName.split(' ')[0]}. Here is your campus overview for the <span className="text-[#b05e1c] font-semibold">{termLabel}</span>.
        </p>
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-in slide-in-from-top duration-500">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Unlock Premium Features</h3>
              <p className="text-sm text-gray-600">You are currently on the Free plan. Upgrade to a premium plan to unlock unlimited students, teachers, and advanced analytics.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setShowUpgradePrompt(false);
                localStorage.setItem("leoned_upgrade_dismissed", "true");
              }}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-white/50 rounded-xl transition-colors"
            >
              Dismiss
            </button>
            <Link
              href="/dashboard/settings?section=billing"
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-all hover:shadow-lg text-sm"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}

      {/* Warning if no teachers created */}
      {user?.role !== "SuperAdmin" && totalTeachers === 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No teachers registered yet</h3>
            <p className="text-sm text-gray-600">Register your faculty members to assign them to classes and enable academic flow.</p>
          </div>
          <Link href="/dashboard/faculty" className="px-6 py-3 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] text-sm shrink-0 shadow-sm text-center">
            Register a Teacher
          </Link>
        </div>
      )}

      {/* Admin Setup Guide */}
      <SetupGuide />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={studentsDisplay}
          icon={<GraduationCap className="h-6 w-6" />}
        />
        <StatCard
          title="Faculty Members"
          value={teachersDisplay}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Total Classes"
          value={String(totalClasses)}
          icon={<BookOpen className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconTextColor="text-blue-600"
        />
        {/* Active Term Card */}
        <Link href="/dashboard/rollover" className="block rounded-3xl bg-[#053d26] p-6 shadow-sm flex flex-col justify-between text-white relative overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer">
          {/* subtle decorative circles */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute right-8 -bottom-8 h-32 w-32 rounded-full bg-white/5" />
          
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-200 mb-4">
              Active Term
            </p>
            <p className="text-3xl font-bold mb-8 leading-tight">
              {termLabel.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </p>
            
            <div className="space-y-2">
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-200 rounded-full" 
                  style={{ width: `${termProgress}%` }}
                />
              </div>
              <p className="text-xs text-green-200 font-medium">
                {termProgress}% of term completed
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Area: Table and Quick Actions side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DataTable activities={stats?.recentActivities} />
        </div>
        
        {/* Right Sidebar Area */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {shortcutIds.map(id => {
                const shortcut = AVAILABLE_SHORTCUTS.find(s => s.id === id);
                if (!shortcut) return null;
                const Icon = shortcut.icon;
                return (
                  <Link key={id} href={shortcut.href} className={`w-full rounded-2xl ${shortcut.color} p-4 text-left flex items-center gap-4 transition-transform hover:scale-[1.02] shadow-sm`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${shortcut.iconBg} ${shortcut.iconColor} shrink-0`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className={`font-bold ${shortcut.titleColor} text-lg`}>{shortcut.title}</div>
                      <div className={`text-sm ${shortcut.descColor} leading-tight mt-1`}>{shortcut.desc}</div>
                    </div>
                  </Link>
                );
              })}

              <button 
                onClick={() => {
                  setTempShortcuts(shortcutIds);
                  setIsShortcutModalOpen(true);
                }}
                className="w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 p-4 text-center transition-colors hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-100 dark:hover:bg-white/10 flex flex-col items-center justify-center h-28 gap-2 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="font-bold text-gray-700 dark:text-gray-300">Customize Shortcuts</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Overlay Modal if no session/term */}
      {user?.role !== "SuperAdmin" && (!hasSessions || !hasTerms) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-orange-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6 text-orange-600 animate-bounce">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Academic Session Required</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              You need an active academic session and term to use LeonEd Africa. Most features (including grade entries, fee tracking, and reports) rely on this timeline.
            </p>
            <Link 
              href="/dashboard/rollover" 
              className="w-full py-4 rounded-2xl bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-all shadow-md text-center cursor-pointer"
            >
              Set Up Session &amp; Term Now
            </Link>
          </div>
        </div>
      )}
      {/* Shortcut Customization Modal */}
      {isShortcutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Customize Shortcuts</h3>
              <button onClick={() => setIsShortcutModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Select up to 4 quick actions to pin to your dashboard for easy access.
            </p>
            <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
              {AVAILABLE_SHORTCUTS.map(shortcut => {
                const isSelected = tempShortcuts.includes(shortcut.id);
                const Icon = shortcut.icon;
                return (
                  <div 
                    key={shortcut.id}
                    onClick={() => toggleShortcut(shortcut.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-[#053d26] bg-green-50 dark:bg-green-900/20 dark:border-green-500' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${shortcut.color} text-white shrink-0 shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white text-sm">{shortcut.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{shortcut.desc}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#053d26] bg-[#053d26] dark:border-green-500 dark:bg-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
              <button 
                onClick={() => setIsShortcutModalOpen(false)}
                className="px-6 py-3 rounded-full font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveShortcuts}
                className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
